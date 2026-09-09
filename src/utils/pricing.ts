/**
 * Comisión de PayPhone: 5 % + IVA sobre la comisión = 5,75 % del cobro con
 * tarjeta. Los precios del catálogo son los de tienda; el recargo se suma solo
 * en el checkout a quien paga con tarjeta, con gross-up para que la tienda
 * reciba el precio completo. Debe coincidir con `config/shop.ts` del backapp.
 */
export const PAYPHONE_FEE = 0.05 * 1.15

const round2 = (n: number) => Math.round(n * 100) / 100

/** Recargo por tarjeta sobre `base` (subtotal + envío). */
export function cardFeeFor(base: number, rate = PAYPHONE_FEE): number {
  if (!Number.isFinite(base) || base <= 0) return 0
  return round2(base / (1 - rate) - base)
}
