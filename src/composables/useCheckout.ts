import { computed, reactive, ref } from 'vue'
import { orderService } from '@/services/order.service'
import { useCartStore } from '@/stores/cart'
import type { ApiError, CheckoutInput, PayphoneBoxParams, ShopConfig, ShippingMethod } from '@/types'
import { rememberCustomer, savedCustomer } from '@/utils/customer'
import { watch } from 'vue'

/**
 * Dos fases: formulario → pedido creado. Al crear el pedido el backend fija
 * precios y totales, y devuelve los parámetros de la cajita de PayPhone,
 * que se pinta en la página para cobrar sin salir de la tienda.
 */
export function useCheckout() {
  const cart = useCartStore()

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
    shipping: {
      method: (saved.shippingMethod as ShippingMethod) || 'pickup-garzota',
      address: saved.address ?? '',
      city: saved.city ?? '',
      reference: saved.reference ?? '',
      notes: '',
    },
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
  const tax = computed(() => round2(cart.subtotal * (config.value?.taxRate ?? 0)))
  const total = computed(() => round2(cart.subtotal + shippingCost.value + tax.value))
  const needsAddress = computed(() => !form.shipping.method.startsWith('pickup'))
  const payphoneReady = computed(() => Boolean(config.value?.payphone))

  function setMethod(method: ShippingMethod) {
    form.shipping.method = method
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
      payphone.value = result.payphone
      orderNumber.value = result.order.number
      // El carrito se limpia recién cuando PayPhone confirma; si el cliente
      // cancela el pago, sigue teniendo sus productos.
      try {
        sessionStorage.setItem('pantuflasec.pendingOrder', result.order.clientTransactionId)
      } catch {
        /* sin sessionStorage no pasa nada */
      }
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
    total,
    needsAddress,
    payphoneReady,
    setMethod,
    submit,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
