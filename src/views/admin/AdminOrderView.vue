<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminShell from '@/layout/AdminShell.vue'
import { orderService } from '@/services/order.service'
import { orderStatusLabel } from '@/config/orders'
import { formatDate, formatMoney } from '@/utils/format'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Order, OrderStatus } from '@/types'
import OrderTimeline from '@/components/admin/OrderTimeline.vue'
import OrderStatusPicker from '@/components/admin/OrderStatusPicker.vue'

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

/** Se anota el contacto en el historial y luego se abre el enlace. */
async function contact(kind: 'contact-whatsapp' | 'contact-call' | 'contact-email', href: string) {
  if (!order.value) return
  try {
    order.value = await orderService.addEvent(order.value._id, kind)
  } catch {
    /* si no se pudo anotar, igual se contacta */
  }
  window.open(href, kind === 'contact-whatsapp' ? '_blank' : '_self', 'noopener')
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
      <section class="panel panel--wide">
        <h2 class="panel__title">Estado</h2>
          <OrderStatusPicker :status="order.status" :saving="saving" @change="setStatus" />
          <p class="panel__meta">Creado {{ formatDate(order.createdAt) }}</p>
          <p v-if="order.payment.status === 'paid'" class="panel__meta">
            Pagado con PayPhone · {{ order.payment.cardBrand }} · aut. {{ order.payment.authorizationCode }} · id {{ order.payment.payphoneId }}
          </p>
          <p v-else class="panel__meta">Pago: {{ order.payment.status }} {{ order.payment.message }}</p>
          <p v-if="order.stockIssue" class="panel__warn">
            <i class="fa-solid fa-triangle-exclamation"></i> No se pudo descontar stock de algún ítem. Revisa el inventario.
          </p>
      </section>

      <div class="grid">
        <section class="panel">
          <h2 class="panel__title">Cliente</h2>
          <p><strong>{{ order.customer.name }}</strong></p>
          <p>{{ order.customer.email }}</p>
          <p>{{ order.customer.phone }} <span v-if="order.customer.documentId">· CI {{ order.customer.documentId }}</span></p>
          <div class="panel__contact">
            <button type="button" class="btn btn--ghost" @click="contact('contact-whatsapp', waLink(order))"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button>
            <button type="button" class="btn btn--ghost" @click="contact('contact-call', `tel:${order.customer.phone}`)"><i class="fa-solid fa-phone"></i> Llamar</button>
            <button type="button" class="btn btn--ghost" @click="contact('contact-email', `mailto:${order.customer.email}?subject=Tu pedido ${order.number} en Pantuflas Ecuador`)"><i class="fa-solid fa-envelope"></i> Correo</button>
          </div>
          <p class="panel__meta">Cada contacto queda anotado en el historial.</p>
        </section>

        <section class="panel">
          <h2 class="panel__title">Entrega</h2>
          <p>{{ order.shipping.label }}</p>
          <p>{{ order.shipping.address }}, {{ order.shipping.city }}</p>
          <p v-if="order.shipping.reference">Ref.: {{ order.shipping.reference }}</p>
          <p v-if="order.shipping.notes" class="panel__notes">“{{ order.shipping.notes }}”</p>
        </section>

        <section class="panel">
          <h2 class="panel__title">Factura</h2>
          <template v-if="order.billing?.wanted">
            <p><strong>{{ order.billing.name }}</strong></p>
            <p>{{ order.billing.documentId.length === 13 ? 'RUC' : 'Cédula' }} {{ order.billing.documentId }}</p>
            <p>{{ order.billing.email }}<span v-if="order.billing.phone"> · {{ order.billing.phone }}</span></p>
          </template>
          <p v-else class="panel__meta">El cliente no pidió factura.</p>
        </section>
      </div>

      <OrderTimeline :order="order" />

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

  &--wide { width: 100%; }
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
