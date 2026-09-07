<script setup lang="ts">
import type { ShippingMethod, ShopConfig } from '@/types'
import { formatMoney } from '@/utils/format'

defineProps<{ methods: ShopConfig['shippingMethods']; value: ShippingMethod; loading?: boolean }>()
const emit = defineEmits<{ change: [method: ShippingMethod] }>()

const meta: Record<string, { icon: string; text: string }> = {
  pickup: { icon: 'fa-solid fa-store', text: 'La Garzota, frente al Garzocentro. Te avisamos cuando esté listo.' },
  gye: { icon: 'fa-solid fa-motorcycle', text: 'Entrega en la ciudad en 1 a 2 días hábiles.' },
  ec: { icon: 'fa-solid fa-truck-fast', text: 'Servientrega a todo el país, de 24 a 72 horas.' },
}
</script>

<template>
  <div class="methods" role="radiogroup" aria-label="Método de entrega">
    <p v-if="loading" class="methods__hint">Cargando opciones…</p>
    <button
      v-for="(m, i) in methods"
      :key="m.key"
      type="button"
      role="radio"
      :aria-checked="value === m.key"
      class="opt"
      :class="{ 'opt--on': value === m.key }"
      :style="{ '--i': i }"
      @click="emit('change', m.key)"
    >
      <span class="opt__icon"><i :class="meta[m.key]?.icon ?? 'fa-solid fa-box'"></i></span>
      <span class="opt__body">
        <strong>{{ m.label.replace(/\s*\(.*\)$/, '') }}</strong>
        <small>{{ meta[m.key]?.text }}</small>
      </span>
      <span class="opt__price" :class="{ 'opt__price--free': !m.cost }">
        {{ m.cost ? formatMoney(m.cost) : 'Gratis' }}
      </span>
      <span class="opt__check"><i class="fa-solid fa-check"></i></span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.methods {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }
}

.opt {
  position: relative;
  @include flex(row, center, flex-start, 0.8rem);
  text-align: left;
  width: 100%;
  padding: 0.85rem 0.9rem;
  border: 1.5px solid $line;
  border-radius: $radius-md;
  background: $surface;
  @include transition;
  @include press;
  @include reveal(0.4s, 0.05s);

  &__icon {
    flex: 0 0 2.6rem;
    height: 2.6rem;
    border-radius: $radius-sm;
    background: $sand;
    color: $ink-soft;
    @include flex(row, center, center);
    font-size: 1rem;
    @include transition;
  }

  &__body {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);

    strong {
      font-size: $text-sm;
      color: $ink;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
      line-height: 1.3;
    }
  }

  &__price {
    font-weight: 700;
    font-size: $text-sm;
    color: $ink;
    white-space: nowrap;

    &--free {
      color: $success;
    }
  }

  &__check {
    position: absolute;
    top: -0.45rem;
    right: -0.45rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $surface;
    font-size: 0.65rem;
    @include flex(row, center, center);
    scale: 0;
    transition: scale 0.25s $ease;
  }

  &--on {
    border-color: $accent;
    background: $accent-soft;

    .opt__icon {
      background: $accent;
      color: $surface;
    }

    .opt__check {
      scale: 1;
    }
  }
}
</style>
