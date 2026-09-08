<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapsService } from '@/services/maps.service'
import { formatMoney } from '@/utils/format'
import type { DeliveryQuote } from '@/types'

/**
 * Elegir el punto de entrega como en una app de delivery: el pin queda fijo
 * en el centro y el mapa se mueve debajo. Cada vez que el mapa se detiene se
 * cotiza contra el backend (km por carretera y precio), que es lo que se cobra.
 */
const props = defineProps<{ open: boolean; origin: { lat: number; lng: number }; initial?: { lat: number; lng: number } | null }>()
const emit = defineEmits<{ close: []; confirm: [coords: { lat: number; lng: number }] }>()

const mapEl = ref<HTMLElement | null>(null)
const map = shallowRef<L.Map | null>(null)
const centre = ref({ ...props.origin })
const address = ref('')
const moving = ref(false)
const locating = ref(false)
const locateError = ref('')
const quote = ref<DeliveryQuote | null>(null)
const quoting = ref(false)
let quoteTimer: ReturnType<typeof setTimeout> | undefined
let nameTimer: ReturnType<typeof setTimeout> | undefined
let seq = 0

function quoteCentre() {
  clearTimeout(quoteTimer)
  const mine = ++seq
  quoting.value = true
  quoteTimer = setTimeout(async () => {
    try {
      const r = await mapsService.quote(`${centre.value.lat.toFixed(6)},${centre.value.lng.toFixed(6)}`)
      if (mine === seq) quote.value = r
    } catch {
      if (mine === seq) quote.value = null
    } finally {
      if (mine === seq) quoting.value = false
    }
  }, 550)
}

