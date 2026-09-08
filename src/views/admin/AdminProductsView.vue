<script setup lang="ts">
import { ref } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useAdminProducts } from '@/composables/useAdminProducts'
import { categoryLabel } from '@/config/catalog'
import { formatMoney } from '@/utils/format'
import { mainImage, totalStock } from '@/utils/product'
import type { Product } from '@/types'

const { items, total, pages, page, q, loading, toggle, remove } = useAdminProducts()
const toDelete = ref<Product | null>(null)

function stockLabel(p: Product) {
  const s = totalStock(p)
  return Number.isFinite(s) ? `${s} u.` : '∞'
}
</script>

<template>
  <AdminShell title="Productos">
    <template #actions>
      <RouterLink to="/admin/productos/nuevo" class="btn btn--primary">
        <i class="fa-solid fa-plus"></i> Nuevo
      </RouterLink>
    </template>

    <label class="search">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input v-model="q" type="search" placeholder="Buscar producto…" />
    </label>
    <p class="count">{{ total }} productos</p>

    <ul class="list" :class="{ 'list--dim': loading }">
      <li v-for="(p, i) in items" :key="p._id" class="row" :class="{ 'row--off': !p.isActive }" :style="{ '--i': i % 10 }">
        <img :src="mainImage(p)" :alt="''" width="56" height="56" class="row__img" />
        <div class="row__main">
          <RouterLink :to="`/admin/productos/${p.slug}`" class="row__name">{{ p.name }}</RouterLink>
          <p class="row__meta">
            {{ categoryLabel(p.category) }}<span v-if="p.collection"> · {{ p.collection }}</span>
            · {{ formatMoney(p.price) }} · stock {{ stockLabel(p) }}
            · <i class="fa-regular fa-image"></i> {{ p.images.length }}/5
          </p>
          <p v-if="p.variants.length" class="row__variants">
            <span v-for="v in p.variants" :key="v._id" :class="['row__variant', { 'row__variant--out': v.stock <= 0 }]">
              {{ v.label }} <b>{{ v.stock }}</b>
            </span>
          </p>
        </div>
        <div class="row__actions">
          <button :class="['pill', { 'pill--on': p.featured }]" title="Destacado" @click="toggle(p, 'featured')">
            <i class="fa-solid fa-star"></i>
          </button>
          <button :class="['pill', { 'pill--on': p.isActive }]" :title="p.isActive ? 'Visible' : 'Oculto'" @click="toggle(p, 'isActive')">
            <i :class="p.isActive ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
          </button>
          <button class="pill pill--danger" title="Eliminar" @click="toDelete = p">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </li>
    </ul>

    <nav v-if="pages > 1" class="pager">
      <button class="btn btn--ghost" :disabled="page <= 1" @click="page--"><i class="fa-solid fa-chevron-left"></i></button>
      <span>{{ page }} / {{ pages }}</span>
      <button class="btn btn--ghost" :disabled="page >= pages" @click="page++"><i class="fa-solid fa-chevron-right"></i></button>
    </nav>

    <BaseModal
      :open="Boolean(toDelete)"
      title="¿Eliminar producto?"
      :message="`Se borra ${toDelete?.name ?? ''} de forma definitiva. Si solo quieres ocultarlo, usa el ojo.`"
      confirm-label="Eliminar"
      danger
      @confirm="toDelete && remove(toDelete); toDelete = null"
      @cancel="toDelete = null"
    />
  </AdminShell>
</template>

<style scoped lang="scss">
.search {
  position: relative;
  margin: 0;

  i { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: $ink-muted; }
  input { padding-left: 2.4rem; border-radius: $radius-pill; }
}

.count { font-size: $text-xs; color: $ink-muted; }

.list {
  list-style: none;
  @include card;
  @include transition(opacity);

  &--dim { opacity: 0.5; }
}

.row {
  @include flex(row, center, flex-start, 0.8rem);
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid $line;
  @include reveal(0.4s, 0.03s);

  &:last-child { border-bottom: none; }
  &--off { opacity: 0.55; }

  &__img {
    flex: 0 0 3.5rem;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: $radius-sm;
    background: $sand;
  }

  &__main { flex: 1; min-width: 0; }

  &__name {
    font-weight: 600;
    font-size: $text-sm;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover { color: $accent-deep; }
  }

  &__meta { font-size: $text-xs; color: $ink-muted; }

  &__variants {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.3rem;
  }

  &__variant {
    font-size: 0.62rem;
    font-weight: 600;
    padding: 0.1rem 0.45rem;
    border-radius: $radius-pill;
    background: $sand;
    color: $ink-soft;

    b { color: $accent-deep; }

    &--out {
      background: $danger-bg;
      color: $danger;
      b { color: $danger; }
    }
  }

  &__actions { @include flex(row, center, flex-end, 0.3rem); }
}

.pill {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  color: $ink-muted;
  font-size: 0.8rem;
  @include flex(row, center, center);
  @include transition;

  &--on { color: $accent-deep; border-color: $accent; background: $accent-soft; }
  &--danger:hover { color: $danger; border-color: $danger; }
}

.pager {
  @include flex(row, center, center, 1rem);
  font-size: $text-sm;
  color: $ink-soft;

  .btn { padding: 0.5rem 0.8rem; }
}
</style>
