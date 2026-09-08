<script setup lang="ts">
import { ref, watch } from 'vue'
import { categories, sorts } from '@/config/catalog'
import type { ProductFacets, ProductQuery, ProductSort } from '@/types'

const props = defineProps<{ query: ProductQuery; facets: ProductFacets | null; total: number }>()
const emit = defineEmits<{ change: [patch: Partial<ProductQuery>] }>()

const search = ref(props.query.q ?? '')
watch(
  () => props.query.q,
  (v) => (search.value = v ?? ''),
)

// La búsqueda se envía al soltar el teclado, no en cada tecla.
let timer: ReturnType<typeof setTimeout> | undefined
watch(search, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (v !== (props.query.q ?? '')) emit('change', { q: v })
  }, 350)
})

function count(key: string): number {
  return props.facets?.categories.find((c) => c.key === key)?.count ?? 0
}
</script>

<template>
  <div class="filters">
    <label class="filters__search">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input v-model="search" type="search" placeholder="Buscar: stitch, snoopy, taza…" />
    </label>

    <div class="filters__chips">
      <button
        class="chip"
        :class="{ 'chip--on': !query.category && !query.newArrival }"
        @click="emit('change', { category: '', newArrival: false })"
      >
        Todo
      </button>
      <button
        class="chip chip--new"
        :class="{ 'chip--on': query.newArrival }"
        @click="emit('change', { newArrival: !query.newArrival })"
      >
        <i class="fa-solid fa-wand-magic-sparkles"></i> Nuevo
      </button>
      <button
        v-for="c in categories"
        v-show="!facets || count(c.key) > 0"
        :key="c.key"
        class="chip"
        :class="{ 'chip--on': query.category === c.key }"
        @click="emit('change', { category: c.key })"
      >
        <i :class="c.icon"></i> {{ c.label }}
      </button>
    </div>

    <div class="filters__row">
      <select
        :value="query.collection || ''"
        aria-label="Colección"
        @change="emit('change', { collection: ($event.target as HTMLSelectElement).value })"
      >
        <option value="">Todas las colecciones</option>
        <option v-for="c in facets?.collections ?? []" :key="c.name" :value="c.name">
          {{ c.name }} ({{ c.count }})
        </option>
      </select>
      <select
        :value="query.sort || 'featured'"
        aria-label="Ordenar"
        @change="
          emit('change', { sort: ($event.target as HTMLSelectElement).value as ProductSort })
        "
      >
        <option v-for="s in sorts" :key="s.key" :value="s.key">{{ s.label }}</option>
      </select>
    </div>

    <p class="filters__total">{{ total }} {{ total === 1 ? 'producto' : 'productos' }}</p>
  </div>
</template>

<style scoped lang="scss">
.filters {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__search {
    position: relative;
    margin: 0;

    i {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: $ink-muted;
    }

    input {
      padding-left: 2.4rem;
      border-radius: $radius-pill;
    }
  }

  &__chips {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 0.2rem;
    margin-inline: -1.25rem;
    padding-inline: 1.25rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('md') {
      flex-wrap: wrap;
      margin-inline: 0;
      padding-inline: 0;
    }
  }

  &__row {
    @include flex(row, center, flex-start, 0.6rem);

    select {
      flex: 1;
      min-width: 0;
    }

    @include from('md') {
      select {
        flex: 0 1 240px;
      }
    }
  }

  &__total {
    font-size: $text-xs;
    color: $ink-muted;
  }
}

.chip {
  flex: 0 0 auto;
  @include flex(row, center, center, 0.4rem);
  font-size: $text-xs;
  font-weight: 600;
  padding: 0.5rem 0.95rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  background: $surface;
  color: $ink-soft;
  white-space: nowrap;
  @include transition;
  @include press;

  &--on,
  &:hover {
    border-color: $accent;
    color: $accent-deep;
    background: $accent-soft;
  }

  // "Nuevo" resalta en amarillo de marca para que se distinga de las categorías.
  &--new {
    border-color: $highlight;
    background: $highlight-soft;
    color: $ink;

    &.chip--on,
    &:hover {
      background: $highlight;
      border-color: $highlight;
      color: $ink;
    }
  }
}
</style>
