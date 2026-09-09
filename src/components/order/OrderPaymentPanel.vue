<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApiError, BankAccount, Order } from '@/types'
import { orderService } from '@/services/order.service'
import { useToastStore } from '@/stores/toast'
import { paymentStatuses } from '@/config/orders'
import { formatMoney } from '@/utils/format'
import { whatsappLink } from '@/config/site'

/**
 * Qué tiene que hacer el cliente para pagar, según el método: cuentas y
 * comprobante para transferencia, instrucciones para efectivo, y el resumen
 * de PayPhone cuando ya se cobró con tarjeta.
 */
const props = defineProps<{ order: Order; accounts: BankAccount[]; instructions: { transfer: string; cash: string } }>()
const emit = defineEmits<{ updated: [order: Order] }>()

const toast = useToastStore()
const file = ref<File | null>(null)
const note = ref('')
const uploading = ref(false)
const error = ref('')

const pay = computed(() => props.order.payment)
const status = computed(() => paymentStatuses[pay.value.status])
const needsProof = computed(() => pay.value.method === 'transfer' && ['pending', 'rejected', 'review'].includes(pay.value.status))
const cancelled = computed(() => props.order.status === 'cancelled')

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

async function upload() {
  if (!file.value) return
  uploading.value = true
  error.value = ''
  try {
    const updated = await orderService.uploadProof(props.order.clientTransactionId, file.value, note.value)
    emit('updated', updated)
    file.value = null
    note.value = ''
    toast.success('Comprobante enviado. Lo revisamos y te avisamos.')
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    uploading.value = false
  }
}

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.info('Copiado')
  } catch {
    toast.error('No se pudo copiar')
  }
}
</script>

<template>
  <section class="paypanel" :class="`paypanel--${status.tone}`">
    <header class="paypanel__head">
      <h2 class="paypanel__title">Pago</h2>
      <span class="paypanel__status">{{ status.label }}</span>
    </header>

    <!-- Tarjeta -->
    <p v-if="pay.method === 'payphone' && pay.status === 'paid'" class="paypanel__text">
      Pagado con tarjeta · {{ pay.cardBrand }} · aut. {{ pay.authorizationCode }}
    </p>
    <p v-else-if="pay.method === 'payphone'" class="paypanel__text">
      El cobro con tarjeta no se completó. Si crees que sí pagaste, escríbenos abajo o por WhatsApp.
    </p>

    <!-- Efectivo -->
    <template v-else-if="pay.method === 'cash'">
      <p v-if="pay.status === 'paid'" class="paypanel__text">Pagado en efectivo en {{ order.shipping.label }}.</p>
      <p v-else class="paypanel__text">
        {{ instructions.cash }} Total a pagar: <strong>{{ formatMoney(order.total) }}</strong> en <strong>{{ order.shipping.label }}</strong>.
      </p>
    </template>

    <!-- Transferencia -->
    <template v-else-if="pay.method === 'transfer'">
      <p v-if="pay.status === 'paid'" class="paypanel__text">Transferencia aprobada. ¡Gracias!</p>
      <template v-else-if="!cancelled">
        <p v-if="pay.status === 'rejected'" class="paypanel__alert">
          <i class="fa-solid fa-circle-exclamation"></i>
          No pudimos validar el comprobante: <strong>{{ pay.rejectReason }}</strong>. Sube otro o escríbenos abajo.
        </p>
        <p v-else-if="pay.status === 'review'" class="paypanel__ok">
          <i class="fa-solid fa-hourglass-half"></i>
          Recibimos tu comprobante. Lo revisamos y te confirmamos por correo, normalmente el mismo día.
        </p>

        <template v-if="pay.status !== 'review'">
          <p class="paypanel__step"><span>1</span> Transfiere <strong>{{ formatMoney(order.total) }}</strong>{{ accounts.length ? ' a una de estas cuentas' : '' }}</p>
          <a
            v-if="!accounts.length"
            :href="whatsappLink(`Hola, hice el pedido ${order.number} y quiero pagar por transferencia. ¿Me pasan los datos de la cuenta? 🙏`)"
            class="btn btn--ghost paypanel__wa"
            target="_blank"
            rel="noopener"
          >
            <i class="fa-brands fa-whatsapp"></i> Pedir los datos de la cuenta por WhatsApp
          </a>
          <ul v-else class="accounts">
            <li v-for="(a, i) in accounts" :key="i" class="account">
              <img v-if="a.showLogo && a.logo?.url" :src="a.logo.url" alt="" class="account__logo" />
        <span class="account__bank">{{ a.bank }}<small v-if="a.type"> · {{ a.type }}</small></span>
              <button type="button" class="account__number" :title="'Copiar número'" @click="copy(a.number)">
                {{ a.number }} <i class="fa-regular fa-copy"></i>
              </button>
              <span class="account__meta">{{ a.holder }}<template v-if="a.documentId"> · {{ a.documentId }}</template><template v-if="a.email"> · {{ a.email }}</template></span>
            </li>
          </ul>
          <p class="paypanel__hint">{{ instructions.transfer }} Pon <strong>{{ order.number }}</strong> en la descripción.</p>
          <p class="paypanel__step"><span>2</span> Sube la captura del comprobante</p>
        </template>

        <form v-if="needsProof" class="proof" @submit.prevent="upload">
          <label class="proof__file" :class="{ 'proof__file--has': file }">
            <i :class="file ? 'fa-solid fa-image' : 'fa-solid fa-cloud-arrow-up'"></i>
            <span>{{ file ? file.name : pay.status === 'review' ? 'Subir otro comprobante' : 'Elegir captura o foto' }}</span>
            <input type="file" accept="image/*" hidden @change="onFile" />
          </label>
          <input v-model="note" maxlength="300" placeholder="Nota (opcional): banco, hora, nombre de quien transfirió" />
          <button class="btn btn--primary" :disabled="!file || uploading">
            <i :class="uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'"></i> Enviar comprobante
          </button>
          <p v-if="error" class="paypanel__alert"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
        </form>
        <a v-if="pay.proof?.url" :href="pay.proof.url" target="_blank" rel="noopener" class="paypanel__proof">
          <img :src="pay.proof.url" alt="Comprobante enviado" />
          <span>Ver comprobante enviado</span>
        </a>
      </template>
    </template>
  </section>
