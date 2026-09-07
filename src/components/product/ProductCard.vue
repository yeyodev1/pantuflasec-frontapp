<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types'
import { formatMoney } from '@/utils/format'
import { inStock, mainImage, priceRange } from '@/utils/product'

const props = defineProps<{ product: Product }>()

const range = computed(() => priceRange(props.product))
const available = computed(() => inStock(props.product))
const hasVariants = computed(() => props.product.variants.length > 0)
</script>

<template>
  <RouterLink :to="{ name: 'Product', params: { slug: product.slug } }" class="card">
    <div class="card__media">
      <img :src="mainImage(product)" :alt="product.name" loading="lazy" width="400" height="400" />
      <span v-if="!available" class="card__badge card__badge--out">Agotado</span>
      <span v-else-if="product.featured" class="card__badge">Destacado</span>
    </div>
    <div class="card__body">
      <p v-if="product.collection" class="card__collection">{{ product.collection }}</p>
      <h3 class="card__name">{{ product.name }}</h3>
      <p class="card__price">
        <span v-if="range.min !== range.max" class="card__from">desde</span>
        {{ formatMoney(range.min) }}
        <s v-if="product.compareAtPrice" class="card__compare">
          {{ formatMoney(product.compareAtPrice) }}
        </s>
      </p>
      <p v-if="hasVariants" class="card__meta">
        {{ product.variants.map((v) => v.label).join(' · ') }}
      </p>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.card {
  @include card;
  @include flex(column, stretch, flex-start);
  height: 100%;
  overflow: hidden;
  @include lift;
  @include reveal;

  // La foto siempre ocupa un cuadrado: la imagen va absoluta para que su
  // tamaño real no estire la tarjeta y todas queden iguales.
  &__media {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: $sand;

    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s $ease;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover .card__media img {
      transform: scale(1.04);
    }
  }

  &__badge {
    position: absolute;
    top: 0.6rem;
    left: 0.6rem;
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.25rem 0.6rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $surface;

    &--out {
      background: $ink;
    }
  }

  &__body {
    flex: 1;
    padding: 0.8rem 0.9rem 1rem;
    @include flex(column, stretch, flex-start, 0.2rem);
  }

  &__collection {
    @include eyebrow;
    font-size: 0.62rem;
  }

  &__name {
    font-family: $font-principal;
    font-size: $text-sm;
    font-weight: 600;
    line-height: 1.3;
    color: $ink;
    // Dos líneas fijas: los nombres largos no desalinean la fila.
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: calc(1.3em * 2);
  }

  &__price {
    font-size: $text-base;
    font-weight: 700;
    color: $accent-deep;
    margin-top: auto;
    padding-top: 0.3rem;
  }

  &__from {
    font-size: $text-xs;
    font-weight: 500;
    color: $ink-muted;
  }

  &__compare {
    font-size: $text-xs;
    font-weight: 400;
    color: $ink-muted;
    margin-left: 0.3rem;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
