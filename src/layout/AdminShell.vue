<script setup lang="ts">
import { useUserStore } from '@/stores/user'

defineProps<{ title: string }>()
const userStore = useUserStore()

const links = [
  { to: '/admin/productos', label: 'Productos', icon: 'fa-solid fa-box' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'fa-solid fa-receipt' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: 'fa-solid fa-users' },
  { to: '/admin/galeria', label: 'Galería', icon: 'fa-solid fa-panorama' },
  { to: '/admin/archivos', label: 'Archivos', icon: 'fa-solid fa-images' },
]
</script>

<template>
  <div class="admin">
    <!-- Sidebar en escritorio; barra inferior fija en móvil. -->
    <aside class="sidebar">
      <RouterLink to="/admin" class="sidebar__brand">
        <i class="fa-solid fa-gauge"></i> <span>Panel</span>
      </RouterLink>
      <nav class="sidebar__nav" aria-label="Administración">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="sidebar__link">
          <i :class="l.icon"></i> <span>{{ l.label }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar__foot">
        <p class="sidebar__user">{{ userStore.user?.name || userStore.user?.email }}</p>
        <RouterLink to="/tienda" class="sidebar__link sidebar__link--muted">
          <i class="fa-solid fa-store"></i> <span>Ver tienda</span>
        </RouterLink>
      </div>
    </aside>

    <section class="admin__main">
      <header class="admin__head">
        <h1 class="admin__title">{{ title }}</h1>
        <div class="admin__actions"><slot name="actions" /></div>
      </header>
      <slot />
    </section>
  </div>
</template>

<style scoped lang="scss">
$sidebar: 220px;

.admin {
  @include flex(column, stretch, flex-start);
  min-height: 100%;

  @include from('md') {
    flex-direction: row;
    align-items: stretch;
  }

  &__main {
    flex: 1;
    min-width: 0;
    @include flex(column, stretch, flex-start, 1rem);
    padding: $space-sm 1.25rem calc(5rem + env(safe-area-inset-bottom));

    @include from('md') {
      padding: $space-md 2rem $space-section;
    }
  }

  &__head {
    @include flex(row, center, space-between, 0.8rem);
    flex-wrap: wrap;
    @include reveal;
  }

  &__title {
    @include display($display-sm);
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
  }
}

.sidebar {
  // Móvil: barra inferior con iconos, como una app.
  position: fixed;
  inset: auto 0 0;
  z-index: 90;
  background: rgba($paper, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid $line;
  padding-bottom: env(safe-area-inset-bottom);
  @include flex(row, center, space-around);

  &__brand,
  &__foot {
    display: none;
  }

  &__nav {
    display: contents;
  }

  &__link {
    @include flex(column, center, center, 0.2rem);
    flex: 1;
    padding: 0.6rem 0.4rem;
    font-size: 0.65rem;
    font-weight: 600;
    color: $ink-muted;
    @include transition(color);

    i {
      font-size: 1.1rem;
    }

    &.router-link-active {
      color: $accent-deep;
    }
  }

  // Escritorio: columna fija a la izquierda.
  @include from('md') {
    position: sticky;
    top: 61px;
    inset: auto;
    align-self: flex-start;
    height: calc(100vh - 61px);
    flex: 0 0 $sidebar;
    @include flex(column, stretch, flex-start, 0.3rem);
    padding: 1.5rem 1rem;
    background: $surface;
    border-top: none;
    border-right: 1px solid $line;
    backdrop-filter: none;

    &__brand {
      @include display($text-lg, 600);
      @include flex(row, center, flex-start, 0.5rem);
      padding: 0.4rem 0.8rem 1rem;
    }

    &__nav {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    &__link {
      flex-direction: row;
      justify-content: flex-start;
      gap: 0.7rem;
      padding: 0.65rem 0.8rem;
      border-radius: $radius-sm;
      font-size: $text-sm;
      color: $ink-soft;

      i {
        font-size: 0.95rem;
        width: 1.2rem;
        text-align: center;
      }

      &:hover {
        background: $sand;
        color: $ink;
      }

      &.router-link-active {
        background: $accent-soft;
        color: $accent-deep;
      }

      &--muted {
        color: $ink-muted;
      }
    }

    &__foot {
      display: block;
      margin-top: auto;
      border-top: 1px solid $line;
      padding-top: 0.8rem;
    }

    &__user {
      font-size: $text-xs;
      color: $ink-muted;
      padding: 0 0.8rem 0.4rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
