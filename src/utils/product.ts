import type { Product, ProductVariant } from '@/types'
import { placeholderImage } from '@/config/catalog'

export function mainImage(product: Product): string {
  return product.images[0]?.url || placeholderImage
}

export function variantPrice(product: Product, variant?: ProductVariant | null): number {
  return variant?.price ?? product.price
}

/** Rango "desde $15" cuando las variantes tienen precios distintos. */
export function priceRange(product: Product): { min: number; max: number } {
  const prices = product.variants.map((v) => v.price ?? product.price)
  if (!prices.length) return { min: product.price, max: product.price }
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function totalStock(product: Product): number {
  if (!product.variants.length) return Number.POSITIVE_INFINITY
  return product.variants.reduce((sum, v) => sum + v.stock, 0)
}

export function inStock(product: Product): boolean {
  return totalStock(product) > 0
}
