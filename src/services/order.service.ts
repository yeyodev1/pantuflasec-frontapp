import APIBase from './httpBase'
import type { CheckoutInput, Order, PayphoneBoxParams, Paginated, ShopConfig } from '@/types'

class OrderService extends APIBase {
  async config(): Promise<ShopConfig> {
    const { data } = await this.get<ShopConfig>('orders/config')
    return data
  }

  /** Crea el pedido en espera de pago y devuelve lo que la cajita necesita. */
  async create(input: CheckoutInput): Promise<{ order: Order; payphone: PayphoneBoxParams }> {
    const { data } = await this.post<{ order: Order; payphone: PayphoneBoxParams }>('orders', input)
    return data
  }

  /** Tras el redirect de PayPhone: confirma el cobro y cierra el pedido. */
  async confirm(id: number, clientTransactionId: string): Promise<Order> {
    const { data } = await this.post<Order>('orders/confirm', { id, clientTransactionId })
    return data
  }

  /** Pide por correo los enlaces de los pedidos hechos con ese email. */
  async lookup(email: string): Promise<void> {
    await this.post<{ ok: boolean }>('orders/lookup', { email })
  }

  async track(token: string): Promise<Order> {
    const { data } = await this.get<Order>(`orders/track/${encodeURIComponent(token)}`)
    return data
  }

  /** Captura de la transferencia; el backend la guarda en Cloudinary y avisa al equipo. */
  async uploadProof(token: string, file: File, note = ''): Promise<Order> {
    const form = new FormData()
    form.append('file', file)
    form.append('note', note)
    const { data } = await this.post<Order>(
      `orders/track/${encodeURIComponent(token)}/proof`,
      form,
      undefined,
      {
        timeout: 60000,
      },
    )
    return data
  }

  /** El cliente escribe al equipo desde el seguimiento. */
  async sendMessage(token: string, text: string): Promise<Order> {
    const { data } = await this.post<Order>(`orders/track/${encodeURIComponent(token)}/messages`, {
      text,
    })
    return data
  }

  // --- Admin ---

  async listAll(
    query: { status?: string; pay?: string; page?: number; q?: string } = {},
  ): Promise<Paginated<Order>> {
    const params = new URLSearchParams()
    if (query.status) params.set('status', query.status)
    if (query.pay) params.set('pay', query.pay)
    if (query.page) params.set('page', String(query.page))
    if (query.q) params.set('q', query.q)
    const qs = params.toString()
    const { data } = await this.get<Paginated<Order>>(`orders/admin/all${qs ? `?${qs}` : ''}`)
    return data
  }

  async summary(): Promise<{
    pending: number
    paid: number
    preparing: number
    review: number
    today: number
  }> {
    const { data } = await this.get<{
      pending: number
      paid: number
      preparing: number
      review: number
      today: number
    }>('orders/admin/summary')
    return data
  }

  /** Aprueba o rechaza una transferencia (o registra el efectivo en tienda). */
  async reviewPayment(id: string, action: 'approve' | 'reject', reason = ''): Promise<Order> {
    const { data } = await this.put<Order>(`orders/admin/${id}/payment`, { action, reason })
    return data
  }

  /** El equipo responde al cliente; le llega por correo con el enlace del pedido. */
  async replyMessage(id: string, text: string): Promise<Order> {
    const { data } = await this.post<Order>(`orders/admin/${id}/messages`, { text })
    return data
  }

  async adminGet(id: string): Promise<Order> {
    const { data } = await this.get<Order>(`orders/admin/${id}`)
    return data
  }

  /** Registra un contacto o nota del equipo en el historial del pedido. */
  async addEvent(id: string, kind: string, detail = ''): Promise<Order> {
    const { data } = await this.post<Order>(`orders/admin/${id}/events`, { kind, detail })
    return data
  }

  async setStatus(id: string, status: Order['status']): Promise<Order> {
    const { data } = await this.put<Order>(`orders/admin/${id}/status`, { status })
    return data
  }
}

export const orderService = new OrderService()
