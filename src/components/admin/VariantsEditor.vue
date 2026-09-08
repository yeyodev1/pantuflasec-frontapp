<script setup lang="ts">
import type { VariantDraft } from '@/composables/useProductForm'
import { netOfPrice } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'

defineProps<{ variants: VariantDraft[] }>()
const emit = defineEmits<{ add: []; remove: [index: number] }>()
</script>

<template>
  <fieldset class="variants">
    <legend>Variantes (talla, color, stock)</legend>
    <p class="variants__hint">
      Sin variantes el producto se vende sin control de stock. Deja el precio vacío para usar el precio base.
      El precio de la variante es el que ve el cliente; abajo se indica lo que recibes con tarjeta.
    </p>
    <div v-for="(v, i) in variants" :key="i" class="variants__row">
      <label>Talla <input v-model="v.size" placeholder="34-39" /></label>
      <label>Color <input v-model="v.color" placeholder="Opcional" /></label>
      <label>Etiqueta <input v-model="v.label" placeholder="Auto" /></label>
      <label
        >Precio cliente <input v-model="v.price" type="number" step="0.01" min="0" placeholder="Base" />
        <small v-if="Number(v.price) > 0" class="variants__net">recibes {{ formatMoney(netOfPrice(Number(v.price))) }}</small>
      </label>
      <label>Stock <input v-model="v.stock" type="number" min="0" step="1" /></label>
      <button type="button" class="variants__remove" aria-label="Quitar" @click="emit('remove', i)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <button type="button" class="btn btn--ghost" @click="emit('add')">
      <i class="fa-solid fa-plus"></i> Agregar variante
    </button>
  </fieldset>
</template>

<style scoped lang="scss">
.variants {
  border: none;
  @include flex(column, stretch, flex-start, 0.7rem);

  legend {
    @include display($text-lg, 600);
    margin-bottom: 0.4rem;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__net {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.65rem;
    font-weight: 600;
    color: $success;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: flex-end;
    padding: 0.6rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;

    label {
      flex: 1 1 calc(50% - 0.5rem);
      margin: 0;
    }

    @include from('md') {
      flex-wrap: nowrap;

      label {
        flex: 1 1 0;
      }
    }
  }

  &__remove {
    width: 2.4rem;
    height: 2.6rem;
    color: $ink-muted;

    &:hover {
      color: $danger;
    }
  }
}
</style>
