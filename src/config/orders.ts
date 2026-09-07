import type { OrderStatus } from '@/types'

export const orderStatuses: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending_payment', label: 'Pendiente de pago' },
  { key: 'paid', label: 'Pagado' },
  { key: 'preparing', label: 'En preparación' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregado' },
  { key: 'cancelled', label: 'Cancelado' },
]

export const orderStatusLabel = (key: string) =>
  orderStatuses.find((s) => s.key === key)?.label ?? key
