import { onMounted, onUnmounted, ref, watch } from 'vue'
import { orderService } from '@/services/order.service'
import { useUserStore } from '@/stores/user'

/** Contador de pedidos por atender para el header del admin. Se refresca cada minuto. */
const pending = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
let users = 0

export function useOrdersSummary() {
  const userStore = useUserStore()

  async function refresh() {
    if (!userStore.canManageOrders) return (pending.value = 0)
    try {
      pending.value = (await orderService.summary()).pending
    } catch {
      /* sin red no pasa nada: el contador se queda como estaba */
    }
  }

  onMounted(() => {
    users += 1
    refresh()
    if (!timer) timer = setInterval(refresh, 60_000)
  })
  onUnmounted(() => {
    users -= 1
    if (!users && timer) {
      clearInterval(timer)
      timer = undefined
    }
  })
  watch(() => userStore.canManageOrders, refresh)

  return { pending, refresh }
}
