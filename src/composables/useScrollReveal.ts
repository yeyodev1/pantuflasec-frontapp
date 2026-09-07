import type { Directive } from 'vue'

/**
 * v-reveal: el elemento entra animado cuando aparece en pantalla.
 * Solo agrega la clase `is-in`; el movimiento lo define `.reveal-on-scroll`
 * en global.scss. Con `v-reveal="n"` se escalona con --i.
 */
const seen = new WeakMap<Element, IntersectionObserver>()

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal-on-scroll')
    if (binding.value !== undefined) el.style.setProperty('--i', String(binding.value))
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-in')
            io.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    seen.set(el, io)
  },
  unmounted(el) {
    seen.get(el)?.disconnect()
  },
}
