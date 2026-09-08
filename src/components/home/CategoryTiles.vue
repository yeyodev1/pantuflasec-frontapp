<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { productService } from '@/services/product.service'
import { categories } from '@/config/catalog'
import type { ProductFacets } from '@/types'
import { track, waitForImages } from '@/composables/usePreloader'

/**
 * Mosaico de categorías con la foto de portada de cada una. Las dos primeras
 * (pantuflas y peluches, lo fuerte de la tienda) van más grandes en escritorio.
 */
const facets = ref<ProductFacets | null>(null)

onMounted(() =>
  track(
    (async () => {
      try {
        facets.value = await productService.facets()
      } catch {
        facets.value = null
      }
      await waitForImages((facets.value?.categories ?? []).map((c) => c.cover ?? ''))
    })(),
  ),
)

const tiles = computed(() =>
  categories
    .map((c) => {
      const f = facets.value?.categories.find((x) => x.key === c.key)
      return { ...c, count: f?.count ?? 0, cover: f?.cover ?? null }
    })
    .filter((t) => !facets.value || t.count > 0),
)
</script>

<template>
  <section class="tiles">
    <header class="tiles__head">
      <div>
        <p class="tiles__eyebrow">Explora</p>
        <h2 class="tiles__title">¿Qué estás buscando?</h2>
      </div>
      <RouterLink to="/tienda" class="tiles__all">Todo el catálogo <i class="fa-solid fa-arrow-right"></i></RouterLink>
    </header>

    <div class="tiles__grid">
      <RouterLink
        v-for="(t, i) in tiles"
        :key="t.key"
        :to="{ path: '/tienda', query: { categoria: t.key } }"
        class="tile"
        :class="{ 'tile--big': i < 2 }"
        :style="{ '--i': i }"
      >
        <img v-if="t.cover" :src="t.cover" :alt="''" loading="lazy" class="tile__img" />
        <span class="tile__shade"></span>
        <span class="tile__icon"><i :class="t.icon"></i></span>
        <span class="tile__body">
          <strong class="tile__label">{{ t.label }}</strong>
          <small v-if="facets" class="tile__count">{{ t.count }} productos</small>
        </span>
        <span class="tile__go"><i class="fa-solid fa-arrow-right"></i></span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tiles {
  @include container;
  padding-block: $space-lg 0;

  &__head {
    @include flex(row, flex-end, space-between, 1rem);
    margin-bottom: 1rem;
    @include reveal;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__all {
    font-size: $text-sm;
    font-weight: 600;
    color: $accent-deep;
    white-space: nowrap;
    @include flex(row, center, center, 0.4rem);
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;

    > * {
      flex: 1 1 calc(50% - 0.35rem);
      max-width: calc(50% - 0.35rem);
    }

    @include from('md') {
      gap: 1rem;

      > * {
        flex-basis: calc(25% - 0.75rem);
        max-width: calc(25% - 0.75rem);
      }

      // Las dos primeras ocupan el doble de ancho.
      > .tile--big {
        flex-basis: calc(50% - 0.5rem);
        max-width: calc(50% - 0.5rem);
      }
    }
  }
}

.tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: $radius-md;
  overflow: hidden;
  background: $sand;
  color: $surface;
  isolation: isolate;
  @include reveal;
  @include press;

  @include from('md') {
    aspect-ratio: 4 / 3;

    &--big {
      aspect-ratio: 2 / 1;
    }
  }

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s $ease;
  }

  // Degradado marino de abajo hacia arriba para que el texto siempre se lea.
  &__shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba($ink, 0.85) 0%, rgba($ink, 0.35) 45%, rgba($ink, 0.05) 100%);
    transition: opacity 0.4s ease;
  }

  &__icon {
    position: absolute;
    top: 0.7rem;
    left: 0.7rem;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: $radius-pill;
    background: $highlight;
    color: $ink;
    font-size: 0.9rem;
    @include flex(row, center, center);
    box-shadow: $shadow-sm;

    @include from('md') {
      top: 1rem;
      left: 1rem;
      width: 2.6rem;
      height: 2.6rem;
      font-size: 1.05rem;
    }
  }

  &__body {
    position: absolute;
    inset: auto 0.9rem 0.8rem;
    @include flex(column, flex-start, flex-end, 0.1rem);

    @include from('md') {
      inset: auto 1.2rem 1.1rem;
    }
  }

  &__label {
    @include display($text-lg, 600);
    line-height: 1.1;
    text-shadow: 0 2px 10px rgba($ink, 0.4);

    .tile--big & {
      @include from('md') {
        font-size: $display-sm;
      }
    }
  }

  &__count {
    font-size: $text-xs;
    font-weight: 600;
    opacity: 0.85;
  }

  &__go {
    position: absolute;
    right: 0.8rem;
    bottom: 0.8rem;
    width: 2rem;
    height: 2rem;
    border-radius: $radius-pill;
    background: rgba($surface, 0.18);
    backdrop-filter: blur(6px);
    @include flex(row, center, center);
    font-size: 0.75rem;
    transition: transform 0.35s $ease, background 0.3s ease;

    @include from('md') {
      right: 1.1rem;
      bottom: 1.1rem;
      width: 2.4rem;
      height: 2.4rem;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      .tile__img {
        transform: scale(1.06);
      }

      .tile__go {
        background: $highlight;
        color: $ink;
        transform: translateX(3px);
      }
    }
  }
}
</style>