</template>

<style scoped lang="scss">
.paypanel {
  @include card;
  padding: 1rem 1.1rem 1.2rem;
  @include flex(column, stretch, flex-start, 0.7rem);
  border-left: 4px solid $info;
  @include reveal;

  &--ok { border-left-color: $success; }
  &--warn { border-left-color: $warning; }
  &--bad { border-left-color: $danger; }

  &__head {
    @include flex(row, center, space-between, 0.6rem);
    flex-wrap: wrap;
  }

  &__title {
    @include eyebrow;
  }

  &__status {
    font-size: $text-xs;
    font-weight: 700;
    padding: 0.25rem 0.7rem;
    border-radius: $radius-pill;
    background: $sand;
    color: $ink-soft;
  }

  &__text { font-size: $text-sm; color: $ink-soft; }
  &__hint { font-size: $text-xs; color: $ink-muted; }

  &__alert,
  &__ok {
    font-size: $text-sm;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-sm;
    @include flex(row, flex-start, flex-start, 0.5rem);

    i { margin-top: 0.2rem; }
  }

  &__alert { background: $danger-bg; color: $danger; }
  &__ok { background: $info-bg; color: $accent-deep; }

  &__step {
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    @include flex(row, center, flex-start, 0.5rem);

    span {
      flex: 0 0 1.5rem;
      height: 1.5rem;
      border-radius: $radius-pill;
      background: $highlight;
      color: $ink;
      font-size: 0.75rem;
      font-weight: 700;
      @include flex(row, center, center);
    }
  }

  &__wa {
    border-color: #25d366;
    color: #128c7e;

    &:hover {
      background: #25d366;
      color: #fff;
    }
  }

  &__proof {
    @include flex(row, center, flex-start, 0.6rem);
    font-size: $text-xs;
    color: $accent-deep;

    img {
      width: 3rem;
      height: 3rem;
      object-fit: cover;
      border-radius: $radius-sm;
      border: 1px solid $line;
    }
  }
}

.accounts {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.5rem);
}

.account {
  @include flex(column, flex-start, center, 0.15rem);
  padding: 0.7rem 0.9rem;
  border-radius: $radius-sm;
  background: $sand;

  &__logo { width: 2.2rem; height: 2.2rem; object-fit: contain; border-radius: 6px; background: $surface; margin-bottom: 0.2rem; }

  &__bank {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink;

    small { font-weight: 500; color: $ink-muted; }
  }

  &__number {
    font-family: $font-principal;
    font-size: $text-lg;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: $accent-deep;
    padding: 0;
    @include flex(row, center, flex-start, 0.4rem);

    i { font-size: 0.8rem; color: $ink-muted; }
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-soft;
  }
}

.proof {
  @include flex(column, stretch, flex-start, 0.5rem);

  &__file {
    @include flex(row, center, center, 0.5rem);
    padding: 0.9rem;
    border: 1.5px dashed $accent;
    border-radius: $radius-sm;
    background: $accent-soft;
    color: $accent-deep;
    font-size: $text-sm;
    font-weight: 600;
    cursor: pointer;
    margin: 0;

    &--has {
      border-style: solid;
      background: $success-bg;
      color: $success;
      border-color: $success;
    }
  }
}
</style>
