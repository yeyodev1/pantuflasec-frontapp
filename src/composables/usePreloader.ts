import { ref } from 'vue'

/**
 * Pantalla de carga inicial conectada a lo que la vista realmente necesita.
 *
 * Cada bloque con imágenes (collage, galería, categorías, catálogo, producto)
 * registra su carga con `track()`. El preloader se retira cuando el router,
 * las fuentes, la página y todo lo registrado terminaron, con un mínimo para
 * que no parpadee y un máximo para que nunca deje la pantalla en blanco si
 * algo externo se cuelga.
 */
const ready = ref(false)
const pending = new Set<Promise<unknown>>()
let started = false
let baseDone = false
let settleTimer: ReturnType<typeof setTimeout> | undefined

function check() {
  if (ready.value || !baseDone) return
  clearTimeout(settleTimer)
  // Se espera un instante por si una respuesta del API dispara más cargas.
  settleTimer = setTimeout(() => {
    if (pending.size === 0) ready.value = true
  }, 120)
}

export function track<T>(work: Promise<T>): Promise<T> {
  if (ready.value) return work
  pending.add(work)
  const done = () => {
    pending.delete(work)
    check()
  }
  work.then(done, done)
  return work
}

/** Resuelve cuando todas las imágenes cargaron (o fallaron); nunca se cuelga. */
export function waitForImages(urls: string[], timeoutMs = 4000): Promise<void> {
  const list = urls.filter(Boolean)
  if (!list.length) return Promise.resolve()
  return new Promise((resolve) => {
    let left = list.length
    const one = () => {
      left -= 1
      if (left === 0) resolve()
    }
    for (const url of list) {
      const img = new Image()
      img.onload = one
      img.onerror = one
      img.src = url
      if (img.complete) one()
    }
    setTimeout(resolve, timeoutMs)
  })
}

export function usePreloader() {
  function start(extra: Promise<unknown>[] = [], minMs = 700, maxMs = 6000) {
    if (started) return
    started = true
    const fonts = 'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve()
    const loaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
    const min = new Promise<void>((r) => setTimeout(r, minMs))
    Promise.all([fonts, loaded, min, ...extra]).then(() => {
      baseDone = true
      check()
    })
    setTimeout(() => (ready.value = true), maxMs)
  }
  return { ready, start }
}
