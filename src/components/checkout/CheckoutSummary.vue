<script setup lang="ts">
import type { CartLine } from '@/stores/cart'
import { formatMoney } from '@/utils/format'

defineProps<{
  lines: CartLine[]
  subtotal: number
  shippingCost: number
  shippingLabel: string
  tax: number
  taxRate: number
  total: number
}>()
</script>

<template>
  <aside class="summary">
    <h2 class="summary__title">Tu pedido</h2>
    <ul class="summary__list">
      <li v-for="l in lines" :key="l.key" class="summary__line">
        <img :src="l.image" :alt="l.name" width="48" height="48" />
        <span class="summary__name">
          {{ l.name }}
          <small v-if="l.variantLabel">{{ l.variantLabel }}</small>
          <small>× {{ l.qty }}</small>
        </span>
        <span>{{ formatMoney(l.unitPrice * l.qty) }}</span>
      </li>
    </ul>
    <dl class="summary__totals">
      <dt>Subtotal</dt>
      <dd>{{ formatMoney(subtotal) }}</dd>
      <dt>{{ shippingLabel || 'Envío' }}</dt>
      <dd>{{ shippingCost ? formatMoney(shippingCost) : 'Gratis' }}</dd>
      <dt>IVA ({{ Math.round(taxRate * 100) }}%)</dt>
      <dd>{{ formatMoney(tax) }}</dd>
      <dt class="summary__total">Total</dt>
      <dd class="summary__total">{{ formatMoney(total) }}</dd>
    </dl>
  </aside>
</template>

<style scoped lang="scss">
.summary {
  @include card;
  padding: 1.1rem 1.2rem;
  background: $sand;
  border: none;
  --i: 3;
  @include reveal;

  &__title {
    @include display($text-lg, 600);
    margin-bottom: 0.6rem;
  }

  &__list {
    list-style: none;
  }

  &__line {
    @include flex(row, center, space-between, 0.7rem);
    font-size: $text-sm;
    padding-block: 0.5rem;
    border-bottom: 1px solid rgba($ink, 0.06);

    img {
      flex: 0 0 3rem;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: $radius-sm;
      background: $surface;
    }
  }

  &__name {
    flex: 1;
    @include flex(column, flex-start, center);
    font-weight: 600;
    line-height: 1.25;

    small {
      font-weight: 400;
      color: $ink-muted;
    }
  }

  &__totals {
    display: flex;
    flex-wrap: wrap;
    margin-top: 0.8rem;
    font-size: $text-sm;

    dt {
      flex: 1 1 60%;
      color: $ink-soft;
      padding-block: 0.2rem;
    }

    dd {
      flex: 1 1 40%;
      text-align: right;
      padding-block: 0.2rem;
    }
  }

  &__total {
    font-size: $text-lg;
    font-weight: 700;
    color: $ink;
    margin-top: 0.4rem;
    border-top: 1px solid rgba($ink, 0.1);
    padding-top: 0.6rem !important;
  }
}
</style>
