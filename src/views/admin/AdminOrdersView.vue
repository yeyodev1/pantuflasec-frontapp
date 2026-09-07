<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import { orderService } from '@/services/order.service'
import { orderStatuses, orderStatusLabel } from '@/config/orders'
import { formatDate, formatMoney } from '@/utils/format'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Order } from '@/types'

const toast = useToastStore()
const items = ref<Order[]>([])
const total = ref(0)
const pages = ref(1)
const page = ref(1)
const status = ref('')
const q = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const r = await orderService.listAll({ status: status.value, page: page.value, q: q.value })
    items.value = r.items
    total.value = r.total
    pages.value = r.pages
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(() => ((page.value = 1), load()), 350)
})
watch(status, () => ((page.value = 1), load()))
watch(page, load, { immediate: true })
</script>

<template>
  <AdminShell title="Pedidos">
    <label class="search">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input v-model="q" type="search" placeholder="Número, nombre, correo o celular…" />
    </label>

    <div class="chips">
      <button class="chip" :class="{ 'chip--on': !status }" @click="status = ''">Todos</button>
      <button v-for="s in orderStatuses" :key="s.key" class="chip" :class="{ 'chip--on': status === s.key }" @click="status = s.key">
        {{ s.label }}
      </button>
    </div>
    <p class="count">{{ total }} pedidos</p>

    <ul class="list" :class="{ 'list--dim': loading }">
      <li v-for="(o, i) in items" :key="o._id" :style="{ '--i': i % 10 }">
        <RouterLink :to="`/admin/pedidos/${o._id}`" class="row">
          <div class="row__main">
            <p class="row__title">
              <strong>{{ o.number }}</strong> · {{ o.customer.name }}
              <i v-if="o.stockIssue" class="fa-solid fa-triangle-exclamation row__warn" title="Revisar stock"></i>
            </p>
            <p class="row__meta">
              {{ formatDate(o.createdAt) }} · {{ o.items.reduce((n, i) => n + i.qty, 0) }} ítems · {{ o.shipping.label }}
            </p>
          </div>
          <div class="row__side">
            <span class="status" :class="`status--${o.status}`">{{ orderStatusLabel(o.status) }}</span>
            <strong>{{ formatMoney(o.total) }}</strong>
          </div>
        </RouterLink>
      </li>
      <li v-if="!loading && !items.length" class="empty">No hay pedidos con ese filtro.</li>
    </ul>

    <nav v-if="pages > 1" class="pager">
      <button class="btn btn--ghost" :disabled="page <= 1" @click="page--"><i class="fa-solid fa-chevron-left"></i></button>
      <span>{{ page }} / {{ pages }}</span>
      <button class="btn btn--ghost" :disabled="page >= pages" @click="page++"><i class="fa-solid fa-chevron-right"></i></button>
    </nav>
  </AdminShell>
</template>

<style scoped lang="scss">
.search {
  position: relative;
  margin: 0;

  i { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: $ink-muted; }
  input { padding-left: 2.4rem; border-radius: $radius-pill; }
}

.chips {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.2rem;
}

.chip {
  flex: 0 0 auto;
  font-size: $text-xs;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  background: $surface;
  color: $ink-soft;
  white-space: nowrap;

  &--on { border-color: $accent; color: $accent-deep; background: $accent-soft; }
}

.count { font-size: $text-xs; color: $ink-muted; }

.list {
  list-style: none;
  @include card;
  @include transition(opacity);

  &--dim { opacity: 0.5; }
}

.row {
  @include flex(row, center, space-between, 0.8rem);
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid $line;
  @include reveal(0.4s, 0.03s);

  &:hover { background: $sand; }

  &__main { flex: 1; min-width: 0; }
  &__title { font-size: $text-sm; }
  &__meta { font-size: $text-xs; color: $ink-muted; }
  &__warn { color: $warning; margin-left: 0.3rem; }

  &__side {
    @include flex(column, flex-end, center, 0.2rem);
    font-size: $text-sm;
  }
}

.empty {
  padding: 1.5rem;
  text-align: center;
  color: $ink-muted;
  font-size: $text-sm;
}

.status {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: $radius-pill;
  background: $info-bg;
  color: $info;

  &--paid, &--delivered { background: $success-bg; color: $success; }
  &--cancelled { background: $danger-bg; color: $danger; }
  &--pending_payment { background: $warning-bg; color: $warning; }
}

.pager {
  @include flex(row, center, center, 1rem);
  font-size: $text-sm;
  color: $ink-soft;

  .btn { padding: 0.5rem 0.8rem; }
}
</style>
