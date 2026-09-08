<script setup lang="ts">
import { useCatalog } from '@/composables/useCatalog'
import { categoryLabel } from '@/config/catalog'
import ProductCard from '@/components/product/ProductCard.vue'
import CatalogFilters from '@/components/product/CatalogFilters.vue'

const { items, total, pages, loading, error, facets, query, setFilter, setPage, reload } =
  useCatalog()
</script>

<template>
  <section class="catalog">
    <header class="catalog__head">
      <p class="catalog__eyebrow">{{ query.newArrival ? 'Recién llegado' : 'Tienda' }}</p>
      <h1 class="catalog__title">
        {{
          query.newArrival
            ? 'Nuevo en la tienda'
            : query.category
              ? categoryLabel(query.category)
              : 'Todo el catálogo'
        }}
      </h1>
    </header>

    <CatalogFilters :query="query" :facets="facets" :total="total" @change="setFilter" />

    <p v-if="error" class="catalog__state catalog__state--error">
      {{ error }}
      <button class="btn btn--ghost" @click="reload">Reintentar</button>
    </p>

    <div v-else-if="loading && !items.length" class="catalog__grid" aria-busy="true">
      <div v-for="n in 6" :key="n" class="catalog__skeleton"></div>
    </div>

    <p v-else-if="!items.length" class="catalog__state">
      <i class="fa-regular fa-face-frown"></i>
      No encontramos productos con esos filtros.
      <button
        class="btn btn--ghost"
        @click="setFilter({ q: '', category: '', collection: '', newArrival: false })"
      >
        Ver todo
      </button>
    </p>

    <div v-else class="catalog__grid" :class="{ 'catalog__grid--dim': loading }">
      <ProductCard v-for="(p, i) in items" :key="p._id" :product="p" :style="{ '--i': i % 12 }" />
    </div>

    <nav v-if="pages > 1" class="pager" aria-label="Páginas">
      <button
        class="btn btn--ghost"
        :disabled="(query.page ?? 1) <= 1"
        @click="setPage((query.page ?? 1) - 1)"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <span class="pager__label">{{ query.page ?? 1 }} / {{ pages }}</span>
      <button
        class="btn btn--ghost"
        :disabled="(query.page ?? 1) >= pages"
        @click="setPage((query.page ?? 1) + 1)"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </nav>
  </section>
</template>

<style scoped lang="scss">
.catalog {
  @include container;

  &__head {
    @include reveal;
  }
  @include flex(column, stretch, flex-start, 1.2rem);
  padding-block: $space-md $space-section;

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    @include transition(opacity);

    > * {
      // Dos columnas en móvil, siempre.
      flex: 1 1 calc(50% - 0.4rem);
      max-width: calc(50% - 0.4rem);
      min-width: 0;
    }

    @include from('sm') {
      gap: 1rem;
      > * {
        flex-basis: calc(50% - 0.5rem);
        max-width: calc(50% - 0.5rem);
      }
    }

    @include from('md') {
      > * {
        flex-basis: calc(33.333% - 0.67rem);
        max-width: calc(33.333% - 0.67rem);
      }
    }

    @include from('lg') {
      gap: 1.25rem;
      > * {
        flex-basis: calc(25% - 0.94rem);
        max-width: calc(25% - 0.94rem);
      }
    }

    &--dim {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &__skeleton {
    aspect-ratio: 1 / 1.4;
    border-radius: 14px;
    background: linear-gradient(100deg, $sand 30%, $surface 50%, $sand 70%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  &__state {
    @include flex(column, center, center, 0.8rem);
    text-align: center;
    color: $ink-soft;
    padding-block: $space-lg;

    i {
      font-size: 2rem;
      color: $ink-muted;
    }

    &--error {
      color: $danger;
    }
  }
}

.pager {
  @include flex(row, center, center, 1rem);
  margin-top: 0.5rem;

  .btn {
    padding: 0.6rem 0.9rem;
  }

  &__label {
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
