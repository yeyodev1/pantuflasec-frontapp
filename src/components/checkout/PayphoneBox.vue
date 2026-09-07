<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PayphoneBoxParams } from '@/types'

/**
 * Pinta la Cajita de Pagos de PayPhone. El script y el CSS vienen por CDN
 * desde index.html; acá solo se instancia con los montos que fijó el backend.
 * Al terminar, PayPhone redirige a /pay-response con id y clientTransactionId.
 */
const props = defineProps<{ params: PayphoneBoxParams }>()
const failed = ref(false)

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (id: string) => void }
  }
}

function render() {
  if (!window.PPaymentButtonBox) return false
  new window.PPaymentButtonBox({
    ...props.params,
    lang: 'es',
    defaultMethod: 'card',
    timeZone: -5,
  }).render('pp-button')
  return true
}

onMounted(() => {
  // El script es type="module": puede terminar de cargar después del montaje.
  if (render()) return
  let tries = 0
  const timer = setInterval(() => {
    tries += 1
    if (render() || tries > 40) {
      clearInterval(timer)
      if (tries > 40) failed.value = true
    }
  }, 250)
})
</script>

<template>
  <div class="box">
    <div id="pp-button"></div>
    <p v-if="failed" class="box__error">
      No se pudo cargar la pasarela de PayPhone. Revisa tu conexión y recarga la página.
    </p>
    <p class="box__note">
      <i class="fa-solid fa-lock"></i> Pago seguro procesado por PayPhone. No guardamos datos de tu tarjeta.
    </p>
  </div>
</template>

<style scoped lang="scss">
.box {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__error {
    color: $danger;
    font-size: $text-sm;
  }

  &__note {
    font-size: $text-xs;
    color: $ink-muted;
    text-align: center;
  }
}
</style>
