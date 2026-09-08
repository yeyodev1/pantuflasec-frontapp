<script setup lang="ts">
import { ref } from 'vue'
import type { CartLine } from '@/stores/cart'
import { formatMoney } from '@/utils/format'

defineProps<{
  lines: CartLine[]
  subtotal: number
  shippingCost: number
  shippingLabel: string
  tax: number
  taxRate: number
  /** Los precios ya traen IVA: la fila es informativa y no suma al total. */
  taxIncluded?: boolean
  total: number
}>()

// En móvil el detalle va plegado: lo importante es el total y el botón.
const open = ref(false)
</script>

<template>
  <aside class="summary" :class="{ 'summary--open': open }">
    <button type="button" class="summary__head" :aria-expanded="open" @click="open = !open">
      <span class="summary__title">
        <i class="fa-solid fa-bag-shopping"></i>
        Tu pedido
        <small
          >{{ lines.reduce((n, l) => n + l.qty, 0) }}
          {{ lines.length === 1 && lines[0]?.qty === 1 ? 'artículo' : 'artículos' }}</small
        >
      </span>
      <span class="summary__total-inline">{{ formatMoney(total) }}</span>
      <i class="fa-solid fa-chevron-down summary__chev"></i>
    </button>

    <div class="summary__body">
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
        <dt>{{ shippingLabel.replace(/\s*\(.*\)$/, '') || 'Envío' }}</dt>
        <dd>{{ shippingCost ? formatMoney(shippingCost) : 'Gratis' }}</dd>
        <dt :class="{ summary__muted: taxIncluded }">
          {{ taxIncluded ? 'Incluye IVA' : 'IVA' }} ({{ Math.round(taxRate * 100) }}%)
        </dt>
        <dd :class="{ summary__muted: taxIncluded }">{{ formatMoney(tax) }}</dd>
        <dt class="summary__total">Total</dt>
        <dd class="summary__total">{{ formatMoney(total) }}</dd>
      </dl>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.summary {
  @include card;
  background: $sand;
  border: none;
  overflow: hidden;
  @include reveal;

  &__head {
    width: 100%;
    @include flex(row, center, space-between, 0.6rem);
    padding: 0.9rem 1.1rem;
    text-align: left;
  }

  &__title {
    @include display($text-lg, 600);
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $accent;
      font-size: 0.9rem;
    }

    small {
      font-family: $font-principal;
      font-size: $text-xs;
      font-weight: 500;
      color: $ink-muted;
    }
  }

  &__total-inline {
    margin-left: auto;
    font-weight: 700;
  }

  &__chev {
    font-size: 0.75rem;
    color: $ink-muted;
    transition: transform 0.3s $ease;
  }

  &__body {
    display: none;
    padding: 0 1.1rem 1rem;
  }

  &--open {
    .summary__body {
      display: block;
    }

    .summary__chev {
      transform: rotate(180deg);
    }
  }

  // En escritorio siempre abierto y sin comportamiento de acordeón.
  @include from('md') {
    &__head {
      pointer-events: none;
    }

    &__total-inline,
    &__chev {
      display: none;
    }

    &__body {
      display: block;
    }
  }

  &__list {
    list-style: none;
  }

  &__line {
    @include flex(row, center, space-between, 0.7rem);
    font-size: $text-sm;
    padding-block: 0.55rem;
    border-bottom: 1px solid rgba($ink, 0.06);

    img {
      flex: 0 0 3rem;
      width: 3rem;
      height: 3rem;
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

  &__muted {
    color: $ink-muted !important;
    font-size: $text-xs;
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
