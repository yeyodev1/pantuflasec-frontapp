<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Order } from '@/types'
import { paymentMethods, paymentStatuses } from '@/config/orders'
import { formatDate } from '@/utils/format'

/**
 * Pagos que aprueba el equipo: transferencia (con el comprobante a la vista)
 * y efectivo en tienda. Aprobar descuenta stock y avisa al cliente, igual que
 * un cobro con tarjeta; rechazar pide un motivo que el cliente ve.
 */
const props = defineProps<{ order: Order; saving?: boolean }>()
const emit = defineEmits<{ review: [action: 'approve' | 'reject', reason: string] }>()

const pay = computed(() => props.order.payment)
const method = computed(() => paymentMethods.find((m) => m.key === pay.value.method))
const status = computed(() => paymentStatuses[pay.value.status])
const manual = computed(() => pay.value.method !== 'payphone')
const open = computed(
  () => manual.value && pay.value.status !== 'paid' && props.order.status !== 'cancelled',
)
const rejecting = ref(false)
const reason = ref('')

function reject() {
  emit('review', 'reject', reason.value.trim())
  rejecting.value = false
  reason.value = ''
}
</script>

<template>
  <div class="review" :class="`review--${status.tone}`">
    <p class="review__line">
      <i :class="method?.icon"></i>
      <strong>{{ method?.label }}</strong>
      <span class="review__badge">{{ status.label }}</span>
    </p>
    <p v-if="pay.status === 'paid'" class="review__meta">
      Pagado {{ pay.paidAt ? formatDate(pay.paidAt) : '' }}
      <template v-if="pay.method === 'payphone'"
        >· {{ pay.cardBrand }} · aut. {{ pay.authorizationCode }} · id
        {{ pay.payphoneId }}</template
      >
      <template v-else-if="pay.reviewedBy">· aprobado por {{ pay.reviewedBy }}</template>
    </p>
    <p v-else-if="pay.method === 'payphone'" class="review__meta">
      PayPhone: {{ pay.status }} {{ pay.message }}
    </p>

    <template v-if="manual">
      <a v-if="pay.proof?.url" :href="pay.proof.url" target="_blank" rel="noopener" class="proof">
        <img :src="pay.proof.url" alt="Comprobante" />
        <span>
          <strong>Ver comprobante</strong>
          <small
            >Subido {{ pay.proof.uploadedAt ? formatDate(pay.proof.uploadedAt) : ''
            }}{{ pay.proof.note ? ` · "${pay.proof.note}"` : '' }}</small
          >
        </span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
      <p v-else-if="pay.method === 'transfer' && pay.status !== 'paid'" class="review__meta">
        El cliente todavía no sube el comprobante. Puedes aprobar igual si ya viste la transferencia
        en el banco.
      </p>
      <p v-if="pay.status === 'rejected'" class="review__meta review__meta--bad">
        Rechazado: {{ pay.rejectReason }}
      </p>
    </template>

    <div v-if="open" class="review__actions">
      <button
        type="button"
        class="btn btn--primary"
        :disabled="saving"
        @click="emit('review', 'approve', '')"
      >
        <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-circle-check'"></i>
        {{ pay.method === 'cash' ? 'Registrar pago en tienda' : 'Aprobar transferencia' }}
      </button>
      <button
        v-if="pay.method === 'transfer' && !rejecting"
        type="button"
        class="review__reject"
        :disabled="saving"
        @click="rejecting = true"
      >
        <i class="fa-solid fa-ban"></i> Rechazar comprobante
      </button>
    </div>
    <form v-if="rejecting" class="review__form" @submit.prevent="reject">
      <input
        v-model="reason"
        maxlength="300"
        placeholder="Motivo que verá el cliente: monto distinto, no llegó, cuenta equivocada…"
      />
      <div class="review__actions">
        <button class="btn btn--danger" :disabled="saving">Rechazar y avisar</button>
        <button type="button" class="btn btn--ghost" @click="rejecting = false">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.review {
  @include flex(column, stretch, flex-start, 0.6rem);
  padding: 0.9rem 1rem;
  border-radius: $radius-sm;
  background: $sand;
  border-left: 4px solid $info;

  &--ok {
    border-left-color: $success;
  }
  &--warn {
    border-left-color: $warning;
  }
  &--bad {
    border-left-color: $danger;
  }

  &__line {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
    font-size: $text-sm;

    i {
      color: $accent;
    }
  }

  &__badge {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    border-radius: $radius-pill;
    background: $surface;
    color: $ink-soft;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;

    &--bad {
      color: $danger;
      font-weight: 600;
    }
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__reject {
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

  &__form {
    @include flex(column, stretch, flex-start, 0.5rem);
  }
}

.proof {
  @include flex(row, center, flex-start, 0.7rem);
  padding: 0.5rem;
  border-radius: $radius-sm;
  background: $surface;
  border: 1px solid $line;
  font-size: $text-sm;
  @include lift(-1px, $shadow-sm);

  img {
    flex: 0 0 3.5rem;
    width: 3.5rem;
    height: 3.5rem;
    object-fit: cover;
    border-radius: $radius-sm;
  }

  span {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center);

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  > i {
    color: $ink-muted;
  }
}
</style>
