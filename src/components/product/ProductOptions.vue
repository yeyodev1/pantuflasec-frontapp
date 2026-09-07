<script setup lang="ts">
import type { Product, ProductVariant } from '@/types'
import { formatMoney } from '@/utils/format'

defineProps<{
  product: Product
  variant: ProductVariant | null
  qty: number
  maxQty: number
  canBuy: boolean
}>()

const emit = defineEmits<{
  pick: [variant: ProductVariant]
  'update:qty': [qty: number]
  add: []
}>()
</script>

<template>
  <div v-if="product.variants.length" class="variants">
    <p class="variants__label">Elige una opción</p>
    <div class="variants__list">
      <button
        v-for="v in product.variants"
        :key="v._id"
        class="variants__opt"
        :class="{ 'variants__opt--on': variant?._id === v._id, 'variants__opt--out': v.stock <= 0 }"
        :disabled="v.stock <= 0"
        @click="emit('pick', v)"
      >
        {{ v.label }}
        <small v-if="v.price !== null && v.price !== product.price">{{ formatMoney(v.price) }}</small>
      </button>
    </div>
    <p v-if="variant && variant.stock <= 3" class="variants__stock">Quedan {{ variant.stock }}</p>
  </div>

  <div class="buy">
    <div class="buy__qty">
      <button aria-label="Menos" :disabled="qty <= 1" @click="emit('update:qty', qty - 1)">
        <i class="fa-solid fa-minus"></i>
      </button>
      <span>{{ qty }}</span>
      <button aria-label="Más" :disabled="qty >= maxQty" @click="emit('update:qty', qty + 1)">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    <button class="btn btn--primary buy__cta" :disabled="!canBuy" @click="emit('add')">
      <i class="fa-solid fa-bag-shopping"></i>
      {{ canBuy ? 'Agregar al carrito' : 'Agotado' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.variants {
  &__label {
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__opt {
    @include flex(column, center, center, 0.1rem);
    min-width: 3.2rem;
    padding: 0.55rem 0.9rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    font-size: $text-sm;
    font-weight: 600;
    @include transition;
    @include press;

    small {
      font-size: 0.68rem;
      font-weight: 500;
      color: $ink-muted;
    }

    &--on {
      border-color: $accent;
      background: $accent-soft;
      color: $accent-deep;
    }

    &--out {
      opacity: 0.4;
      text-decoration: line-through;
      cursor: not-allowed;
    }
  }

  &__stock {
    font-size: $text-xs;
    color: $warning;
    margin-top: 0.4rem;
  }
}

.buy {
  @include flex(row, stretch, flex-start, 0.6rem);
  margin-top: 0.4rem;

  &__qty {
    @include flex(row, center, center);
    border: 1px solid $line;
    border-radius: $radius-pill;
    background: $surface;

    button {
      width: 2.6rem;
      height: 2.8rem;
      color: $ink-soft;

      &:disabled {
        opacity: 0.3;
      }
    }

    span {
      min-width: 1.6rem;
      text-align: center;
      font-weight: 600;
    }
  }

  &__cta {
    flex: 1;
  }
}
</style>
