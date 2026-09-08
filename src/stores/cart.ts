import { defineStore } from 'pinia'
import type { Product, ProductVariant } from '@/types'
import { mainImage, variantPrice } from '@/utils/product'

const STORAGE_KEY = 'pantuflasec.cart'

/**
 * Línea del carrito. Se guarda una copia de nombre, precio e imagen para
 * pintar sin pedir nada al API; el backend vuelve a validar precio y stock al
 * crear el pedido, así que un precio viejo aquí no compromete nada.
 */
export interface CartLine {
  key: string
  productId: string
  slug: string
  name: string
  image: string
  variantId: string | null
  variantLabel: string
  unitPrice: number
  qty: number
  maxQty: number
}

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartLine[]) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: load(),
    open: false,
    /** Última línea agregada: el drawer la resalta un instante en vez de mostrar un aviso. */
    lastAdded: '' as string,
  }),

  getters: {
    count: (s) => s.lines.reduce((n, l) => n + l.qty, 0),
    subtotal: (s) => s.lines.reduce((n, l) => n + l.unitPrice * l.qty, 0),
    isEmpty: (s) => s.lines.length === 0,
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines))
      } catch {
        // Modo privado: el carrito dura lo que dure la pestaña.
      }
    },

    add(product: Product, variant: ProductVariant | null, qty = 1) {
      const key = `${product._id}:${variant?._id ?? ''}`
      const maxQty = variant ? variant.stock : 99
      const existing = this.lines.find((l) => l.key === key)
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, maxQty)
      } else {
        this.lines.push({
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: mainImage(product),
          variantId: variant?._id ?? null,
          variantLabel: variant?.label ?? '',
          unitPrice: variantPrice(product, variant),
          qty: Math.min(qty, maxQty),
          maxQty,
        })
      }
      this.persist()
      this.lastAdded = key
      this.open = true
      setTimeout(() => (this.lastAdded === key ? (this.lastAdded = '') : null), 2500)
    },

    setQty(key: string, qty: number) {
      const line = this.lines.find((l) => l.key === key)
      if (!line) return
      if (qty <= 0) return this.remove(key)
      line.qty = Math.min(qty, line.maxQty)
      this.persist()
    },

    remove(key: string) {
      this.lines = this.lines.filter((l) => l.key !== key)
      this.persist()
    },

    clear() {
      this.lines = []
      this.persist()
    },
  },
})
