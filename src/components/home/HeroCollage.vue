<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { productService } from '@/services/product.service'
import { galleryService } from '@/services/gallery.service'
import { track, waitForImages } from '@/composables/usePreloader'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import { mainImage } from '@/utils/product'
import type { Product } from '@/types'

/**
 * Nube de fotos del catálogo flotando detrás del hero. Cada foto tiene su
 * propio ritmo de flotación y se desplaza apenas con el mouse (parallax).
 */
interface Card {
  key: string
  url: string
  to: string
}
const items = ref<Card[]>([])
const loading = ref(true)
const tilt = ref({ x: 0, y: 0 })

function onMove(e: MouseEvent) {
  const { innerWidth: w, innerHeight: h } = window
  tilt.value = { x: (e.clientX / w - 0.5) * 2, y: (e.clientY / h - 0.5) * 2 }
}

onMounted(() => track(load()))

async function load() {
  try {
    // Manda la galería del admin; si no hay suficientes fotos, los destacados.
    const g = await galleryService.list()
    if (g.length >= 4) {
      items.value = g.slice(0, 6).map((i) => ({ key: i._id, url: i.image.url, to: i.link || '/tienda' }))
    } else {
      const r = await productService.list({ featured: true, limit: 6 })
      const src: Product[] = r.items.length >= 4 ? r.items : (await productService.list({ sort: 'recent', limit: 6 })).items
      items.value = src.map((p) => ({ key: p._id, url: mainImage(p), to: `/producto/${p.slug}` }))
    }
  } catch {
    items.value = []
  }
  loading.value = false
  await waitForImages(items.value.map((i) => i.url))
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', onMove, { passive: true })
  }
}
onUnmounted(() => window.removeEventListener('mousemove', onMove))
</script>

<template>
  <div class="collage" aria-hidden="true">
    <template v-if="loading">
      <SkeletonBox v-for="n in 4" :key="n" class="collage__item collage__item--sk" :class="`collage__item--${n}`" :style="{ '--i': n - 1 }" />
    </template>
    <RouterLink
      v-else
      v-for="(p, i) in items.slice(0, 6)"
      :key="p.key"
      :to="p.to"
      class="collage__item"
      :class="`collage__item--${i + 1}`"
      :style="{ '--i': i, '--tx': `${tilt.x * (6 + i * 3)}px`, '--ty': `${tilt.y * (4 + i * 2)}px` }"
      tabindex="-1"
    >
      <img :src="p.url" :alt="''" loading="eager" />
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
// Móvil: el collage es un bloque propio debajo del texto con cuatro fotos
// enteras flotando. Escritorio: fotos absolutas en los márgenes del hero.
.collage {
  position: relative;
  height: 12.5rem;
  margin: 0.5rem 1.25rem 1rem;
  pointer-events: none;

  @include from('md') {
    height: 15rem;
    margin-bottom: 1.5rem;
  }

  @include from('lg') {
    position: absolute;
    inset: 0;
    height: auto;
    margin: 0;
    overflow: hidden;
  }

  &__item {
    position: absolute;
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

    &--sk {
      opacity: 1;
      animation: none;
      box-shadow: none;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    // Móvil: cuatro fotos en abanico, todas dentro de la pantalla.
    &--1 { left: 0; top: 18%; width: 27vw; rotate: -9deg; }
    &--2 { left: 24%; top: 0; width: 34vw; rotate: 2deg; z-index: 2; }
    &--3 { right: 14%; top: 30%; width: 26vw; rotate: 7deg; z-index: 1; }
    &--4 { right: -2%; top: 2%; width: 22vw; rotate: 12deg; }
    &--5, &--6 { display: none; }

    // Tablet: mismas cuatro fotos, más chicas y centradas.
    @include from('md') {
      &--1 { left: 12%; width: 150px; }
      &--2 { left: 30%; width: 190px; }
      &--3 { right: 26%; width: 150px; }
      &--4 { right: 10%; width: 130px; }
    }

    // Escritorio: en los márgenes, nunca sobre el texto.
    @include from('lg') {
      width: 11vw;
      max-width: 170px;
      z-index: auto;

      &--1 { top: 8%; right: 1.5%; left: auto; width: 11vw; rotate: 8deg; }
      &--2 { bottom: 8%; left: 1.5%; top: auto; width: 11vw; rotate: -10deg; }
      &--3 { bottom: 6%; right: 3%; top: auto; width: 8vw; rotate: -5deg; }
      &--4 { top: 34%; left: 2.5%; right: auto; width: 8vw; rotate: 5deg; }
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
