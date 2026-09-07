/** Forma con la que httpBase rechaza cualquier error del API. */
export interface ApiError {
  status: number
  message: string
  data?: unknown
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

/** Lo que devuelve el backapp en /auth/login y /auth/me. */
export interface SessionUser {
  id: string
  email: string
  name: string
  phone: string
  accountType: 'customer' | 'admin' | string
}

/** Espejo de CATEGORIES en el backapp (product.model.ts). */
export type Category =
  | 'pantuflas'
  | 'peluches'
  | 'tazas'
  | 'tomatodos'
  | 'pijamas'
  | 'mantas'
  | 'arreglos'
  | 'accesorios'
  | 'otros'

export interface ProductVariant {
  _id: string
  label: string
  size: string
  color: string
  sku: string
  /** null = usa el precio base del producto */
  price: number | null
  stock: number
}

export interface ProductImage {
  url: string
  publicId: string
}

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  category: Category
  collection: string
  price: number
  compareAtPrice: number | null
  images: ProductImage[]
  variants: ProductVariant[]
  tags: string[]
  isActive: boolean
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductFacets {
  categories: Array<{ key: Category; count: number }>
  collections: Array<{ name: string; count: number }>
}

export type ProductSort = 'featured' | 'recent' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  q?: string
  category?: Category | ''
  collection?: string
  featured?: boolean
  sort?: ProductSort
  page?: number
  limit?: number
}

// --- Pedidos ---

export type ShippingMethod = 'pickup' | 'gye' | 'ec'

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  productId: string
  variantId: string | null
  name: string
  variantLabel: string
  image: string
  unitPrice: number
  qty: number
  subtotal: number
}

export interface Order {
  _id: string
  number: string
  clientTransactionId: string
  customer: { name: string; email: string; phone: string; documentId: string }
  shipping: {
    method: ShippingMethod
    label: string
    address: string
    city: string
    reference: string
    notes: string
  }
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  taxRate: number
  tax: number
  total: number
  status: OrderStatus
  payment: {
    method: 'payphone'
    status: 'pending' | 'paid' | 'failed' | 'cancelled'
    payphoneId: number | null
    authorizationCode: string
    cardBrand: string
    paidAt: string | null
    message: string
  }
  stockIssue: boolean
  createdAt: string
  updatedAt: string
}

export interface ShopConfig {
  shippingMethods: Array<{ key: ShippingMethod; label: string; cost: number }>
  taxRate: number
  payphone: { token: string; storeId: string } | null
}

export interface CheckoutInput {
  customer: { name: string; email: string; phone: string; documentId: string }
  shipping: {
    method: ShippingMethod
    address: string
    city: string
    reference: string
    notes: string
  }
  items: Array<{ productId: string; variantId: string | null; qty: number }>
}

/** Parámetros que el backapp calcula para PPaymentButtonBox (montos en centavos). */
export interface PayphoneBoxParams {
  token: string
  storeId: string
  clientTransactionId: string
  amount: number
  amountWithTax: number
  amountWithoutTax: number
  tax: number
  service: number
  tip: number
  currency: 'USD'
  reference: string
  email: string
  phoneNumber: string
  documentId: string
}

/** Usuario tal como lo devuelve /users (solo admin). */
export interface AdminUser extends SessionUser {
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

/** Ítem de la galería del home (administrable). */
export interface GalleryItem {
  _id: string
  title: string
  subtitle: string
  image: { url: string; publicId: string }
  link: string
  order: number
  isActive: boolean
  createdAt: string
}
