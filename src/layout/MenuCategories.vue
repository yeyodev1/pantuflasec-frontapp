<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { categories } from '@/config/catalog'
import { productService } from '@/services/product.service'
import type { ProductFacets } from '@/types'

/** Categorías del menú en foto: carrusel en móvil, mosaico en escritorio. */
const emit = defineEmits<{ pick: [] }>()
const facets = ref<ProductFacets | null>(null)

onMounted(async () => {
  try {
    facets.value = await productService.facets()
  } catch {
    facets.value = null
  }
})

const cats = computed(() =>
  categories
    .map((c) => {
      const f = facets.value?.categories.find((x) => x.key === c.key)
      return { ...c, count: f?.count ?? 0, cover: f?.cover ?? null }
    })
    .filter((c) => !facets.value || c.count > 0),
)
</script>

<template>
  <section>
    <p class="menu__eyebrow">Categorías</p>
    <div class="cats">
      <RouterLink
        v-for="(c, i) in cats"
        :key="c.key"
        :to="{ path: '/tienda', query: { categoria: c.key } }"
        class="cat"
        :style="{ '--i': i }"
        @click="emit('pick')"
      >
        <img v-if="c.cover" :src="c.cover" :alt="''" loading="lazy" />
        <span class="cat__shade"></span>
        <span class="cat__icon"><i :class="c.icon"></i></span>
        <span class="cat__label">{{ c.label }}<small v-if="facets">{{ c.count }}</small></span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.menu__eyebrow {
  @include eyebrow;
  color: $highlight;
  margin-bottom: 0.7rem;
}

.cats {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  margin-inline: -1.25rem;
  padding-inline: 1.25rem;
  padding-bottom: 0.3rem;

  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    flex: 0 0 38vw;
    max-width: 170px;
    scroll-snap-align: start;
  }

  @include from('md') {
    flex-wrap: wrap;
    overflow: visible;
    margin-inline: 0;
    padding-inline: 0;
    gap: 0.8rem;

    > * {
      flex: 1 1 calc(33.333% - 0.54rem);
      max-width: calc(33.333% - 0.54rem);
    }
  }
}

.cat {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: $radius-md;
  overflow: hidden;
  background: rgba($paper, 0.06);
  color: $paper;
  @include reveal(0.45s, 0.05s);
  @include press;

  @include from('md') {
    aspect-ratio: 4 / 3;
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s $ease;
  }

  &__shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba($ink, 0.9), rgba($ink, 0.15) 60%, transparent);
  }

  &__icon {
    position: absolute;
    top: 0.55rem;
    left: 0.55rem;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: $radius-pill;
    background: $highlight;
    color: $ink;
    font-size: 0.8rem;
    @include flex(row, center, center);
  }

  &__label {
    position: absolute;
    inset: auto 0.7rem 0.6rem;
    @include display($text-base, 600);
    line-height: 1.1;
    @include flex(column, flex-start, flex-end);

    small {
      font-family: $font-principal;
      font-size: 0.65rem;
      font-weight: 600;
      opacity: 0.75;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover img {
      transform: scale(1.06);
    }
  }
}
</style>
