<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { productService } from '@/services/product.service'
import { mainImage } from '@/utils/product'
import type { Product } from '@/types'

/**
 * Nube de fotos del catálogo flotando detrás del hero. Cada foto tiene su
 * propio ritmo de flotación y se desplaza apenas con el mouse (parallax).
 */
const items = ref<Product[]>([])
const tilt = ref({ x: 0, y: 0 })

function onMove(e: MouseEvent) {
  const { innerWidth: w, innerHeight: h } = window
  tilt.value = { x: (e.clientX / w - 0.5) * 2, y: (e.clientY / h - 0.5) * 2 }
}

onMounted(async () => {
  try {
    const r = await productService.list({ featured: true, limit: 6 })
    items.value = r.items.length >= 4 ? r.items : (await productService.list({ sort: 'recent', limit: 6 })).items
  } catch {
    items.value = []
  }
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', onMove, { passive: true })
  }
})
onUnmounted(() => window.removeEventListener('mousemove', onMove))
</script>

<template>
  <div class="collage" aria-hidden="true">
    <RouterLink
      v-for="(p, i) in items.slice(0, 6)"
      :key="p._id"
      :to="{ name: 'Product', params: { slug: p.slug } }"
      class="collage__item"
      :class="`collage__item--${i + 1}`"
      :style="{ '--i': i, '--tx': `${tilt.x * (6 + i * 3)}px`, '--ty': `${tilt.y * (4 + i * 2)}px` }"
      tabindex="-1"
    >
      <img :src="mainImage(p)" :alt="''" loading="eager" />
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.collage {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  &__item {
    position: absolute;
    width: 22vw;
    max-width: 150px;
    aspect-ratio: 1;
    border-radius: $radius-md;
    overflow: hidden;
    box-shadow: $shadow-md;
    background: $surface;
    pointer-events: auto;
    opacity: 0;
    animation:
      pop-in 0.8s $ease both,
      float 6s ease-in-out infinite;
    animation-delay: calc(0.25s + var(--i) * 0.12s), calc(var(--i) * -1.1s);
    translate: var(--tx, 0) var(--ty, 0);
    transition: translate 0.4s ease-out;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @include from('md') {
      width: 12vw;
      max-width: 180px;
    }

    // Posiciones: siempre en los márgenes, nunca sobre el texto. El texto
    // ocupa un contenedor de 880px centrado; las fotos viven fuera de él.
    &--1 { top: -4%; right: -14%; width: 20vw; rotate: 8deg; }
    &--2 { bottom: -6%; left: -14%; width: 22vw; rotate: -10deg; }
    &--3, &--4, &--5, &--6 { display: none; }

    @include from('lg') {
      width: 11vw;
      max-width: 170px;

      &--1 { top: 8%; right: 1.5%; }
      &--2 { bottom: 8%; left: 1.5%; }
      &--3 { display: block; bottom: 6%; right: 3%; width: 8vw; rotate: -5deg; }
      &--4 { display: block; top: 34%; left: 2.5%; width: 8vw; rotate: 5deg; }
    }

    @include from('xl') {
      &--5 { display: block; top: 8%; left: 14%; width: 6vw; rotate: -6deg; }
      &--6 { display: block; top: 40%; right: 8%; width: 6vw; rotate: 4deg; }
    }
  }
}

@keyframes pop-in {
  from {
    opacity: 0;
    scale: 0.6;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}

@keyframes float {
  0%, 100% { margin-top: 0; }
  50% { margin-top: -12px; }
}
</style>
