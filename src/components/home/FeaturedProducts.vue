<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { productService } from '@/services/product.service'
import ProductCard from '@/components/product/ProductCard.vue'
import type { Product } from '@/types'

const props = defineProps<{
  title: string
  eyebrow: string
  query: Record<string, string | boolean>
}>()
const items = ref<Product[]>([])

onMounted(async () => {
  try {
    // `nuevo` es solo para la URL de "Ver todo"; el API entiende `newArrival`.
    const { nuevo: _nuevo, ...query } = props.query
    items.value = (await productService.list({ ...query, limit: 8 })).items
  } catch {
    items.value = []
  }
})
</script>

<template>
  <section v-if="items.length" class="featured">
    <header class="featured__head">
      <div>
        <p class="featured__eyebrow">{{ eyebrow }}</p>
        <h2 class="featured__title">{{ title }}</h2>
      </div>
      <RouterLink
        :to="{
          path: '/tienda',
          query: query.nuevo ? { nuevo: '1' } : (query as Record<string, string>),
        }"
        class="featured__more"
      >
        Ver todo <i class="fa-solid fa-arrow-right"></i>
      </RouterLink>
    </header>
    <div class="featured__rail">
      <ProductCard v-for="(p, i) in items" :key="p._id" :product="p" :style="{ '--i': i }" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.featured {
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

  &__more {
    font-size: $text-sm;
    font-weight: 600;
    color: $accent-deep;
    white-space: nowrap;
    @include flex(row, center, center, 0.4rem);
  }

  // Carrusel horizontal en móvil; en escritorio, fila con wrap.
  &__rail {
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
      flex: 0 0 62%;
      scroll-snap-align: start;
    }

    @include from('sm') {
      > * {
        flex-basis: 42%;
      }
    }

    @include from('md') {
      flex-wrap: wrap;
      overflow: visible;
      margin-inline: 0;
      padding-inline: 0;
      gap: 1.25rem;

      > * {
        flex: 1 1 calc(25% - 0.94rem);
        max-width: calc(25% - 0.94rem);
      }
    }
  }
}
</style>
