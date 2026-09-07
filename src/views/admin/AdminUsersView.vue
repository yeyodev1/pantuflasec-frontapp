<script setup lang="ts">
import { ref } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import UserFormModal from '@/components/admin/UserFormModal.vue'
import { useAdminUsers } from '@/composables/useAdminUsers'
import { formatDate } from '@/utils/format'
import type { AdminUser } from '@/types'

const { items, total, pages, page, q, role, loading, saving, editing, showForm, form, openNew, openEdit, save, toggleActive, remove, isMe } =
  useAdminUsers()
const toDelete = ref<AdminUser | null>(null)
</script>

<template>
  <AdminShell title="Usuarios">
    <template #actions>
      <button class="btn btn--primary" @click="openNew"><i class="fa-solid fa-user-plus"></i> Nuevo</button>
    </template>

    <label class="search">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input v-model="q" type="search" placeholder="Correo, nombre o celular…" />
    </label>
    <div class="chips">
      <button class="chip" :class="{ 'chip--on': !role }" @click="role = ''">Todos</button>
      <button class="chip" :class="{ 'chip--on': role === 'admin' }" @click="role = 'admin'">Administradores</button>
      <button class="chip" :class="{ 'chip--on': role === 'customer' }" @click="role = 'customer'">Clientes</button>
    </div>
    <p class="count">{{ total }} usuarios</p>

    <ul class="list" :class="{ 'list--dim': loading }">
      <li v-for="(u, i) in items" :key="u.id" class="row" :class="{ 'row--off': !u.isActive }" :style="{ '--i': i % 10 }">
        <span class="row__avatar" :class="{ 'row__avatar--admin': u.accountType === 'admin' }">
          <i :class="u.accountType === 'admin' ? 'fa-solid fa-user-shield' : 'fa-solid fa-user'"></i>
        </span>
        <div class="row__main">
          <p class="row__title">
            <strong>{{ u.name || u.email }}</strong>
            <span v-if="isMe(u)" class="row__me">tú</span>
          </p>
          <p class="row__meta">
            {{ u.email }}<span v-if="u.phone"> · {{ u.phone }}</span>
            · {{ u.accountType === 'admin' ? 'Administrador' : 'Cliente' }}
            · alta {{ formatDate(u.createdAt) }}
          </p>
        </div>
        <div class="row__actions">
          <button class="pill" title="Editar" @click="openEdit(u)"><i class="fa-solid fa-pen"></i></button>
          <button :class="['pill', { 'pill--on': u.isActive }]" :title="u.isActive ? 'Activo' : 'Inactivo'" :disabled="isMe(u)" @click="toggleActive(u)">
            <i :class="u.isActive ? 'fa-solid fa-circle-check' : 'fa-solid fa-ban'"></i>
          </button>
          <button class="pill pill--danger" title="Eliminar" :disabled="isMe(u)" @click="toDelete = u"><i class="fa-solid fa-trash"></i></button>
        </div>
      </li>
      <li v-if="!loading && !items.length" class="empty">No hay usuarios con ese filtro.</li>
    </ul>

    <nav v-if="pages > 1" class="pager">
      <button class="btn btn--ghost" :disabled="page <= 1" @click="page--"><i class="fa-solid fa-chevron-left"></i></button>
      <span>{{ page }} / {{ pages }}</span>
      <button class="btn btn--ghost" :disabled="page >= pages" @click="page++"><i class="fa-solid fa-chevron-right"></i></button>
    </nav>

    <UserFormModal :open="showForm" :editing="Boolean(editing)" :form="form" :saving="saving" @save="save" @close="showForm = false" />

    <BaseModal
      :open="Boolean(toDelete)"
      title="¿Eliminar usuario?"
      :message="`Se borra la cuenta ${toDelete?.email ?? ''}. Si solo quieres bloquearla, desactívala.`"
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

.chips { display: flex; gap: 0.4rem; overflow-x: auto; scrollbar-width: none; }

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
  @include press;
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
  @include flex(row, center, flex-start, 0.8rem);
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid $line;
  @include reveal(0.4s, 0.03s);
  &:last-child { border-bottom: none; }
  &--off { opacity: 0.55; }

  &__avatar {
    flex: 0 0 2.4rem;
    height: 2.4rem;
    border-radius: $radius-pill;
    background: $sand;
    color: $ink-soft;
    @include flex(row, center, center);
    &--admin { background: $accent-soft; color: $accent-deep; }
  }

  &__main { flex: 1; min-width: 0; }
  &__title { font-size: $text-sm; }
  &__me { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; color: $accent-deep; margin-left: 0.4rem; }
  &__meta { font-size: $text-xs; color: $ink-muted; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
  @include press;
  &--on { color: $success; border-color: $success; background: $success-bg; }
  &--danger:hover { color: $danger; border-color: $danger; }
  &:disabled { opacity: 0.35; pointer-events: none; }
}

.empty { padding: 1.5rem; text-align: center; color: $ink-muted; font-size: $text-sm; }

.pager {
  @include flex(row, center, center, 1rem);
  font-size: $text-sm;
  color: $ink-soft;
  .btn { padding: 0.5rem 0.8rem; }
}
</style>
