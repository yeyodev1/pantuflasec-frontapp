<script setup lang="ts">
import { computed } from 'vue'
import type { Order } from '@/types'
import { formatDate } from '@/utils/format'
import { orderStatusLabel } from '@/config/orders'

/** Historial del pedido: qué pasó, cuándo, quién, y qué correos salieron. */
const props = defineProps<{ order: Order }>()

const meta: Record<string, { icon: string; label: string; tone: string }> = {
  created: { icon: 'fa-solid fa-cart-plus', label: 'Pedido creado', tone: 'info' },
  paid: { icon: 'fa-solid fa-circle-check', label: 'Pago aprobado', tone: 'ok' },
  'payment-failed': { icon: 'fa-solid fa-circle-xmark', label: 'Pago no completado', tone: 'bad' },
  proof: { icon: 'fa-solid fa-receipt', label: 'Comprobante subido', tone: 'info' },
  'payment-rejected': { icon: 'fa-solid fa-ban', label: 'Comprobante rechazado', tone: 'bad' },
  email: { icon: 'fa-solid fa-envelope-circle-check', label: 'Correo enviado', tone: 'ok' },
  'email-failed': { icon: 'fa-solid fa-envelope', label: 'Correo no enviado', tone: 'bad' },
  status: { icon: 'fa-solid fa-arrow-right-arrow-left', label: 'Cambio de estado', tone: 'info' },
  'contact-whatsapp': { icon: 'fa-brands fa-whatsapp', label: 'Contacto por WhatsApp', tone: 'wa' },
  'contact-call': { icon: 'fa-solid fa-phone', label: 'Llamada', tone: 'info' },
  'contact-email': { icon: 'fa-solid fa-paper-plane', label: 'Correo manual', tone: 'info' },
  note: { icon: 'fa-solid fa-note-sticky', label: 'Nota', tone: 'muted' },
}

/** "pending_payment → paid" se muestra con las etiquetas de la tienda. */
function pretty(e: { kind: string; detail: string }) {
  if (e.kind !== 'status') return e.detail
  return e.detail.replace(/[a-z_]+/g, (k) => orderStatusLabel(k))
}

const events = computed(() =>
  [...(props.order.events ?? [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  ),
)
const emailsSent = computed(() => events.value.filter((e) => e.kind === 'email').length)
</script>

<template>
  <section class="timeline">
    <header class="timeline__head">
      <h2 class="timeline__title">Historial</h2>
      <span class="timeline__count"
        ><i class="fa-solid fa-envelope-circle-check"></i> {{ emailsSent }}
        {{ emailsSent === 1 ? 'correo enviado' : 'correos enviados' }}</span
      >
    </header>
    <p v-if="!events.length" class="timeline__empty">Todavía no hay movimientos.</p>
    <ol v-else class="timeline__list">
      <li
        v-for="(e, i) in events"
        :key="i"
        class="ev"
        :class="`ev--${meta[e.kind]?.tone ?? 'muted'}`"
        :style="{ '--i': i }"
      >
        <span class="ev__icon"><i :class="meta[e.kind]?.icon ?? 'fa-solid fa-circle'"></i></span>
        <div class="ev__body">
          <p class="ev__label">{{ meta[e.kind]?.label ?? e.kind }}</p>
          <p v-if="e.detail" class="ev__detail">{{ pretty(e) }}</p>
          <p class="ev__meta">{{ formatDate(e.at) }} · {{ e.by }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped lang="scss">
.timeline {
  @include card;
  padding: 1rem 1.1rem;

  &__head {
    @include flex(row, center, space-between, 0.6rem);
    margin-bottom: 0.6rem;
  }

  &__title {
    @include eyebrow;
  }

  &__count {
    font-size: $text-xs;
    font-weight: 700;
    color: $success;
    @include flex(row, center, center, 0.35rem);
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.2rem);
  }
}

.ev {
  @include flex(row, flex-start, flex-start, 0.7rem);
  padding: 0.5rem 0;
  border-bottom: 1px solid $line;
  @include reveal(0.4s, 0.03s);

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    flex: 0 0 2rem;
    height: 2rem;
    border-radius: $radius-pill;
    @include flex(row, center, center);
    font-size: 0.85rem;
    background: $sand;
    color: $ink-soft;
  }

  &--ok .ev__icon {
    background: $success-bg;
    color: $success;
  }
  &--bad .ev__icon {
    background: $danger-bg;
    color: $danger;
  }
  &--info .ev__icon {
    background: $accent-soft;
    color: $accent-deep;
  }
  &--wa .ev__icon {
    background: rgba(#25d366, 0.15);
    color: #128c7e;
  }

  &__body {
    min-width: 0;
  }

  &__label {
    font-size: $text-sm;
    font-weight: 700;
  }

  &__detail {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
