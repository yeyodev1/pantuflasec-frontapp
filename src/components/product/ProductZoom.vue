<script setup lang="ts">
import { ref } from 'vue'

/**
 * Foto principal con lupa estilo Amazon: con mouse fino, al pasar por encima
 * se ve la imagen ampliada siguiendo el cursor; con clic (o toque) se abre el
 * visor a pantalla completa.
 */
const props = defineProps<{ src: string; alt: string; scale?: number }>()
const emit = defineEmits<{ open: [] }>()

const zooming = ref(false)
const pos = ref({ x: 50, y: 50 })
const factor = props.scale ?? 2.4

function onMove(e: MouseEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  pos.value = {
    x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
    y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
  }
}
</script>

<template>
  <button
    type="button"
    class="zoom"
    :class="{ 'zoom--on': zooming }"
    :aria-label="`Ampliar foto de ${alt}`"
    @mouseenter="zooming = true"
    @mouseleave="zooming = false"
    @mousemove="onMove"
    @click="emit('open')"
  >
    <img :src="src" :alt="alt" class="zoom__img" />
    <span
      class="zoom__lens"
      :style="{
        backgroundImage: `url(${src})`,
        backgroundPosition: `${pos.x}% ${pos.y}%`,
        backgroundSize: `${factor * 100}%`,
      }"
    ></span>
    <span class="zoom__hint"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
  </button>
</template>

<style scoped lang="scss">
.zoom {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: $radius-md;
  overflow: hidden;
  background: $sand;
  cursor: zoom-in;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // La lupa es la misma imagen como fondo, ampliada y desplazada con el cursor.
  &__lens {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  &__hint {
    position: absolute;
    right: 0.7rem;
    bottom: 0.7rem;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: $radius-pill;
    background: rgba($paper, 0.9);
    color: $ink;
    font-size: 0.85rem;
    @include flex(row, center, center);
    box-shadow: $shadow-sm;
  }

  @media (hover: hover) and (pointer: fine) {
    &--on .zoom__lens {
      opacity: 1;
    }
  }
}
</style>
