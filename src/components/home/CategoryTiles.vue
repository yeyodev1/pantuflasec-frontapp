<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { productService } from '@/services/product.service'
import { categories } from '@/config/catalog'
import type { ProductFacets } from '@/types'

const facets = ref<ProductFacets | null>(null)

onMounted(async () => {
  try {
    facets.value = await productService.facets()
  } catch {
    facets.value = null
  }
})

function count(key: string) {
  return facets.value?.categories.find((c) => c.key === key)?.count ?? 0
}
</script>

<template>
  <section class="tiles">
    <p class="tiles__eyebrow">Explora</p>
    <h2 class="tiles__title">¿Qué estás buscando?</h2>
    <div class="tiles__grid">
      <RouterLink
        v-for="(c, i) in categories"
        v-show="!facets || count(c.key) > 0"
        :key="c.key"
        :to="{ path: '/tienda', query: { categoria: c.key } }"
        class="tile"
        :style="{ '--i': i }"
      >
        <i :class="c.icon"></i>
        <span class="tile__label">{{ c.label }}</span>
        <small v-if="facets" class="tile__count">{{ count(c.key) }}</small>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tiles {
  @include container;
  padding-block: $space-lg 0;

  &__eyebrow {
    @include eyebrow;
    @include reveal;
  }

  &__title {
    @include display($display-sm);
    margin-bottom: 1rem;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;

    > * {
      flex: 1 1 calc(50% - 0.3rem);
      max-width: calc(50% - 0.3rem);
    }

    @include from('sm') {
      > * {
        flex-basis: calc(33.333% - 0.4rem);
        max-width: calc(33.333% - 0.4rem);
      }
    }

    @include from('lg') {
      gap: 0.8rem;

      > * {
        flex-basis: calc(20% - 0.64rem);
        max-width: calc(20% - 0.64rem);
      }
    }
  }
}

.tile {
  @include card;
  @include flex(column, flex-start, center, 0.3rem);
  padding: 1rem;
  min-height: 6rem;
  @include lift(-2px, $shadow-sm);
  @include press;
  @include reveal;

  i {
    font-size: 1.3rem;
    color: $accent-deep;
    transition: transform 0.3s $ease;
  }

  &:hover {
    border-color: $accent;

    i {
      transform: scale(1.15) rotate(-6deg);
    }
  }

  &__label {
    font-weight: 600;
    font-size: $text-sm;
  }

  &__count {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
