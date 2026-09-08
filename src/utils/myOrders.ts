/**
 * Pedidos de este dispositivo. No hay cuentas de cliente: al pagar (o al abrir
 * un enlace de seguimiento) se guarda el token del pedido en localStorage y
 * "Mis pedidos" los lista al instante. Desde otro dispositivo se piden por correo.
 */
const KEY = 'pantuflasec.orders'

export interface SavedOrder {
  token: string
  number: string
  total: number
  createdAt: string
}

export function savedOrders(): SavedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as SavedOrder[]
  } catch {
    return []
  }
}

export function rememberOrder(order: SavedOrder) {
  try {
    const list = savedOrders().filter((o) => o.token !== order.token)
    list.unshift(order)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)))
  } catch {
    /* modo privado */
  }
}
