import { reactive, ref } from 'vue'
import { settingService } from '@/services/setting.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, BankAccount, HeroSettings, PaymentSettings, ShippingMethodSetting } from '@/types'

/** Portada del home: cargar, editar y guardar. */
export function useHeroSettings() {
  const toast = useToastStore()
  const hero = reactive<HeroSettings>({
    enabled: false,
    image: { url: '', publicId: '' },
    eyebrow: '',
    title: '',
    text: '',
    ctaLabel: '',
    ctaLink: '',
  })
  const loading = ref(true)
  const saving = ref(false)

  settingService
    .hero()
    .then((h) => Object.assign(hero, h))
    .catch((e: ApiError) => toast.error(e.message))
    .finally(() => (loading.value = false))

  async function save() {
    saving.value = true
    try {
      Object.assign(hero, await settingService.updateHero({ ...hero }))
      toast.success(
        hero.enabled ? 'Portada guardada y visible en la tienda' : 'Portada guardada (apagada)',
      )
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return { hero, loading, saving, save }
}

const emptyAccount = (): BankAccount => ({
  bank: '',
  type: 'Ahorros',
  number: '',
  holder: '',
  documentId: '',
  email: '',
})

/** Transferencia y efectivo: cuentas, instrucciones y si están activos. */
export function usePaymentSettings() {
  const toast = useToastStore()
  const payments = reactive<PaymentSettings>({
    transfer: { enabled: false, accounts: [], instructions: '' },
    cash: { enabled: true, instructions: '' },
  })
  const loading = ref(true)
  const saving = ref(false)

  settingService
    .payments()
    .then((p) => {
      payments.transfer = p.transfer
      payments.cash = p.cash
    })
    .catch((e: ApiError) => toast.error(e.message))
    .finally(() => (loading.value = false))

  function addAccount() {
    payments.transfer.accounts.push(emptyAccount())
  }

  function removeAccount(i: number) {
    payments.transfer.accounts.splice(i, 1)
  }

  async function save() {
    saving.value = true
    try {
      const saved = await settingService.updatePayments({
        transfer: { ...payments.transfer },
        cash: { ...payments.cash },
      })
      payments.transfer = saved.transfer
      payments.cash = saved.cash
      toast.success('Métodos de pago guardados')
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return { payments, loading, saving, addAccount, removeAccount, save }
}

const emptyMethod = (): ShippingMethodSetting => ({
  key: '',
  label: '',
  description: '',
  cost: 0,
  kind: 'delivery',
  address: '',
  city: '',
  enabled: true,
})

/** Métodos de entrega: tarifas por zona, couriers y puntos de retiro. El orden de la lista es el del checkout. */
export function useShippingSettings() {
  const toast = useToastStore()
  const methods = ref<ShippingMethodSetting[]>([])
  const loading = ref(true)
  const saving = ref(false)

  settingService
    .shipping()
    .then((m) => (methods.value = m))
    .catch((e: ApiError) => toast.error(e.message))
    .finally(() => (loading.value = false))

  function add(kind: ShippingMethodSetting['kind'] = 'delivery') {
    methods.value.push({ ...emptyMethod(), kind })
  }

  function remove(i: number) {
    methods.value.splice(i, 1)
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= methods.value.length) return
    const next = [...methods.value]
    const [it] = next.splice(i, 1)
    next.splice(j, 0, it!)
    methods.value = next
  }

  async function save() {
    saving.value = true
    try {
      methods.value = await settingService.updateShipping(methods.value.map((m) => ({ ...m, cost: Number(m.cost) })))
      toast.success('Métodos de entrega guardados')
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return { methods, loading, saving, add, remove, move, save }
}
