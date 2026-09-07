import type { Category, ProductSort } from '@/types'

/** Etiquetas e iconos de cada categoría del backapp, en el orden de la tienda. */
export const categories: Array<{ key: Category; label: string; icon: string }> = [
  { key: 'pantuflas', label: 'Pantuflas', icon: 'fa-solid fa-shoe-prints' },
  { key: 'peluches', label: 'Peluches', icon: 'fa-solid fa-heart' },
  { key: 'tazas', label: 'Tazas', icon: 'fa-solid fa-mug-hot' },
  { key: 'tomatodos', label: 'Tomatodos', icon: 'fa-solid fa-bottle-water' },
  { key: 'pijamas', label: 'Pijamas', icon: 'fa-solid fa-shirt' },
  { key: 'mantas', label: 'Mantas', icon: 'fa-solid fa-bed' },
  { key: 'arreglos', label: 'Arreglos y box', icon: 'fa-solid fa-gift' },
  { key: 'accesorios', label: 'Accesorios', icon: 'fa-solid fa-star' },
  { key: 'otros', label: 'Otros', icon: 'fa-solid fa-tag' },
]

export const categoryLabel = (key: string) =>
  categories.find((c) => c.key === key)?.label ?? key

export const sorts: Array<{ key: ProductSort; label: string }> = [
  { key: 'featured', label: 'Destacados' },
  { key: 'recent', label: 'Más nuevos' },
  { key: 'price-asc', label: 'Menor precio' },
  { key: 'price-desc', label: 'Mayor precio' },
  { key: 'name', label: 'Nombre' },
]

/** Imagen de respaldo cuando un producto todavía no tiene fotos. */
export const placeholderImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f1ece6"/><text x="200" y="215" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#8a8590">Sin foto</text></svg>`,
  )

export const PAGE_SIZE = 24
