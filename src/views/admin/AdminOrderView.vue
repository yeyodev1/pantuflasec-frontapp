<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminShell from '@/layout/AdminShell.vue'
import { orderService } from '@/services/order.service'
import { orderStatuses, orderStatusLabel } from '@/config/orders'
import { formatDate, formatMoney } from '@/utils/format'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Order, OrderStatus } from '@/types'

const route = useRoute()
const toast = useToastStore()
const order = ref<Order | null>(null)
const saving = ref(false)

onMounted(async () => {
  try {
    order.value = await orderService.adminGet(String(route.params.id))
  } catch (e) {
    toast.error((e as ApiError).message)
  }
})

async function setStatus(status: OrderStatus) {
  if (!order.value) return
  saving.value = true
  try {
    order.value = await orderService.setStatus(order.value._id, status)
    toast.success(`Pedido marcado como ${orderStatusLabel(status).toLowerCase()}`)
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    saving.value = false
  }
}

function waLink(o: Order) {
  const phone = o.customer.phone.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${o.customer.name.split(' ')[0]}, te escribimos de Pantuflasec por tu pedido ${o.number}.`)}`
}
</script>

<template>
  <AdminShell :title="order ? `Pedido ${order.number}` : 'Pedido'">
    <template #actions>
      <RouterLink to="/admin/pedidos" class="btn btn--ghost">Volver</RouterLink>
    </template>

    <template v-if="order">
      <div class="grid">
        <section class="panel">
          <h2 class="panel__title">Estado</h2>
          <select :value="order.status" :disabled="saving" @change="setStatus(($event.target as HTMLSelectElement).value as OrderStatus)">
            <option v-for="s in orderStatuses" :key="s.key" :value="s.key">{{ s.label }}</option>
          </select>
          <p class="panel__meta">Creado {{ formatDate(order.createdAt) }}</p>
          <p v-if="order.payment.status === 'paid'" class="panel__meta">
            Pagado con PayPhone · {{ order.payment.cardBrand }} · aut. {{ order.payment.authorizationCode }} · id {{ order.payment.payphoneId }}
          </p>
          <p v-else class="panel__meta">Pago: {{ order.payment.status }} {{ order.payment.message }}</p>
          <p v-if="order.stockIssue" class="panel__warn">
            <i class="fa-solid fa-triangle-exclamation"></i> No se pudo descontar stock de algún ítem. Revisa el inventario.
          </p>
        </section>

        <section class="panel">
          <h2 class="panel__title">Cliente</h2>
          <p><strong>{{ order.customer.name }}</strong></p>
          <p>{{ order.customer.email }}</p>
          <p>{{ order.customer.phone }} <span v-if="order.customer.documentId">· CI {{ order.customer.documentId }}</span></p>
          <div class="panel__contact">
            <a :href="waLink(order)" target="_blank" rel="noopener" class="btn btn--ghost"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
            <a :href="`tel:${order.customer.phone}`" class="btn btn--ghost"><i class="fa-solid fa-phone"></i> Llamar</a>
            <a :href="`mailto:${order.customer.email}?subject=Tu pedido ${order.number} en Pantuflas Ecuador`" class="btn btn--ghost"><i class="fa-solid fa-envelope"></i> Correo</a>
          </div>
        </section>

        <section class="panel">
          <h2 class="panel__title">Entrega</h2>
          <p>{{ order.shipping.label }}</p>
          <p>{{ order.shipping.address }}, {{ order.shipping.city }}</p>
          <p v-if="order.shipping.reference">Ref.: {{ order.shipping.reference }}</p>
          <p v-if="order.shipping.notes" class="panel__notes">“{{ order.shipping.notes }}”</p>
        </section>
      </div>

      <section class="panel">
        <h2 class="panel__title">Ítems</h2>
        <ul class="items">
          <li v-for="(i, n) in order.items" :key="n" class="item">
            <img v-if="i.image" :src="i.image" :alt="''" width="48" height="48" />
            <span class="item__name">{{ i.name }} <small v-if="i.variantLabel">{{ i.variantLabel }}</small></span>
            <span class="item__qty">× {{ i.qty }}</span>
            <span>{{ formatMoney(i.subtotal) }}</span>
          </li>
        </ul>
        <dl class="totals">
          <dt>Subtotal</dt><dd>{{ formatMoney(order.subtotal) }}</dd>
          <dt>Envío</dt><dd>{{ formatMoney(order.shippingCost) }}</dd>
          <dt>IVA</dt><dd>{{ formatMoney(order.tax) }}</dd>
          <dt class="totals__total">Total</dt><dd class="totals__total">{{ formatMoney(order.total) }}</dd>
        </dl>
      </section>
    </template>
    <p v-else class="hint">Cargando…</p>
  </AdminShell>
</template>

<style scoped lang="scss">
.hint { color: $ink-muted; }

.grid {
  @include flex-cards(260px, 1rem);
}

.panel {
  @include card;
  padding: 1rem 1.1rem;
  font-size: $text-sm;
  @include flex(column, stretch, flex-start, 0.4rem);
  @include reveal;

  &__title {
    @include eyebrow;
    margin-bottom: 0.3rem;
  }

  &__meta { font-size: $text-xs; color: $ink-muted; }
  &__warn { color: $warning; font-weight: 600; }
  &__notes { color: $ink-soft; font-style: italic; }
  &__contact {
    @include flex(row, center, flex-start, 0.4rem);
    flex-wrap: wrap;
    margin-top: 0.5rem;

    .btn { padding: 0.5rem 0.85rem; font-size: $text-xs; }
  }
}

.items { list-style: none; }

.item {
  @include flex(row, center, space-between, 0.7rem);
  padding-block: 0.5rem;
  border-bottom: 1px solid $line;

  img { flex: 0 0 3rem; aspect-ratio: 1; object-fit: cover; border-radius: $radius-sm; }
  &__name { flex: 1; font-weight: 600; small { font-weight: 400; color: $ink-muted; margin-left: 0.3rem; } }
  &__qty { color: $ink-muted; }
}

.totals {
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.6rem;

  dt { flex: 1 1 60%; color: $ink-soft; padding-block: 0.15rem; }
  dd { flex: 1 1 40%; text-align: right; padding-block: 0.15rem; }

  &__total { font-size: $text-lg; font-weight: 700; color: $ink; }
}
</style>
