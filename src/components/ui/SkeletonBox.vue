<script setup lang="ts">
/** Bloque gris con brillo para estados de carga. Controla tamaño con class/style. */
defineProps<{ radius?: string }>()
</script>

<template>
  <span class="sk" :style="{ borderRadius: radius ?? '14px' }" aria-hidden="true"></span>
</template>

<style scoped lang="scss">
.sk {
  display: block;
  width: 100%;
  background: linear-gradient(100deg, $sand 30%, $surface 50%, $sand 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
</style>
