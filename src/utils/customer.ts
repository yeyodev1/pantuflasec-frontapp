/** Datos del cliente guardados en este dispositivo para no pedirlos dos veces. */
const KEY = 'pantuflasec.customer'

export interface SavedCustomer {
  name: string
  email: string
  phone: string
  documentId: string
  shippingMethod: string
  address: string
  city: string
  reference: string
  /** Punto del mapa o link de Maps de la última entrega en moto. */
  location: string
}

export function savedCustomer(): Partial<SavedCustomer> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<SavedCustomer>
  } catch {
    return {}
  }
}

export function rememberCustomer(data: Partial<SavedCustomer>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...savedCustomer(), ...data }))
  } catch {
    /* modo privado */
  }
}
