import { ref } from 'vue'
import { site } from '@/config/site'
import { useCartStore } from '@/stores/cart'
import { formatMoney } from '@/utils/format'
import { savedCustomer } from '@/utils/customer'
import type { Product, ProductVariant } from '@/types'

/**
 * WhatsApp con contexto. El botón global arma el mensaje según dónde esté el
 * cliente: viendo un producto, con carrito y datos dejados en el checkout, o
 * una consulta general. Siempre pasa por el modal antes de abrir WhatsApp.
 */
interface ProductContext {
  product: Product
  variant: ProductVariant | null
  qty: number
}

const open = ref(false)
const message = ref('')
const title = ref('')
const productContext = ref<ProductContext | null>(null)

export function useWhatsApp() {
  const cart = useCartStore()

  function setProduct(ctx: ProductContext | null) {
    productContext.value = ctx
  }

  function productMessage(ctx: ProductContext): string {
    const price = ctx.variant?.price ?? ctx.product.price
    const lines = [
      '👋 Hola Pantuflas Ecuador, me interesa este producto:',
      `🧸 *${ctx.product.name}*`,
      ctx.variant ? `📏 Opción: ${ctx.variant.label}` : '',
      `🔢 Cantidad: ${ctx.qty}`,
      `💵 Precio: ${formatMoney(price)}`,
      `🔗 ${site.url}/producto/${ctx.product.slug}`,
      '',
      '¿Está disponible? 🙏',
    ]
    return lines.filter((l) => l !== '').join('\n')
  }

  function cartMessage(): string {
    const c = savedCustomer()
    const items = cart.lines.map(
      (l) => `• ${l.qty} × ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ''} — ${formatMoney(l.unitPrice * l.qty)}`,
    )
    const lines = [
      '🛍️ Hola Pantuflas Ecuador, quiero finalizar mi compra por WhatsApp:',
      ...items,
      `💰 Subtotal: ${formatMoney(cart.subtotal)}`,
      '',
      c.name ? `👤 ${c.name}` : '',
      c.phone ? `📱 ${c.phone}` : '',
      c.email ? `📧 ${c.email}` : '',
      c.shippingMethod
        ? `📍 ${c.shippingMethod.startsWith('pickup') ? 'Retiro en tienda' : `Envío a ${[c.address, c.city].filter(Boolean).join(', ')}`}`
        : '',
      '',
      '¿Cómo continúo con el pago? 😊',
    ]
    return lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n')
  }

  function generalMessage(): string {
    return '👋 Hola Pantuflas Ecuador, quiero más información sobre sus productos 🧸✨'
  }

  /** Abre el modal con el mensaje que corresponda al contexto actual. */
  function ask(custom?: string) {
    if (custom) {
      title.value = 'Escríbenos por WhatsApp'
      message.value = custom
    } else if (productContext.value) {
      title.value = 'Preguntar por este producto'
      message.value = productMessage(productContext.value)
    } else if (!cart.isEmpty) {
      title.value = 'Finalizar compra por WhatsApp'
      message.value = cartMessage()
    } else {
      title.value = 'Escríbenos por WhatsApp'
      message.value = generalMessage()
    }
    open.value = true
  }

  /** Atajo del checkout: manda el carrito con los datos ya escritos. */
  function checkout() {
    title.value = 'Finalizar compra por WhatsApp'
    message.value = cartMessage()
    open.value = true
  }

  function go() {
    const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message.value)}`
    window.open(url, '_blank', 'noopener')
    open.value = false
  }

  function close() {
    open.value = false
  }

  return { open, title, message, ask, checkout, go, close, setProduct }
}
