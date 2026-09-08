import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { mapsService } from '@/services/maps.service'
import type { DeliveryQuote } from '@/types'

/**
 * Cotiza la entrega en moto contra el backend cada vez que cambia la
 * ubicación (link pegado o punto del mapa). Con debounce y número de
 * secuencia: una respuesta lenta vieja no pisa una nueva.
 */
export function useDeliveryQuote(location: Ref<string>, active: Ref<boolean>) {
  const quote = ref<DeliveryQuote | null>(null)
  const resolving = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let seq = 0

  function run() {
    clearTimeout(timer)
    quote.value = null
    const raw = location.value.trim()
    if (!raw || !active.value) {
      resolving.value = false
      return
    }
    resolving.value = true
    const mine = ++seq
    timer = setTimeout(async () => {
      try {
        const result = await mapsService.quote(raw)
        if (mine === seq) quote.value = result
      } catch {
        if (mine === seq) quote.value = null
      } finally {
        if (mine === seq) resolving.value = false
      }
    }, 500)
  }

  watch([location, active], run, { immediate: true })
  onBeforeUnmount(() => clearTimeout(timer))

  return { quote, resolving }
}
