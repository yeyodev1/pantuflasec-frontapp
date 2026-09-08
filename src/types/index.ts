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
  accountType: 'customer' | 'staff' | 'admin' | string
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
  /** Sección "Nuevo": lo marca el admin cuando llega mercadería. */
  newArrival: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductFacets {
  categories: Array<{ key: Category; count: number; cover: string | null }>
  collections: Array<{ name: string; count: number }>
}

export type ProductSort = 'featured' | 'recent' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  q?: string
  category?: Category | ''
  collection?: string
  featured?: boolean
  newArrival?: boolean
  sort?: ProductSort
  page?: number
  limit?: number
}

// --- Pedidos ---

export type ShippingMethod = 'pickup-garzota' | 'pickup-joya' | 'gye' | 'ec'

export type PaymentMethod = 'payphone' | 'transfer' | 'cash'
/** `review` = comprobante subido, pendiente de que el equipo lo apruebe. */
export type PaymentStatus = 'pending' | 'review' | 'paid' | 'rejected' | 'failed' | 'cancelled'

export interface OrderMessage {
  at: string
  from: 'customer' | 'team'
  by: string
  text: string
}

export type OrderStatus =
  'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'

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
  billing?: { wanted: boolean; documentId: string; name: string; email: string; phone: string }
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
  /** Con `taxIncluded` el IVA ya está dentro del subtotal: se muestra, no se suma. */
  tax: number
  taxIncluded?: boolean
  total: number
  status: OrderStatus
  payment: {
    method: PaymentMethod
    status: PaymentStatus
    payphoneId: number | null
    authorizationCode: string
    cardBrand: string
    paidAt: string | null
    message: string
    proof: { url: string; publicId: string; note: string; uploadedAt: string | null }
    reviewedBy: string
    reviewedAt: string | null
    rejectReason: string
  }
  stockIssue: boolean
  events?: Array<{ at: string; kind: string; detail: string; by: string }>
  messages?: OrderMessage[]
  createdAt: string
  updatedAt: string
}

export interface BankAccount {
  bank: string
  type: string
  number: string
  holder: string
  documentId: string
  email: string
}

/** Métodos que aprueba el equipo; el admin los edita en /admin/pagos. */
export interface PaymentSettings {
  transfer: { enabled: boolean; accounts: BankAccount[]; instructions: string }
  cash: { enabled: boolean; instructions: string }
}

/** Portada del home, editable en /admin/portada. */
export interface HeroSettings {
  enabled: boolean
  image: { url: string; publicId: string }
  eyebrow: string
  title: string
  text: string
  ctaLabel: string
  ctaLink: string
}

export interface ShopConfig {
  shippingMethods: Array<{ key: ShippingMethod; label: string; cost: number }>
  taxRate: number
  taxIncluded: boolean
  payphone: { token: string; storeId: string } | null
  payments: PaymentSettings
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
  billing?: {
    wanted: boolean
    sameAsCustomer: boolean
    documentId: string
    name: string
    email: string
    phone: string
  }
  payment: { method: PaymentMethod }
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
