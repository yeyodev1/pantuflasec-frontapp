<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { orderService } from '@/services/order.service'
import { formatDate, formatMoney } from '@/utils/format'
import { orderStatusLabel } from '@/config/orders'
import { site, whatsappLink } from '@/config/site'
import type { ApiError, Order, ShopConfig } from '@/types'
import { rememberOrder } from '@/utils/myOrders'
import { useToastStore } from '@/stores/toast'
import OrderPaymentPanel from '@/components/order/OrderPaymentPanel.vue'
import OrderMessages from '@/components/order/OrderMessages.vue'

const route = useRoute()
const toast = useToastStore()
const order = ref<Order | null>(null)
const config = ref<ShopConfig | null>(null)
const error = ref('')
const sending = ref(false)
const isNew = route.query.nuevo === '1'

onMounted(async () => {
  try {
    const [o, c] = await Promise.all([orderService.track(String(route.params.code)), orderService.config().catch(() => null)])
    order.value = o
    config.value = c
    rememberOrder({ token: o.clientTransactionId, number: o.number, total: o.total, createdAt: o.createdAt })
  } catch (e) {
    error.value = (e as ApiError).message
  }
})

/** Mensaje al equipo; el backend avisa por correo y devuelve el pedido con la hilera. */
async function send(text: string) {
  if (!order.value) return
  sending.value = true
  try {
    order.value = await orderService.sendMessage(order.value.clientTransactionId, text)
    toast.success('Mensaje enviado. Te respondemos pronto.')
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="order">
    <p v-if="error" class="order__error">{{ error }}</p>
    <template v-else-if="order">
      <header class="order__head">
        <i v-if="isNew" :class="order.payment.status === 'paid' ? 'fa-solid fa-circle-check' : 'fa-solid fa-hourglass-half'" class="order__check"></i>
        <p class="order__eyebrow">{{ isNew ? (order.payment.status === 'paid' ? '¡Gracias por tu compra!' : '¡Pedido reservado!') : 'Tu pedido' }}</p>
        <h1 class="order__title">Pedido {{ order.number }}</h1>
        <p class="order__status" :class="`order__status--${order.status}`">
          {{ orderStatusLabel(order.status) }}
        </p>
        <p class="order__date">{{ formatDate(order.createdAt) }}</p>
      </header>

      <ul class="order__items">
        <li v-for="(i, n) in order.items" :key="n" class="item">
          <img v-if="i.image" :src="i.image" :alt="i.name" width="56" height="56" />
          <span class="item__name">
            {{ i.name }}
            <small v-if="i.variantLabel">{{ i.variantLabel }}</small>
            <small>× {{ i.qty }}</small>
          </span>
          <span>{{ formatMoney(i.subtotal) }}</span>
        </li>
      </ul>

      <dl class="order__totals">
        <dt>Subtotal</dt><dd>{{ formatMoney(order.subtotal) }}</dd>
        <dt>{{ order.shipping.label }}</dt><dd>{{ formatMoney(order.shippingCost) }}</dd>
        <dt :class="{ order__muted: order.taxIncluded }">{{ order.taxIncluded ? 'Incluye IVA' : 'IVA' }}</dt><dd :class="{ order__muted: order.taxIncluded }">{{ formatMoney(order.tax) }}</dd>
        <dt class="order__total">Total</dt><dd class="order__total">{{ formatMoney(order.total) }}</dd>
      </dl>

      <div class="order__meta">
        <p><strong>Entrega: </strong>
          <template v-if="order.shipping.method.startsWith('pickup')">{{ order.shipping.label }} · {{ order.shipping.address }}, {{ order.shipping.city }}.</template>
          <template v-else>{{ order.shipping.address }}, {{ order.shipping.city }}<span v-if="order.shipping.reference"> · {{ order.shipping.reference }}</span></template>
        </p>
        <p><strong>Contacto:</strong> {{ order.customer.email }} · {{ order.customer.phone }}</p>
        <p v-if="order.billing?.wanted"><strong>Factura:</strong> {{ order.billing.name }} · {{ order.billing.documentId }} · {{ order.billing.email }}</p>
      </div>

      <OrderPaymentPanel
        :order="order"
        :accounts="config?.payments.transfer.accounts ?? []"
        :instructions="{ transfer: config?.payments.transfer.instructions ?? '', cash: config?.payments.cash.instructions ?? '' }"
        @updated="order = $event"
      />

      <OrderMessages :messages="order.messages ?? []" viewer="customer" :sending="sending" @send="send" />

      <div class="order__actions">
        <a v-if="site.whatsapp" :href="whatsappLink(`Hola, tengo una consulta sobre mi pedido ${order.number}`)" class="btn btn--ghost" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> Consultar por WhatsApp
        </a>
        <RouterLink to="/tienda" class="btn btn--primary">Seguir comprando</RouterLink>
      </div>
    </template>
    <p v-else class="order__loading">Cargando…</p>
  </section>
</template>

<style scoped lang="scss">
.order {
  @include container(680px);
  @include flex(column, stretch, flex-start, 1.2rem);
  padding-block: $space-md $space-section;

  &__head {
    text-align: center;
    @include flex(column, center, center, 0.3rem);
    @include reveal;
  }

  &__check {
    font-size: 2.6rem;
    color: $success;
    margin-bottom: 0.4rem;
    animation: bump 0.6s $ease 0.3s both;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__status {
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.3rem 0.8rem;
    border-radius: $radius-pill;
    background: $info-bg;
    color: $info;

    &--paid, &--delivered { background: $success-bg; color: $success; }
    &--cancelled { background: $danger-bg; color: $danger; }
    &--pending_payment { background: $warning-bg; color: $warning; }
  }

  &__date {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__items {
    list-style: none;
    @include card;
    padding: 0.4rem 1rem;
    --i: 2;
    @include reveal;
  }

  &__totals {
    display: flex;
    flex-wrap: wrap;
    font-size: $text-sm;

    dt { flex: 1 1 60%; color: $ink-soft; padding-block: 0.15rem; }
    dd { flex: 1 1 40%; text-align: right; padding-block: 0.15rem; }
  }

  &__total {
    font-size: $text-lg;
    font-weight: 700;
    color: $ink;
    margin-top: 0.3rem;
  }

  &__muted {
    color: $ink-muted !important;
    font-size: $text-xs;
  }

  &__meta {
    font-size: $text-sm;
    color: $ink-soft;
    @include flex(column, stretch, flex-start, 0.3rem);
  }

  &__actions {
    @include flex(column, stretch, flex-start, 0.6rem);

    @include from('sm') {
      flex-direction: row;
      justify-content: center;
    }
  }

  &__error, &__loading {
    text-align: center;
    color: $ink-soft;
    padding-block: $space-lg;
  }
}

.item {
  @include flex(row, center, space-between, 0.8rem);
  font-size: $text-sm;
  padding-block: 0.6rem;
  border-bottom: 1px solid $line;

  &:last-child { border-bottom: none; }

  img {
    flex: 0 0 3.5rem;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: $radius-sm;
  }

  &__name {
    flex: 1;
    @include flex(column, flex-start, center);
    font-weight: 600;

    small { font-weight: 400; color: $ink-muted; }
  }
}
</style>
