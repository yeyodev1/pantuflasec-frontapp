<script setup lang="ts">
import { ref } from 'vue'
import type { Product, ProductVariant } from '@/types'
import { useCartStore } from '@/stores/cart'
import { formatMoney } from '@/utils/format'
import { pixel } from '@/utils/pixel'

/**
 * "Agregar" desde la tarjeta sin entrar al producto. Sin variantes agrega de
 * una; con variantes despliega un selector encima de la foto.
 */
const props = defineProps<{ product: Product }>()
const cart = useCartStore()
const picking = ref(false)

function add(variant: ProductVariant | null) {
  cart.add(props.product, variant, 1)
  pixel.addToCart(props.product._id, props.product.name, variant?.price ?? props.product.price, 1)
  picking.value = false
}

function onMain() {
  if (props.product.variants.length) picking.value = !picking.value
  else add(null)
}
</script>

<template>
  <div class="quick" @click.prevent.stop>
    <button type="button" class="quick__btn" :aria-label="`Agregar ${product.name}`" @click="onMain">
      <i :class="picking ? 'fa-solid fa-xmark' : 'fa-solid fa-plus'"></i>
    </button>

    <Transition name="rise">
      <div v-if="picking" class="quick__sheet" role="dialog" :aria-label="`Elige una opción de ${product.name}`">
        <p class="quick__title">Elige una opción</p>
        <div class="quick__opts">
          <button
            v-for="v in product.variants"
            :key="v._id"
            type="button"
            class="quick__opt"
            :disabled="v.stock <= 0"
            @click="add(v)"
          >
            {{ v.label }}
            <small v-if="v.price !== null && v.price !== product.price">{{ formatMoney(v.price) }}</small>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.quick {
  &__btn {
    position: absolute;
    right: 0.55rem;
    bottom: 0.55rem;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $surface;
    font-size: 0.95rem;
    @include flex(row, center, center);
    box-shadow: $shadow-md;
    @include transition;
    @include press;
    z-index: 2;

    &:hover {
      background: $accent-deep;
      transform: scale(1.06);
    }
  }

  &__sheet {
    position: absolute;
    inset: auto 0 0;
    z-index: 3;
    background: rgba($paper, 0.96);
    backdrop-filter: blur(6px);
    padding: 0.7rem 0.7rem 3.2rem;
    border-radius: 0 0 14px 14px;
  }

  &__title {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__opts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__opt {
    @include flex(column, center, center);
    padding: 0.35rem 0.6rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink;
    @include transition;
    @include press;

    small {
      font-size: 0.6rem;
      font-weight: 500;
      color: $ink-muted;
    }

    &:hover {
      border-color: $accent;
      background: $accent-soft;
      color: $accent-deep;
    }

    &:disabled {
      opacity: 0.35;
      text-decoration: line-through;
    }
  }
}
</style>
