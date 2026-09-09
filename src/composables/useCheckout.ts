import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { orderService } from '@/services/order.service'
import { useCartStore } from '@/stores/cart'
import { paymentMethods } from '@/config/orders'
import type {
  ApiError,
  CheckoutInput,
  PaymentMethod,
  PayphoneBoxParams,
  ShopConfig,
  ShippingMethod,
} from '@/types'
import { rememberCustomer, savedCustomer } from '@/utils/customer'
import { rememberOrder } from '@/utils/myOrders'
import { useToastStore } from '@/stores/toast'
import { useDeliveryQuote } from '@/composables/useDeliveryQuote'
import { cardFeeFor } from '@/utils/pricing'

/**
 * Dos fases: formulario → pedido creado. Al crear el pedido el backend fija
 * precios y totales. Con tarjeta devuelve la cajita de PayPhone y se cobra
 * aquí mismo; con transferencia o efectivo el pedido queda reservado y se
 * sigue en la página del pedido (cuentas, comprobante, mensajes).
 */
export function useCheckout() {
  const cart = useCartStore()
  const router = useRouter()
  const toast = useToastStore()

  const config = ref<ShopConfig | null>(null)
  const loadingConfig = ref(true)
  const submitting = ref(false)
  const error = ref('')
  const payphone = ref<PayphoneBoxParams | null>(null)
  const orderNumber = ref('')
  /** Comprobante elegido en el checkout con transferencia; sube apenas existe el pedido. */
  const proof = ref<File | null>(null)
  const proofNote = ref('')

  const saved = savedCustomer()
  const form = reactive<CheckoutInput>({
    customer: {
      name: saved.name ?? '',
      email: saved.email ?? '',
      phone: saved.phone ?? '',
      documentId: saved.documentId ?? '',
    },
    billing: {
      wanted: false,
      sameAsCustomer: true,
      documentId: '',
      name: '',
      email: '',
      phone: '',
    },
    shipping: {
      method: (saved.shippingMethod as ShippingMethod) || '',
      address: saved.address ?? '',
      city: saved.city ?? '',
      reference: saved.reference ?? '',
      notes: '',
      location: saved.location ?? '',
    },
    payment: { method: 'payphone' },
    items: [],
  })

  // Lo que el cliente escribe se recuerda en el dispositivo: sirve para la
  // próxima compra y para que WhatsApp salga con sus datos.
  watch(
    () => [form.customer, form.shipping],
    () =>
      rememberCustomer({
        ...form.customer,
        shippingMethod: form.shipping.method,
        address: form.shipping.address,
        city: form.shipping.city,
        reference: form.shipping.reference,
        location: form.shipping.location,
      }),
    { deep: true },
  )

  orderService
    .config()
    .then((c) => {
      config.value = c
      // El método guardado puede haber sido apagado por el admin: se cae al primero activo.
      if (!c.shippingMethods.some((m) => m.key === form.shipping.method)) {
        form.shipping.method = c.shippingMethods[0]?.key ?? ''
      }
    })
    .catch((e: ApiError) => (error.value = e.message))
    .finally(() => (loadingConfig.value = false))

  const shippingMethod = computed(() => config.value?.shippingMethods.find((m) => m.key === form.shipping.method))
  const byDistance = computed(() => shippingMethod.value?.kind === 'distance')
  // Moto: el precio sale de la cotización del backend según la ubicación marcada.
  const { quote, resolving: quoting } = useDeliveryQuote(
    computed(() => form.shipping.location),
    byDistance,
  )
  const shippingCost = computed(() => (byDistance.value ? (quote.value?.cost ?? 0) : (shippingMethod.value?.cost ?? 0)))
  const taxIncluded = computed(() => config.value?.taxIncluded ?? true)
  // Los precios ya traen IVA: se desglosa para mostrarlo, no se suma al total.
  const tax = computed(() => {
    const rate = config.value?.taxRate ?? 0
    return round2(
      taxIncluded.value ? cart.subtotal - cart.subtotal / (1 + rate) : cart.subtotal * rate,
    )
  })
  // Comisión de PayPhone solo con tarjeta; con transferencia o efectivo el precio es el de tienda.
  const cardFee = computed(() =>
    form.payment.method === 'payphone' ? cardFeeFor(cart.subtotal + shippingCost.value, config.value?.cardFeeRate) : 0,
  )
  const total = computed(() =>
    round2(cart.subtotal + shippingCost.value + (taxIncluded.value ? 0 : tax.value) + cardFee.value),
  )
  const needsAddress = computed(() => !form.shipping.method.startsWith('pickup'))
  /** Con moto no se puede confirmar hasta tener una ubicación cotizada dentro del radio. */
  const locationReady = computed(() => !byDistance.value || (!quoting.value && quote.value?.cost != null))

  /** Métodos que aplican a este pedido: efectivo solo con retiro; el resto según el admin. */
  const availableMethods = computed(() => {
    const c = config.value
    if (!c) return []
    return paymentMethods.filter((m) => {
      if (m.key === 'payphone') return Boolean(c.payphone)
      if (m.key === 'transfer') return c.payments.transfer.enabled
      return c.payments.cash.enabled && !needsAddress.value
    })
  })
  watch(availableMethods, (list) => {
    if (list.length && !list.some((m) => m.key === form.payment.method))
      form.payment.method = list[0]!.key
  })

  const submitLabel = computed(() => {
    if (form.payment.method === 'transfer') return proof.value ? 'Confirmar y enviar comprobante' : 'Confirmar pedido'
    if (form.payment.method === 'cash') return 'Reservar y pagar en tienda'
    return 'Continuar al pago'
  })

  function setMethod(method: ShippingMethod) {
    form.shipping.method = method
  }

  function setPayment(method: PaymentMethod) {
    form.payment.method = method
  }

  async function submit() {
    error.value = ''
    submitting.value = true
    try {
      form.items = cart.lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        qty: l.qty,
      }))
      const result = await orderService.create(form)
      const token = result.order.clientTransactionId
      orderNumber.value = result.order.number
      rememberOrder({
        token,
        number: result.order.number,
        total: result.order.total,
        createdAt: result.order.createdAt,
      })
      if (result.payphone) {
        payphone.value = result.payphone
        // El carrito se limpia recién cuando PayPhone confirma; si el cliente
        // cancela el pago, sigue teniendo sus productos.
        try {
          sessionStorage.setItem('pantuflasec.pendingOrder', token)
        } catch {
          /* sin sessionStorage no pasa nada */
        }
        return
      }
      // Transferencia o efectivo: el pedido ya quedó reservado. El comprobante
      // va a Cloudinary amarrado al pedido; si falla, se puede subir después.
      if (form.payment.method === 'transfer' && proof.value) {
        try {
          await orderService.uploadProof(token, proof.value, proofNote.value)
        } catch (e) {
          toast.error(`El pedido quedó creado, pero el comprobante no subió: ${(e as ApiError).message}`)
        }
      }
      cart.clear()
      router.push({ name: 'Order', params: { code: token }, query: { nuevo: '1' } })
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      submitting.value = false
    }
  }

  return {
    cart,
    config,
    loadingConfig,
    submitting,
    error,
    form,
    payphone,
    orderNumber,
    proof,
    proofNote,
    shippingCost,
    byDistance,
    quote,
    quoting,
    locationReady,
    tax,
    taxIncluded,
    cardFee,
    total,
    needsAddress,
    availableMethods,
    submitLabel,
    setMethod,
    setPayment,
    submit,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
