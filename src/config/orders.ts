import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types'

/** Etiquetas y orden del flujo de un pedido. Deben coincidir con el backapp. */
export const orderStatuses: Array<{ key: OrderStatus; label: string; icon: string; hint: string }> =
  [
    {
      key: 'pending_payment',
      label: 'Pendiente de pago',
      icon: 'fa-solid fa-clock',
      hint: 'Esperando el pago: tarjeta, transferencia o efectivo en tienda',
    },
    {
      key: 'paid',
      label: 'Pagado',
      icon: 'fa-solid fa-circle-check',
      hint: 'Pago aprobado, listo para empacar',
    },
    {
      key: 'preparing',
      label: 'Empacado',
      icon: 'fa-solid fa-box-open',
      hint: 'El pedido está armado y listo',
    },
    {
      key: 'shipped',
      label: 'En camino',
      icon: 'fa-solid fa-truck-fast',
      hint: 'Salió con el courier o está para retiro',
    },
    {
      key: 'delivered',
      label: 'Entregado',
      icon: 'fa-solid fa-house-circle-check',
      hint: 'El cliente ya lo tiene',
    },
    { key: 'cancelled', label: 'Cancelado', icon: 'fa-solid fa-ban', hint: 'Pedido anulado' },
  ]

/** Solo los pasos del flujo normal, en orden. */
export const orderFlow = orderStatuses.filter((s) => s.key !== 'cancelled')

export const orderStatusLabel = (key: string) =>
  orderStatuses.find((s) => s.key === key)?.label ?? key

/** Cómo paga el cliente. Debe coincidir con PAYMENT_METHODS del backapp. */
export const paymentMethods: Array<{
  key: PaymentMethod
  label: string
  short: string
  icon: string
  text: string
}> = [
  {
    key: 'payphone',
    label: 'Tarjeta de crédito o débito',
    short: 'Tarjeta',
    icon: 'fa-solid fa-credit-card',
    text: 'Pago seguro con PayPhone sin salir de la tienda. Visa, Mastercard, Diners y Discover.',
  },
  {
    key: 'transfer',
    label: 'Transferencia bancaria',
    short: 'Transferencia',
    icon: 'fa-solid fa-building-columns',
    text: 'Te mostramos las cuentas, transfieres y subes el comprobante. Lo aprobamos el mismo día.',
  },
  {
    key: 'cash',
    label: 'Efectivo al retirar',
    short: 'Efectivo',
    icon: 'fa-solid fa-money-bill-wave',
    text: 'Solo con retiro en tienda: reservamos tu pedido y pagas al recogerlo.',
  },
]

export const paymentMethodLabel = (key: string) =>
  paymentMethods.find((m) => m.key === key)?.short ?? key

export const paymentStatuses: Record<
  PaymentStatus,
  { label: string; tone: 'ok' | 'warn' | 'bad' | 'info' }
> = {
  pending: { label: 'Sin pagar', tone: 'warn' },
  review: { label: 'Comprobante por revisar', tone: 'info' },
  paid: { label: 'Pagado', tone: 'ok' },
  rejected: { label: 'Comprobante rechazado', tone: 'bad' },
  failed: { label: 'Pago fallido', tone: 'bad' },
  cancelled: { label: 'Pago cancelado', tone: 'bad' },
}
