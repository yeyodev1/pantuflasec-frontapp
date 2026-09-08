<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logo } from '@/config/site'
import { usePreloader } from '@/composables/usePreloader'

const router = useRouter()
const { ready, start } = usePreloader()
// La vista de la ruta se carga en diferido: sin esto el preloader se iba antes de tenerla.
onMounted(() => start([router.isReady()]))
</script>

<template>
  <Transition name="preload">
    <div v-if="!ready" class="preload" role="status" aria-live="polite" aria-label="Cargando">
      <img :src="logo.wordmark" alt="Pantuflas Ecuador" class="preload__logo" width="220" height="80" />
      <span class="preload__bar"><span></span></span>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.preload {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #ffcc00;
  @include flex(column, center, center, 1.4rem);

  &__logo {
    width: min(58vw, 240px);
    height: auto;
    animation: breathe 1.4s ease-in-out infinite;
  }

  &__bar {
    width: min(50vw, 200px);
    height: 4px;
    border-radius: $radius-pill;
    background: rgba($ink, 0.12);
    overflow: hidden;

    span {
      display: block;
      width: 40%;
      height: 100%;
      border-radius: $radius-pill;
      background: $brand-blue-deep;
      animation: slide 1.1s $ease infinite;
    }
  }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes slide {
  from { transform: translateX(-120%); }
  to { transform: translateX(300%); }
}

.preload-leave-active {
  transition: opacity 0.45s ease, transform 0.6s $ease;
}
.preload-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
