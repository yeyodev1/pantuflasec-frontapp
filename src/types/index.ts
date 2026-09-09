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
  /** Sale en el inicio agrupado por colección (check en el editor). */
  showOnHome: boolean
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
  showOnHome?: boolean
  sort?: ProductSort
  page?: number
  limit?: number
}

// --- Pedidos ---

/** Claves que genera el admin en /admin/envios; los retiros empiezan con `pickup-`. */
export type ShippingMethod = string

export interface ShippingMethodSetting {
  key: string
  label: string
  description: string
  cost: number
  kind: 'pickup' | 'delivery' | 'distance'
  address: string
  city: string
  enabled: boolean
}

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
    location?: string
    coords?: { lat: number; lng: number } | null
    km?: number | null
  }
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  taxRate: number
  /** Con `taxIncluded` el IVA ya está dentro del subtotal: se muestra, no se suma. */
  tax: number
  taxIncluded?: boolean
  /** Recargo por pagar con tarjeta (comisión de PayPhone); 0 con transferencia o efectivo. */
  cardFee?: number
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
  /** Logo del banco en Cloudinary; el admin decide si se muestra. */
  logo: { url: string; publicId: string }
  showLogo: boolean
}

/** Candidato de Brandfetch al buscar un banco por nombre. */
export interface BrandCandidate {
  name: string
  domain: string
  icon: string
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
  shippingMethods: Array<{ key: ShippingMethod; label: string; description: string; cost: number; kind: 'pickup' | 'delivery' | 'distance' }>
  /** Entrega en moto: radio máximo y tienda de salida, para el mapa. */
  delivery: { maxKm: number; origin: { lat: number; lng: number } }
  taxRate: number
  taxIncluded: boolean
  /** Tasa de la comisión de PayPhone; el recargo se calcula con gross-up (base / (1 - tasa) - base). */
  cardFeeRate: number
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
    /** Entrega en moto: "lat,lng" del mapa o link de Google Maps. */
    location: string
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

/** Lo que responde /orders/quote: coordenadas, km por carretera y precio del tarifario. */
export interface DeliveryQuote {
  resolvedUrl: string
  coords: { lat: number; lng: number } | null
  km: number | null
  /** null con coordenadas = fuera del radio de la moto. */
  cost: number | null
  kmSource: 'driving' | 'straight' | null
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
