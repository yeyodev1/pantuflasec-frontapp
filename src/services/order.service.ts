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

  async track(token: string): Promise<Order> {
    const { data } = await this.get<Order>(`orders/track/${encodeURIComponent(token)}`)
    return data
  }

  // --- Admin ---

  async listAll(query: { status?: string; page?: number; q?: string } = {}): Promise<Paginated<Order>> {
    const params = new URLSearchParams()
    if (query.status) params.set('status', query.status)
    if (query.page) params.set('page', String(query.page))
    if (query.q) params.set('q', query.q)
    const qs = params.toString()
    const { data } = await this.get<Paginated<Order>>(`orders/admin/all${qs ? `?${qs}` : ''}`)
    return data
  }

  async adminGet(id: string): Promise<Order> {
    const { data } = await this.get<Order>(`orders/admin/${id}`)
    return data
  }

  async setStatus(id: string, status: Order['status']): Promise<Order> {
    const { data } = await this.put<Order>(`orders/admin/${id}/status`, { status })
    return data
  }
}

export const orderService = new OrderService()
