import APIBase from './httpBase'
import type { DeliveryQuote } from '@/types'

/** El backend resuelve el link o el punto del mapa y pone el precio; aquí solo se pide. */
class MapsService extends APIBase {
  async quote(location: string): Promise<DeliveryQuote> {
    const { data } = await this.get<DeliveryQuote>(`orders/quote?location=${encodeURIComponent(location)}`)
    return data
  }
}

export const mapsService = new MapsService()
