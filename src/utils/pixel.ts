/**
 * Meta Pixel. Se carga solo si VITE_META_PIXEL_ID está definido; sin ID cada
 * llamada es un no-op, así el código de la tienda no tiene que preguntar.
 * Eventos estándar: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase.
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string) || ''
let loaded = false

export function initPixel() {
  if (!PIXEL_ID || loaded) return
  loaded = true
  // Stub oficial de Meta: encola llamadas hasta que fbevents.js cargue.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq: any = function (...args: unknown[]) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args)
  }
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.push = fbq
  window.fbq = fbq
  window._fbq = fbq
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
  window.fbq?.('init', PIXEL_ID)
}

function track(event: string, data?: Record<string, unknown>) {
  if (!PIXEL_ID) return
  try {
    window.fbq?.('track', event, data)
  } catch {
    /* el pixel nunca debe romper la tienda */
  }
}

export const pixel = {
  pageView: () => track('PageView'),
  viewContent: (id: string, name: string, value: number, category: string) =>
    track('ViewContent', {
      content_ids: [id],
      content_name: name,
      content_type: 'product',
      content_category: category,
      value,
      currency: 'USD',
    }),
  addToCart: (id: string, name: string, value: number, qty: number) =>
    track('AddToCart', {
      content_ids: [id],
      content_name: name,
      content_type: 'product',
      value: value * qty,
      currency: 'USD',
      num_items: qty,
    }),
  initiateCheckout: (ids: string[], value: number, numItems: number) =>
    track('InitiateCheckout', {
      content_ids: ids,
      content_type: 'product',
      value,
      currency: 'USD',
      num_items: numItems,
    }),
  purchase: (orderNumber: string, ids: string[], value: number, numItems: number) =>
    track('Purchase', {
      content_ids: ids,
      content_type: 'product',
      value,
      currency: 'USD',
      num_items: numItems,
      order_id: orderNumber,
    }),
}
