<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { productService } from '@/services/product.service'
import ProductCard from '@/components/product/ProductCard.vue'
import type { Product } from '@/types'

/**
 * Lo que el admin marcó con "Mostrar en el inicio", agrupado por colección:
 * cada colección es una sección con su nombre ("Flores amarillas") y un
 * "Ver todo" que lleva a esa colección en la tienda. Sin marcar nada, no pinta.
 */
interface Group {
  name: string
  items: Product[]
}
const groups = ref<Group[]>([])

onMounted(async () => {
  try {
    const { items } = await productService.list({ showOnHome: true, limit: 60 })
    const map = new Map<string, Product[]>()
    for (const p of items) {
      const name = p.collection || 'Seleccionados'
      map.set(name, [...(map.get(name) ?? []), p])
    }
    groups.value = [...map.entries()].map(([name, list]) => ({ name, items: list.slice(0, 8) }))
  } catch {
    groups.value = []
  }
})
</script>

<template>
  <section v-for="g in groups" :key="g.name" v-reveal class="collection">
    <header class="collection__head">
      <div>
        <p class="collection__eyebrow">En la portada</p>
        <h2 class="collection__title">{{ g.name }}</h2>
      </div>
      <RouterLink
        :to="g.name === 'Seleccionados' ? '/tienda' : { path: '/tienda', query: { coleccion: g.name } }"
        class="collection__more"
      >
        Ver todo <i class="fa-solid fa-arrow-right"></i>
      </RouterLink>
    </header>
    <div class="collection__rail">
      <ProductCard v-for="(p, i) in g.items" :key="p._id" :product="p" :style="{ '--i': i }" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.collection {
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
