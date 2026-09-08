import APIBase from './httpBase'
import type { HeroSettings, PaymentSettings, ShippingMethodSetting } from '@/types'

/** Ajustes editables desde el panel: portada del home y métodos de pago manuales. */
class SettingService extends APIBase {
  async hero(): Promise<HeroSettings> {
    const { data } = await this.get<HeroSettings>('settings/hero')
    return data
  }

  async updateHero(input: Partial<HeroSettings>): Promise<HeroSettings> {
    const { data } = await this.put<HeroSettings>('settings/hero', input)
    return data
  }

  async payments(): Promise<PaymentSettings> {
    const { data } = await this.get<PaymentSettings>('settings/payments')
    return data
  }

  async shipping(): Promise<ShippingMethodSetting[]> {
    const { data } = await this.get<{ methods: ShippingMethodSetting[] }>('settings/shipping')
    return data.methods
  }

  async updateShipping(methods: ShippingMethodSetting[]): Promise<ShippingMethodSetting[]> {
    const { data } = await this.put<{ methods: ShippingMethodSetting[] }>('settings/shipping', { methods })
    return data.methods
  }

  async updatePayments(input: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const { data } = await this.put<PaymentSettings>('settings/payments', input)
    return data
  }
}

export const settingService = new SettingService()
