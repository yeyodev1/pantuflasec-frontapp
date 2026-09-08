<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { orderService } from '@/services/order.service'
import { orderStatusLabel } from '@/config/orders'
import { formatDate, formatMoney } from '@/utils/format'
import { savedOrders, type SavedOrder } from '@/utils/myOrders'
import { site, whatsappLink } from '@/config/site'
import type { ApiError, Order } from '@/types'

const local = ref<SavedOrder[]>([])
const orders = ref<Order[]>([])
const loading = ref(true)
const email = ref('')
const sending = ref(false)
const sent = ref(false)
const error = ref('')

onMounted(async () => {
  local.value = savedOrders()
  const results = await Promise.allSettled(local.value.map((o) => orderService.track(o.token)))
  orders.value = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
  loading.value = false
})

async function lookup() {
  error.value = ''
  sending.value = true
  try {
    await orderService.lookup(email.value)
    sent.value = true
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="mine">
    <header class="mine__head">
      <p class="mine__eyebrow">Seguimiento</p>
      <h1 class="mine__title">Mis pedidos</h1>
    </header>

    <p v-if="loading" class="mine__state">Cargando…</p>

    <ul v-else-if="orders.length" class="list">
      <li v-for="(o, i) in orders" :key="o._id" :style="{ '--i': i }">
        <RouterLink :to="{ name: 'Order', params: { code: o.clientTransactionId } }" class="row">
          <img v-if="o.items[0]?.image" :src="o.items[0].image" :alt="''" class="row__img" />
          <span class="row__main">
            <strong>{{ o.number }}</strong>
            <small>{{ formatDate(o.createdAt) }} · {{ o.items.reduce((n, i) => n + i.qty, 0) }} artículos · {{ formatMoney(o.total) }}</small>
          </span>
          <span class="status" :class="`status--${o.status}`">{{ orderStatusLabel(o.status) }}</span>
          <i class="fa-solid fa-chevron-right row__chev"></i>
        </RouterLink>
      </li>
    </ul>

    <p v-else class="mine__state">
      <i class="fa-solid fa-receipt"></i>
      En este dispositivo no hay pedidos guardados todavía.
    </p>

    <form class="lookup" @submit.prevent="lookup">
      <h2 class="lookup__title"><i class="fa-solid fa-envelope"></i> ¿Compraste desde otro dispositivo?</h2>
      <p class="lookup__text">Escribe el correo con el que pediste y te mandamos los enlaces de seguimiento.</p>
      <div v-if="!sent" class="lookup__row">
        <input v-model="email" type="email" required placeholder="tu@correo.com" autocomplete="email" />
        <button class="btn btn--primary" :disabled="sending">
          <i v-if="sending" class="fa-solid fa-spinner fa-spin"></i> Enviar
        </button>
      </div>
      <p v-else class="lookup__ok"><i class="fa-solid fa-circle-check"></i> Si hay pedidos con ese correo, ya te llegó el mensaje. Revisa también spam.</p>
      <p v-if="error" class="lookup__error">{{ error }}</p>
    </form>

    <a v-if="site.whatsapp" :href="whatsappLink('Hola, quiero consultar por mi pedido')" class="mine__wa" target="_blank" rel="noopener">
      <i class="fa-brands fa-whatsapp"></i> ¿Dudas? Escríbenos al {{ site.whatsappDisplay }}
    </a>
  </section>
</template>

<style scoped lang="scss">
.mine {
  @include container(680px);
  @include flex(column, stretch, flex-start, 1.2rem);
  padding-block: $space-md $space-section;

  &__head {
    @include reveal;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__state {
    @include flex(column, center, center, 0.6rem);
    text-align: center;
    color: $ink-soft;
    padding-block: $space-md;

    i {
      font-size: 2rem;
      color: $ink-muted;
    }
  }

  &__wa {
    @include flex(row, center, center, 0.5rem);
    font-weight: 600;
    color: #128c7e;
    padding: 0.6rem;
  }
}

.list {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.6rem);

  li {
    @include reveal;
  }
}

.row {
  @include card;
  @include flex(row, center, flex-start, 0.8rem);
  padding: 0.8rem 0.9rem;
  @include lift;

  &__img {
    flex: 0 0 3.2rem;
    width: 3.2rem;
    height: 3.2rem;
    object-fit: cover;
    border-radius: $radius-sm;
    background: $sand;
  }

  &__main {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__chev {
    color: $ink-muted;
    font-size: 0.75rem;
  }
}

.status {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: $radius-pill;
  background: $info-bg;
  color: $info;
  white-space: nowrap;

  &--paid, &--delivered { background: $success-bg; color: $success; }
  &--cancelled { background: $danger-bg; color: $danger; }
  &--pending_payment { background: $warning-bg; color: $warning; }
}

.lookup {
  @include card;
  padding: 1.2rem 1.1rem;
  background: $sand;
  border: none;
  @include flex(column, stretch, flex-start, 0.6rem);
  @include reveal;

  &__title {
    @include display($text-lg, 600);
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $accent;
      font-size: 0.95rem;
    }
  }

  &__text {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__row {
    @include flex(column, stretch, flex-start, 0.5rem);

    @include from('sm') {
      flex-direction: row;

      input {
        flex: 1;
      }
    }
  }

  &__ok {
    color: $success;
    font-size: $text-sm;
    font-weight: 600;
  }

  &__error {
    color: $danger;
    font-size: $text-sm;
  }
}
</style>
