<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { orderFlow, orderStatuses } from '@/config/orders'
import type { OrderStatus } from '@/types'

/**
 * Flujo del pedido como pasos pulsables, con nuestros estilos. Avanzar o
 * retroceder es un toque; cancelar pide confirmación porque avisa al cliente.
 */
const props = defineProps<{ status: OrderStatus; saving?: boolean }>()
const emit = defineEmits<{ change: [status: OrderStatus] }>()

const index = computed(() => orderFlow.findIndex((s) => s.key === props.status))
const cancelled = computed(() => props.status === 'cancelled')
const askCancel = ref(false)
const current = computed(() => orderStatuses.find((s) => s.key === props.status))

const next = computed(() => (index.value >= 0 && index.value < orderFlow.length - 1 ? orderFlow[index.value + 1] : null))

function pick(key: OrderStatus) {
  if (key === props.status || props.saving) return
  emit('change', key)
}
</script>

<template>
  <div class="picker" :class="{ 'picker--cancelled': cancelled, 'picker--saving': saving }">
    <ol class="steps" aria-label="Estado del pedido">
      <li
        v-for="(s, i) in orderFlow"
        :key="s.key"
        class="step"
        :class="{ 'step--done': !cancelled && i < index, 'step--on': s.key === status, 'step--next': next?.key === s.key }"
      >
        <button type="button" class="step__btn" :disabled="saving || s.key === status" :title="s.hint" @click="pick(s.key)">
          <span class="step__dot"><i :class="s.key === status && saving ? 'fa-solid fa-spinner fa-spin' : s.icon"></i></span>
          <span class="step__label">{{ s.label }}</span>
        </button>
      </li>
    </ol>

    <p class="picker__now">
      <i :class="current?.icon"></i>
      <span><strong>{{ current?.label }}</strong> · {{ current?.hint }}</span>
    </p>

    <div class="picker__actions">
      <button v-if="next && !cancelled" type="button" class="btn btn--primary" :disabled="saving" @click="pick(next.key)">
        <i :class="next.icon"></i> Marcar como {{ next.label.toLowerCase() }}
      </button>
      <button v-if="!cancelled" type="button" class="picker__cancel" :disabled="saving" @click="askCancel = true">
        <i class="fa-solid fa-ban"></i> Cancelar pedido
      </button>
      <button v-else type="button" class="btn btn--ghost" :disabled="saving" @click="pick('paid')">
        <i class="fa-solid fa-rotate-left"></i> Reactivar como pagado
      </button>
    </div>
    <p class="picker__hint"><i class="fa-solid fa-envelope"></i> Cada cambio le llega al cliente por correo.</p>

    <BaseModal
      :open="askCancel"
      title="¿Cancelar este pedido?"
      message="El cliente recibirá un correo avisando la cancelación. Si ya pagó, coordina el reembolso por WhatsApp."
      confirm-label="Sí, cancelar"
      danger
      @confirm="askCancel = false; pick('cancelled')"
      @cancel="askCancel = false"
    />
  </div>
</template>

<style scoped lang="scss">
.picker {
  @include flex(column, stretch, flex-start, 0.8rem);

  &--saving {
    opacity: 0.7;
  }

  &__now {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    color: $ink-soft;

    i {
      color: $accent;
    }
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__cancel {
    @include flex(row, center, center, 0.4rem);
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-muted;
    padding: 0.5rem 0.6rem;
    @include transition(color);

    &:hover {
      color: $danger;
    }
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
    @include flex(row, center, flex-start, 0.4rem);
  }

  &--cancelled .steps {
    opacity: 0.45;
  }
}

// Línea de pasos: en móvil se desliza en horizontal, en escritorio cabe entera.
.steps {
  list-style: none;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.2rem 0;
  margin-inline: -0.2rem;

  &::-webkit-scrollbar {
    display: none;
  }
}

.step {
  position: relative;
  flex: 1 0 6.4rem;
  min-width: 0;

  // Conector entre pasos.
  & + &::before {
    content: '';
    position: absolute;
    top: 1.15rem;
    left: calc(-50% + 1.15rem);
    width: calc(100% - 2.3rem);
    height: 2px;
    background: $line;
    @include transition(background);
  }

  &--done + &::before,
  &--on + &::before,
  &--done + .step--on::before,
  &--done + .step--done::before {
    background: $success;
  }

  &__btn {
    width: 100%;
    @include flex(column, center, center, 0.35rem);
    padding: 0.2rem;
    color: $ink-muted;
    @include press;

    &:disabled {
      cursor: default;
    }
  }

  &__dot {
    position: relative;
    z-index: 1;
    width: 2.3rem;
    height: 2.3rem;
    border-radius: $radius-pill;
    border: 2px solid $line;
    background: $surface;
    @include flex(row, center, center);
    font-size: 0.85rem;
    @include transition;
  }

  &__label {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.15;
    max-width: 6rem;
  }

  &--done {
    .step__dot {
      background: $success;
      border-color: $success;
      color: $surface;
    }

    .step__label {
      color: $success;
    }
  }

  &--on {
    .step__dot {
      background: $accent;
      border-color: $accent;
      color: $surface;
      box-shadow: 0 0 0 5px rgba($accent, 0.15);
    }

    .step__label {
      color: $accent-deep;
    }
  }

  &--next .step__btn:hover .step__dot {
    border-color: $accent;
    color: $accent-deep;
  }
}
</style>
