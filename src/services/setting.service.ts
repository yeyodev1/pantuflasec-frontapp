import APIBase from './httpBase'
import type { BrandCandidate, HeroSettings, PaymentSettings, ShippingMethodSetting } from '@/types'

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

  /** Candidatos de Brandfetch para el nombre de un banco. */
  async searchBankLogo(q: string): Promise<{ configured: boolean; items: BrandCandidate[] }> {
    const { data } = await this.get<{ configured: boolean; items: BrandCandidate[] }>(`settings/bank-logo/search?q=${encodeURIComponent(q)}`)
    return data
  }

  /** Copia el logo elegido a Cloudinary y devuelve la URL definitiva. */
  async importBankLogo(candidate: BrandCandidate): Promise<{ url: string; publicId: string }> {
    const { data } = await this.post<{ url: string; publicId: string }>('settings/bank-logo/import', candidate)
    return data
  }

  async updatePayments(input: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const { data } = await this.put<PaymentSettings>('settings/payments', input)
    return data
  }
}

export const settingService = new SettingService()
