<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import type { DeliveryQuote } from '@/types'
import { formatMoney } from '@/utils/format'

// Leaflet pesa: se carga solo cuando el cliente abre el mapa.
const LocationPicker = defineAsyncComponent(() => import('./LocationPicker.vue'))

/**
 * Ubicación para la entrega en moto: marcar en el mapa (camino principal) o
 * pegar un link de Google Maps. Debajo, la cotización en vivo del backend.
 */
const props = defineProps<{ location: string; quote: DeliveryQuote | null; resolving: boolean; origin: { lat: number; lng: number }; maxKm: number }>()
const emit = defineEmits<{ 'update:location': [value: string] }>()

const open = ref(false)
const picked = computed(() => {
  const m = props.location.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/)
  return m ? { lat: parseFloat(m[1]!), lng: parseFloat(m[2]!) } : null
})
const state = computed(() => {
  if (!props.location.trim()) return 'empty'
  if (props.resolving) return 'loading'
  if (!props.quote?.coords) return 'unknown'
  return props.quote.cost === null ? 'far' : 'ok'
})

function onPicked(c: { lat: number; lng: number }) {
  emit('update:location', `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`)
  open.value = false
}
</script>

<template>
  <div class="loc">
    <button type="button" class="loc__map" :class="{ 'loc__map--has': picked }" @click="open = true">
      <i class="fa-solid fa-map-location-dot"></i>
      <span>
        <strong>{{ picked ? 'Ubicación marcada · toca para ajustar' : 'Marcar mi ubicación en el mapa' }}</strong>
        <small>{{ picked ? 'Puedes mover el pin unos metros si hace falta' : 'Rápido: mueve el mapa hasta tu puerta y confirma' }}</small>
      </span>
      <i class="fa-solid fa-chevron-right loc__go"></i>
    </button>

    <label class="loc__link">
      <span>O pega tu link de Google Maps</span>
      <input :value="location" placeholder="https://maps.app.goo.gl/…" @input="emit('update:location', ($event.target as HTMLInputElement).value)" />
    </label>

    <p v-if="state !== 'empty'" class="loc__quote" :class="`loc__quote--${state}`">
      <template v-if="state === 'loading'"><i class="fa-solid fa-spinner fa-spin"></i> Calculando distancia…</template>
      <template v-else-if="state === 'unknown'"><i class="fa-solid fa-triangle-exclamation"></i> No pudimos ubicar ese link. Marca el punto en el mapa.</template>
      <template v-else-if="state === 'far'"><i class="fa-solid fa-triangle-exclamation"></i> Estás a {{ quote!.km!.toFixed(1) }} km: la moto llega hasta {{ maxKm }} km. Elige envío a provincias o retiro.</template>
      <template v-else><i class="fa-solid fa-motorcycle"></i> Envío en moto <strong>{{ formatMoney(quote!.cost!) }}</strong> · {{ quote!.km!.toFixed(1) }} km desde la tienda</template>
    </p>

    <LocationPicker v-if="open" :open="open" :origin="origin" :initial="picked" @close="open = false" @confirm="onPicked" />
  </div>
</template>

<style scoped lang="scss">
.loc {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__map {
    @include flex(row, center, flex-start, 0.7rem);
    text-align: left;
    padding: 0.8rem 0.9rem;
    border: 1.5px dashed $accent;
    border-radius: $radius-md;
    background: $accent-soft;
    color: $ink;
    @include transition;
    @include press;

    > i:first-child { font-size: 1.3rem; color: $accent; }
    span { flex: 1; min-width: 0; @include flex(column, flex-start, center, 0.1rem); }
    strong { font-size: $text-sm; }
    small { font-size: $text-xs; color: $ink-soft; }

    &--has {
      border-style: solid;
      border-color: $success;
      background: $success-bg;
      > i:first-child { color: $success; }
    }
  }

  &__go { font-size: 0.8rem; color: $ink-muted; }

  &__link {
    margin: 0;
    span { display: block; margin-bottom: 0.35rem; font-size: $text-xs; color: $ink-muted; }
  }

  &__quote {
    @include flex(row, center, flex-start, 0.5rem);
    padding: 0.6rem 0.8rem;
    border-radius: $radius-sm;
    font-size: $text-sm;

    &--loading { background: $info-bg; color: $accent-deep; }
    &--ok { background: $success-bg; color: $success; }
    &--unknown, &--far { background: $warning-bg; color: $warning; }
  }
}
</style>
