<script setup lang="ts">
import type { CartLine } from '@/stores/cart'
import { formatMoney } from '@/utils/format'

defineProps<{ line: CartLine }>()
const emit = defineEmits<{ qty: [qty: number]; remove: [] }>()
</script>

<template>
  <div class="line">
    <RouterLink :to="{ name: 'Product', params: { slug: line.slug } }" class="line__img">
      <img :src="line.image" :alt="line.name" width="72" height="72" />
    </RouterLink>
    <div class="line__body">
      <p class="line__name">{{ line.name }}</p>
      <p v-if="line.variantLabel" class="line__variant">{{ line.variantLabel }}</p>
      <div class="line__row">
        <div class="line__qty">
          <button aria-label="Menos" @click="emit('qty', line.qty - 1)"><i class="fa-solid fa-minus"></i></button>
          <span>{{ line.qty }}</span>
          <button aria-label="Más" :disabled="line.qty >= line.maxQty" @click="emit('qty', line.qty + 1)">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <span class="line__price">{{ formatMoney(line.unitPrice * line.qty) }}</span>
      </div>
    </div>
    <button class="line__remove" aria-label="Quitar" @click="emit('remove')">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
</template>

<style scoped lang="scss">
.line {
  @include flex(row, flex-start, flex-start, 0.8rem);
  padding-block: 0.9rem;
  border-bottom: 1px solid $line;

  &__img {
    flex: 0 0 4.5rem;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    overflow: hidden;
    background: $sand;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: $text-sm;
    font-weight: 600;
    line-height: 1.3;
  }

  &__variant {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__row {
    @include flex(row, center, space-between, 0.5rem);
    margin-top: 0.5rem;
  }

  &__qty {
    @include flex(row, center, center);
    border: 1px solid $line;
    border-radius: $radius-pill;

    button {
      width: 2rem;
      height: 2rem;
      font-size: 0.7rem;
      color: $ink-soft;

      &:disabled {
        opacity: 0.3;
      }
    }

    span {
      min-width: 1.4rem;
      text-align: center;
      font-size: $text-sm;
      font-weight: 600;
    }
  }

  &__price {
    font-weight: 700;
    color: $price;
  }

  &__remove {
    color: $ink-muted;
    width: 1.8rem;
    height: 1.8rem;

    &:hover {
      color: $danger;
    }
  }
}
</style>
