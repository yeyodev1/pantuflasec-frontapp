/**
 * Comisión de PayPhone: 5% + IVA sobre la comisión = 5,75% del cobro con
 * tarjeta. Los precios del catálogo ya la traen dentro: el admin escribe lo
 * que quiere recibir y la tienda muestra el precio que la cubre. Debe
 * coincidir con `scripts/adjust-prices.ts` del backapp.
 */
export const PAYPHONE_FEE = 0.05 * 1.15

const round2 = (n: number) => Math.round(n * 100) / 100

/** Precio que ve el cliente para que, tras la comisión, se reciba `net`. Redondea hacia arriba a $0,05. */
export function priceWithFee(net: number): number {
  if (!Number.isFinite(net) || net <= 0) return 0
  const cents = Math.round(net * 100) / (1 - PAYPHONE_FEE)
  return (Math.ceil(cents / 5 - 1e-9) * 5) / 100
}

/** Lo que llega a la cuenta si el cliente paga con tarjeta el precio `price`. */
export function netOfPrice(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0
  return round2(price * (1 - PAYPHONE_FEE))
}
