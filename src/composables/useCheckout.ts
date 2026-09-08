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

/**
 * Dos fases: formulario → pedido creado. Al crear el pedido el backend fija
 * precios y totales. Con tarjeta devuelve la cajita de PayPhone y se cobra
 * aquí mismo; con transferencia o efectivo el pedido queda reservado y se
 * sigue en la página del pedido (cuentas, comprobante, mensajes).
 */
export function useCheckout() {
  const cart = useCartStore()
  const router = useRouter()

  const config = ref<ShopConfig | null>(null)
  const loadingConfig = ref(true)
  const submitting = ref(false)
  const error = ref('')
  const payphone = ref<PayphoneBoxParams | null>(null)
  const orderNumber = ref('')

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
      method: (saved.shippingMethod as ShippingMethod) || 'pickup-garzota',
      address: saved.address ?? '',
      city: saved.city ?? '',
      reference: saved.reference ?? '',
      notes: '',
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
      }),
    { deep: true },
  )

  orderService
    .config()
    .then((c) => (config.value = c))
    .catch((e: ApiError) => (error.value = e.message))
    .finally(() => (loadingConfig.value = false))

  const shippingCost = computed(
    () => config.value?.shippingMethods.find((m) => m.key === form.shipping.method)?.cost ?? 0,
  )
  const taxIncluded = computed(() => config.value?.taxIncluded ?? true)
  // Los precios ya traen IVA: se desglosa para mostrarlo, no se suma al total.
  const tax = computed(() => {
    const rate = config.value?.taxRate ?? 0
    return round2(
      taxIncluded.value ? cart.subtotal - cart.subtotal / (1 + rate) : cart.subtotal * rate,
    )
  })
  const total = computed(() =>
    round2(cart.subtotal + shippingCost.value + (taxIncluded.value ? 0 : tax.value)),
  )
  const needsAddress = computed(() => !form.shipping.method.startsWith('pickup'))

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
    if (form.payment.method === 'transfer') return 'Confirmar y ver cuentas'
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
      // Transferencia o efectivo: el pedido ya quedó reservado.
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
    shippingCost,
    tax,
    taxIncluded,
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
