<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '@/types'
import { describe, perks, slipperSizes, specs } from '@/utils/productCopy'

const props = defineProps<{ product: Product }>()
const text = computed(() => describe(props.product))
const rows = computed(() => specs(props.product))
const showSizes = ref(false)
</script>

<template>
  <div class="details">
    <ul class="perks">
      <li v-for="k in perks" :key="k.text"><i :class="k.icon"></i> {{ k.text }}</li>
    </ul>

    <p class="details__text">{{ text }}</p>

    <dl class="specs">
      <template v-for="r in rows" :key="r.label">
        <dt>{{ r.label }}</dt>
        <dd>{{ r.value }}</dd>
      </template>
    </dl>

    <div v-if="product.category === 'pantuflas'" class="sizes">
      <button type="button" class="sizes__toggle" :aria-expanded="showSizes" @click="showSizes = !showSizes">
        <i class="fa-solid fa-ruler"></i> Guía de tallas
        <i class="fa-solid fa-chevron-down sizes__chev" :class="{ 'sizes__chev--open': showSizes }"></i>
      </button>
      <Transition name="rise">
        <table v-if="showSizes" class="sizes__table">
          <thead>
            <tr><th>Talla</th><th>Medida</th><th>Calzado</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in slipperSizes" :key="s.size"><td>{{ s.size }}</td><td>{{ s.cm }}</td><td>{{ s.shoe }}</td></tr>
          </tbody>
        </table>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.details {
  @include flex(column, stretch, flex-start, 1rem);
  padding-top: 0.8rem;
  border-top: 1px solid $line;

  &__text {
    color: $ink-soft;
    white-space: pre-line;
  }
}

.perks {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  li {
    flex: 1 1 calc(50% - 0.25rem);
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-soft;
    padding: 0.55rem 0.7rem;
    background: $sand;
    border-radius: $radius-sm;

    i {
      color: $accent-deep;
      width: 1rem;
      text-align: center;
    }
  }
}

.specs {
  display: flex;
  flex-wrap: wrap;
  font-size: $text-sm;
  border: 1px solid $line;
  border-radius: $radius-sm;
  overflow: hidden;

  dt,
  dd {
    padding: 0.55rem 0.8rem;
    border-bottom: 1px solid $line;
  }

  dt {
    flex: 0 0 34%;
    color: $ink-muted;
    background: rgba($sand, 0.6);
  }

  dd {
    flex: 0 0 66%;
    font-weight: 500;
  }

  dt:nth-last-of-type(1),
  dd:last-child {
    border-bottom: none;
  }
}

.sizes {
  &__toggle {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    font-weight: 600;
    color: $accent-deep;
    padding: 0.3rem 0;

    i:first-child {
      width: 1rem;
    }
  }

  &__chev {
    font-size: 0.7rem;
    transition: transform 0.3s $ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__table {
    width: 100%;
    margin-top: 0.6rem;
    border-collapse: collapse;
    font-size: $text-sm;

    th,
    td {
      text-align: left;
      padding: 0.5rem 0.7rem;
      border-bottom: 1px solid $line;
    }

    th {
      font-size: $text-xs;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: $ink-muted;
    }
  }
}
</style>
