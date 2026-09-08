import { ref } from 'vue'

/**
 * Pantalla de carga inicial. Se quita cuando las fuentes y la página
 * terminaron de cargar, con un mínimo para que no parpadee y un máximo
 * para que nunca deje al usuario esperando si algo externo se cuelga.
 */
const ready = ref(false)
let started = false

export function usePreloader() {
  function start(minMs = 700, maxMs = 4000) {
    if (started) return
    started = true
    const fonts = 'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve()
    const loaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
    const min = new Promise<void>((r) => setTimeout(r, minMs))
    const max = new Promise<void>((r) => setTimeout(r, maxMs))
    Promise.race([Promise.all([fonts, loaded, min]), max]).then(() => (ready.value = true))
  }
  return { ready, start }
}
