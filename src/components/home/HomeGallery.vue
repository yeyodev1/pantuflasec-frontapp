<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { galleryService } from '@/services/gallery.service'
import { productService } from '@/services/product.service'
import { mainImage } from '@/utils/product'

/**
 * Tira de fotos en dos filas que corren en sentidos opuestos, con parallax
 * al hacer scroll y foco al pasar el mouse. Usa la galería del admin; si está
 * vacía, cae a los productos destacados para que la portada nunca quede sola.
 */
interface Slide {
  url: string
  title: string
  subtitle: string
  link: string
}

const slides = ref<Slide[]>([])

const rows = computed(() => {
  const list = slides.value
  if (list.length < 2) return [list, list]
  const half = Math.ceil(list.length / 2)
  return [list.slice(0, half), list.slice(half)]
})

// Cada mitad debe cubrir de sobra el ancho de pantalla: si hay pocas fotos se
// repiten hasta tener al menos 10, y luego la mitad se duplica para el loop.
function loop(row: Slide[]): Slide[] {
  if (!row.length) return []
  const half: Slide[] = []
  while (half.length < 10) half.push(...row)
  return [...half, ...half]
}

onMounted(async () => {
  try {
    const g = await galleryService.list()
    if (g.length >= 4) {
      slides.value = g.map((i) => ({ url: i.image.url, title: i.title, subtitle: i.subtitle, link: i.link }))
    } else {
      const p = (await productService.list({ featured: true, limit: 12 })).items
      const src = p.length >= 6 ? p : (await productService.list({ sort: 'recent', limit: 12 })).items
      slides.value = src.map((x) => ({
        url: mainImage(x),
        title: x.name,
        subtitle: x.collection,
        link: `/producto/${x.slug}`,
      }))
    }
  } catch {
    slides.value = []
  }
})
</script>

<template>
  <section v-if="slides.length" class="strip" aria-label="Galería">
    <div v-for="(row, r) in rows" :key="r" class="strip__row" :class="`strip__row--${r + 1}`">
      <component
        :is="s.link ? 'RouterLink' : 'div'"
        v-for="(s, i) in loop(row)"
        :key="`${r}-${i}`"
        :to="s.link || undefined"
        class="slide"
        :style="{ '--i': i % 8 }"
      >
        <img :src="s.url" :alt="s.title" loading="eager" decoding="async" />
        <span v-if="s.title" class="slide__cap">
          <strong>{{ s.title }}</strong>
          <small v-if="s.subtitle">{{ s.subtitle }}</small>
        </span>
      </component>
    </div>
  </section>
</template>

<style scoped lang="scss">
.strip {
  overflow: hidden;
  padding-block: 1.2rem;
  @include flex(column, stretch, flex-start, 0.8rem);

  &__row {
    display: flex;
    gap: 0.8rem;
    width: max-content;
    animation: strip-left 55s linear infinite;

    &--2 {
      animation-name: strip-right;
      animation-duration: 70s;
    }

    // La segunda fila más lenta y un poco más chica: sensación de profundidad
    // sin mover el bloque (mover el bloque dejaba un hueco arriba).
    &--2 .slide {
      width: 40vw;

      @include from('md') {
        width: 19vw;
      }
    }

    &:hover {
      animation-play-state: paused;
    }
  }
}

.slide {
  position: relative;
  flex: 0 0 auto;
  width: 46vw;
  max-width: 260px;
  aspect-ratio: 4 / 5;
  border-radius: $radius-md;
  overflow: hidden;
  background: $sand;
  box-shadow: $shadow-sm;
  transition:
    transform 0.5s $ease,
    box-shadow 0.5s ease;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s $ease;
  }

  &__cap {
    position: absolute;
    inset: auto 0 0;
    padding: 1.4rem 0.9rem 0.8rem;
    background: linear-gradient(to top, rgba($ink, 0.75), transparent);
    color: $paper;
    @include flex(column, flex-start, flex-end, 0.1rem);
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 0.35s ease,
      transform 0.35s $ease;

    strong {
      font-size: $text-sm;
      line-height: 1.2;
    }

    small {
      font-size: $text-xs;
      opacity: 0.85;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-6px) scale(1.04);
      box-shadow: $shadow-lg;
      z-index: 1;

      img {
        transform: scale(1.08);
      }

      .slide__cap {
        opacity: 1;
        transform: none;
      }
    }
  }

  @include from('md') {
    width: 22vw;
    max-width: 300px;
  }
}

@keyframes strip-left {
  to {
    transform: translateX(-50%);
  }
}

@keyframes strip-right {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
