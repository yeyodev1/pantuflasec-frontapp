<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import type { Product } from '@/types'

/** Carril horizontal de productos con título; en escritorio se vuelve fila con wrap. */
defineProps<{ eyebrow: string; title: string; items: Product[]; more?: { path: string; query?: Record<string, string> } }>()
</script>

<template>
  <section v-if="items.length" class="rail" v-reveal>
    <header class="rail__head">
      <div>
        <p class="rail__eyebrow">{{ eyebrow }}</p>
        <h2 class="rail__title">{{ title }}</h2>
      </div>
      <RouterLink v-if="more" :to="more" class="rail__more">Ver más <i class="fa-solid fa-arrow-right"></i></RouterLink>
    </header>
    <div class="rail__track">
      <ProductCard v-for="(p, i) in items" :key="p._id" :product="p" :style="{ '--i': i }" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.rail {
  padding-top: $space-lg;

  &__head {
    @include flex(row, flex-end, space-between, 1rem);
    margin-bottom: 0.9rem;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($text-xl, 600);
  }

  &__more {
    font-size: $text-sm;
    font-weight: 600;
    color: $accent-deep;
    white-space: nowrap;
    @include flex(row, center, center, 0.4rem);
  }

  &__track {
    display: flex;
    gap: 0.8rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    margin-inline: -1.25rem;
    padding-inline: 1.25rem;
    padding-bottom: 0.4rem;

    &::-webkit-scrollbar {
      display: none;
    }

    > * {
      flex: 0 0 58%;
      scroll-snap-align: start;
    }

    @include from('sm') {
      > * {
        flex-basis: 40%;
      }
    }

    @include from('md') {
      margin-inline: 0;
      padding-inline: 0;
      gap: 1rem;

      > * {
        flex-basis: calc(25% - 0.75rem);
      }
    }
  }
}
</style>
