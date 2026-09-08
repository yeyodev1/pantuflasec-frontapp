<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Barra de progreso arriba al cambiar de vista. Así, al ir de un producto al
 * inicio, se ve que algo está pasando mientras llega la vista y sus datos.
 */
const router = useRouter()
const active = ref(false)
const width = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

router.beforeEach(() => {
  active.value = true
  width.value = 12
  clearInterval(timer)
  timer = setInterval(() => (width.value = Math.min(88, width.value + (88 - width.value) * 0.18)), 150)
})
router.afterEach(() => {
  clearInterval(timer)
  width.value = 100
  setTimeout(() => {
    active.value = false
    width.value = 0
  }, 350)
})
router.onError(() => {
  clearInterval(timer)
  active.value = false
})
</script>

<template>
  <div class="bar" :class="{ 'bar--on': active }" :style="{ '--w': `${width}%` }" aria-hidden="true"></div>
</template>

<style scoped lang="scss">
.bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
  height: 3px;
  width: var(--w, 0%);
  background: linear-gradient(90deg, $brand-blue, $highlight);
  box-shadow: 0 0 10px rgba($highlight, 0.7);
  opacity: 0;
  transition: width 0.25s ease, opacity 0.3s ease;
  pointer-events: none;

  &--on {
    opacity: 1;
  }
}
</style>