/** Nombre de la calle bajo el pin (Nominatim): a nadie le dice nada "-2.14, -79.89". */
function nameCentre() {
  clearTimeout(nameTimer)
  const mine = seq
  nameTimer = setTimeout(async () => {
    try {
      const { lat, lng } = centre.value
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=es`)
      const data = (await res.json()) as { address?: Record<string, string>; display_name?: string }
      if (mine !== seq) return
      const a = data.address ?? {}
      const street = [a.road, a.house_number].filter(Boolean).join(' ')
      const area = a.neighbourhood ?? a.suburb ?? a.city_district ?? a.town ?? a.city
      address.value = [street, area].filter(Boolean).join(', ') || (data.display_name ?? '')
    } catch {
      address.value = ''
    }
  }, 450)
}

async function mount() {
  await nextTick()
  if (!mapEl.value || map.value) return
  const start = props.initial ?? props.origin
  centre.value = { ...start }
  const m = L.map(mapEl.value, { center: [start.lat, start.lng], zoom: props.initial ? 17 : 13, zoomControl: false })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m)
  L.control.zoom({ position: 'bottomright' }).addTo(m)
  L.circleMarker([props.origin.lat, props.origin.lng], { radius: 7, color: '#16213e', fillColor: '#ffcc00', fillOpacity: 1, weight: 2 })
    .addTo(m)
    .bindTooltip('Pantuflas · La Garzota', { direction: 'top' })
  m.on('movestart', () => {
    moving.value = true
    quote.value = null
  })
  m.on('moveend', () => {
    moving.value = false
    const c = m.getCenter()
    centre.value = { lat: c.lat, lng: c.lng }
    quoteCentre()
    nameCentre()
  })
  map.value = m
  // Dentro de un modal recién mostrado Leaflet mide una caja de alto cero.
  setTimeout(() => m.invalidateSize(), 60)
  quoteCentre()
  nameCentre()
}

function destroy() {
  clearTimeout(quoteTimer)
  clearTimeout(nameTimer)
  seq++
  map.value?.remove()
  map.value = null
  quote.value = null
  address.value = ''
  locateError.value = ''
}

function locateMe() {
  if (!navigator.geolocation) return (locateError.value = 'Tu navegador no permite compartir ubicación.')
  locating.value = true
  locateError.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false
      map.value?.flyTo([pos.coords.latitude, pos.coords.longitude], 17, { duration: 0.8 })
    },
    () => {
      locating.value = false
      locateError.value = 'No pudimos acceder a tu ubicación. Mueve el mapa para marcarla.'
    },
    { enableHighAccuracy: true, timeout: 8000 },
  )
}

watch(() => props.open, (o) => (o ? void mount() : destroy()), { immediate: true })
onBeforeUnmount(destroy)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="lp" role="dialog" aria-modal="true" aria-label="Elegir ubicación de entrega">
        <header class="lp__head">
          <button type="button" class="lp__back" aria-label="Cerrar" @click="emit('close')"><i class="fa-solid fa-arrow-left"></i></button>
          <div class="lp__titles">
            <strong>¿Dónde te lo dejamos?</strong>
            <span>Mueve el mapa hasta poner el pin en tu puerta</span>
          </div>
        </header>
        <div class="lp__mapwrap">
          <div ref="mapEl" class="lp__map"></div>
          <div class="lp__pin" :class="{ 'lp__pin--lifted': moving }" aria-hidden="true"><i class="fa-solid fa-location-dot"></i><span></span></div>
          <button type="button" class="lp__locate" :disabled="locating" @click="locateMe">
            <i :class="locating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-crosshairs'"></i> {{ locating ? 'Buscando…' : 'Usar mi ubicación' }}
          </button>
        </div>
        <footer class="lp__foot">
          <p v-if="locateError" class="lp__err"><i class="fa-solid fa-circle-info"></i> {{ locateError }}</p>
          <p class="lp__where">
            <i class="fa-solid fa-location-dot"></i>
            <span><strong>{{ address || 'Punto seleccionado' }}</strong><small v-if="quote?.km != null">{{ quote.km.toFixed(1) }} km desde la tienda</small></span>
          </p>
          <p class="lp__fee" :class="quoting || moving ? 'lp__fee--pending' : quote?.cost == null ? 'lp__fee--warn' : 'lp__fee--ok'">
            <template v-if="quoting || moving"><i class="fa-solid fa-spinner fa-spin"></i> Calculando tu envío…</template>
            <template v-else-if="quote?.cost == null"><i class="fa-solid fa-triangle-exclamation"></i> Fuera de la zona de la moto. Elige envío a provincias o retiro.</template>
            <template v-else><i class="fa-solid fa-motorcycle"></i> Envío en moto <strong>{{ formatMoney(quote.cost) }}</strong></template>
          </p>
          <button type="button" class="btn btn--primary lp__confirm" :disabled="quoting || moving || quote?.cost == null" @click="emit('confirm', { ...centre })">
            <i class="fa-solid fa-check"></i> Confirmar esta ubicación
          </button>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.lp {
  position: fixed;
  inset: 0;
  z-index: 400;
  @include flex(column, stretch, flex-start);
  background: $surface;

  @include from('md') {
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    width: min(560px, 94vw);
    height: min(720px, 92vh);
    border-radius: $radius-md;
    overflow: hidden;
    box-shadow: $shadow-lg;
  }

  &__head {
    @include flex(row, center, flex-start, 0.75rem);
    padding: 0.85rem 1rem;
    background: $ink;
    color: $paper;
  }

  &__back {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: $radius-pill;
    background: rgba($paper, 0.14);
    color: $paper;
    @include flex(row, center, center);
  }

  &__titles {
    @include flex(column, flex-start, center, 0.1rem);
    strong { font-size: $text-base; }
    span { font-size: $text-xs; opacity: 0.8; }
  }

  &__mapwrap { position: relative; flex: 1; min-height: 0; }
  &__map { position: absolute; inset: 0; }

  &__pin {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 500;
    transform: translate(-50%, -100%);
    pointer-events: none;
    text-align: center;
    transition: transform 0.18s ease;

    i { font-size: 2.4rem; color: $price; filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35)); }
    span { display: block; width: 0.5rem; height: 0.25rem; margin: -0.15rem auto 0; border-radius: 50%; background: rgba(0, 0, 0, 0.32); }
    &--lifted { transform: translate(-50%, -115%); }
  }

  &__locate {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    z-index: 500;
    @include flex(row, center, center, 0.45rem);
    padding: 0.6rem 0.95rem;
    border-radius: $radius-pill;
    background: $surface;
    color: $ink;
    font-size: $text-xs;
    font-weight: 700;
    box-shadow: $shadow-md;
    i { color: $accent; }
  }

  &__foot {
    padding: 0.9rem 1rem calc(1rem + env(safe-area-inset-bottom));
    border-top: 1px solid $line;
    @include flex(column, stretch, flex-start, 0.6rem);
  }

  &__err { font-size: $text-xs; color: $warning; }

  &__where {
    @include flex(row, flex-start, flex-start, 0.6rem);
    font-size: $text-sm;
    i { color: $price; margin-top: 0.2rem; }
    span { @include flex(column, flex-start, center, 0.1rem); min-width: 0; }
    small { font-size: $text-xs; color: $ink-muted; }
  }

  &__fee {
    @include flex(row, center, flex-start, 0.5rem);
    padding: 0.6rem 0.8rem;
    border-radius: $radius-sm;
    font-size: $text-sm;
    &--ok { background: $success-bg; color: $success; }
    &--warn { background: $warning-bg; color: $warning; }
    &--pending { background: $info-bg; color: $accent-deep; }
  }

  &__confirm { width: 100%; }
}
</style>
