import type { OrderStatus } from '@/types'

/** Etiquetas y orden del flujo de un pedido. Deben coincidir con el backapp. */
export const orderStatuses: Array<{ key: OrderStatus; label: string; icon: string; hint: string }> = [
  { key: 'pending_payment', label: 'Pendiente de pago', icon: 'fa-solid fa-clock', hint: 'Esperando el cobro de PayPhone' },
  { key: 'paid', label: 'Pagado', icon: 'fa-solid fa-circle-check', hint: 'Pago aprobado, listo para empacar' },
  { key: 'preparing', label: 'Empacado', icon: 'fa-solid fa-box-open', hint: 'El pedido está armado y listo' },
  { key: 'shipped', label: 'En camino', icon: 'fa-solid fa-truck-fast', hint: 'Salió con el courier o está para retiro' },
  { key: 'delivered', label: 'Entregado', icon: 'fa-solid fa-house-circle-check', hint: 'El cliente ya lo tiene' },
  { key: 'cancelled', label: 'Cancelado', icon: 'fa-solid fa-ban', hint: 'Pedido anulado' },
]

/** Solo los pasos del flujo normal, en orden. */
export const orderFlow = orderStatuses.filter((s) => s.key !== 'cancelled')

export const orderStatusLabel = (key: string) =>
  orderStatuses.find((s) => s.key === key)?.label ?? key
