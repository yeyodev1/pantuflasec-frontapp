import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Detecta que se publicó una versión nueva de la tienda.
 *
 * Cada build lleva su commit en `__APP_VERSION__` y publica el mismo valor en
 * `/version.json`. Si el archivo trae otro, la pestaña abierta está vieja: se
 * muestra el aviso con el botón "Actualizar". Se consulta al volver a la
 * pestaña y cada pocos minutos, no en cada navegación.
 *
 * Además, si un chunk de una vista no carga (Vite lanza `vite:preloadError`
 * porque los assets viejos ya no existen tras un deploy), se recarga sola una
 * vez: es el caso "no me deja entrar desde otra compu".
 */
const POLL_MS = 3 * 60 * 1000
const RELOAD_FLAG = 'pantuflas:reloaded-after-deploy'

export const currentVersion = __APP_VERSION__

export function useAppVersion() {
  const updateAvailable = ref(false)
  let timer: number | undefined

  async function check() {
    if (updateAvailable.value || document.visibilityState === 'hidden') return
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { version?: string }
      if (data.version && data.version !== currentVersion) updateAvailable.value = true
    } catch {
      // Sin red o sin archivo: no hay nada que avisar.
    }
  }

  function reload() {
    window.location.reload()
  }

  function onVisible() {
    if (document.visibilityState === 'visible') check()
  }

  function onPreloadError(event: Event) {
    event.preventDefault()
    // Una sola recarga automática: si el chunk sigue sin cargar, que lo vea el usuario.
    if (sessionStorage.getItem(RELOAD_FLAG)) return
    sessionStorage.setItem(RELOAD_FLAG, '1')
    reload()
  }

  onMounted(() => {
    sessionStorage.removeItem(RELOAD_FLAG)
    window.addEventListener('vite:preloadError', onPreloadError)
    document.addEventListener('visibilitychange', onVisible)
    timer = window.setInterval(check, POLL_MS)
    check()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('vite:preloadError', onPreloadError)
    document.removeEventListener('visibilitychange', onVisible)
    window.clearInterval(timer)
  })

  return { updateAvailable, currentVersion, reload, check }
}
