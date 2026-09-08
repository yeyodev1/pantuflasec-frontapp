<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrdersSummary } from '@/composables/useOrdersSummary'
import { logo } from '@/config/site'

defineProps<{ title: string }>()
const userStore = useUserStore()
const router = useRouter()
const { pending } = useOrdersSummary()

/** Cada rol ve solo lo suyo: el vendedor, pedidos; el admin, todo. */
const links = computed(() => {
  const all = [
    { to: '/admin/pedidos', label: 'Pedidos', icon: 'fa-solid fa-receipt', roles: ['admin', 'staff'], badge: pending.value },
    { to: '/admin/productos', label: 'Productos', icon: 'fa-solid fa-box', roles: ['admin'] },
    { to: '/admin/portada', label: 'Portada', icon: 'fa-solid fa-image', roles: ['admin'] },
    { to: '/admin/galeria', label: 'Galería', icon: 'fa-solid fa-panorama', roles: ['admin'] },
    { to: '/admin/pagos', label: 'Pagos', icon: 'fa-solid fa-money-bill-transfer', roles: ['admin'] },
    { to: '/admin/archivos', label: 'Archivos', icon: 'fa-solid fa-images', roles: ['admin'] },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'fa-solid fa-users', roles: ['admin'] },
  ]
  return all.filter((l) => l.roles.includes(userStore.user?.accountType ?? ''))
})

const roleLabel = computed(() => (userStore.isAdmin ? 'Administrador' : userStore.isStaff ? 'Vendedor' : ''))

function logout() {
  userStore.clear()
  router.replace('/')
}
</script>

<template>
  <div class="admin">
    <aside class="sidebar">
      <RouterLink to="/admin" class="sidebar__brand">
        <img :src="logo.wordmark" alt="Pantuflas Ecuador" width="140" height="50" />
      </RouterLink>

      <nav class="sidebar__nav" aria-label="Administración">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="sidebar__link">
          <i :class="l.icon"></i> <span>{{ l.label }}</span>
          <b v-if="l.badge" class="sidebar__badge">{{ l.badge }}</b>
        </RouterLink>
      </nav>

      <div class="sidebar__foot">
        <div class="sidebar__user">
          <span class="sidebar__avatar"><i :class="userStore.isAdmin ? 'fa-solid fa-user-shield' : 'fa-solid fa-user-tie'"></i></span>
          <span class="sidebar__who">
            <strong>{{ userStore.user?.name || userStore.user?.email }}</strong>
            <small>{{ roleLabel }}</small>
          </span>
        </div>
        <RouterLink to="/tienda" class="sidebar__link sidebar__link--muted"><i class="fa-solid fa-store"></i> <span>Ver tienda</span></RouterLink>
        <RouterLink to="/cuenta" class="sidebar__link sidebar__link--muted"><i class="fa-solid fa-key"></i> <span>Mi cuenta</span></RouterLink>
        <button class="sidebar__link sidebar__link--muted" @click="logout"><i class="fa-solid fa-right-from-bracket"></i> <span>Salir</span></button>
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
$sidebar: 236px;

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
      margin-left: $sidebar;
      min-height: calc(100vh - 61px);
      padding: $space-md 2rem $space-lg;
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
  // Móvil: barra inferior clara con iconos.
  position: fixed;
  inset: auto 0 0;
  z-index: 90;
  background: rgba($surface, 0.96);
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
    position: relative;
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

  &__badge {
    position: absolute;
    top: 0.2rem;
    right: 22%;
    min-width: 1.1rem;
    height: 1.1rem;
    padding-inline: 0.25rem;
    border-radius: $radius-pill;
    background: $highlight;
    color: $ink;
    font-size: 0.6rem;
    line-height: 1.1rem;
    text-align: center;
  }

  // Escritorio: columna fija a la izquierda, siempre a toda la altura.
  @include from('md') {
    position: fixed;
    top: 61px;
    bottom: 0;
    left: 0;
    right: auto;
    height: auto;
    width: $sidebar;
    flex: 0 0 $sidebar;
    overflow-y: auto;
    @include flex(column, stretch, flex-start, 0.25rem);
    padding: 1.2rem 0.9rem;
    background: $surface;
    border-top: none;
    border-right: 1px solid $line;
    backdrop-filter: none;

    &__brand {
      display: block;
      padding: 0.2rem 0.6rem 1rem;

      img {
        height: 2.4rem;
        width: auto;
      }
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
      width: 100%;
      text-align: left;

      i {
        font-size: 0.95rem;
        width: 1.2rem;
        text-align: center;
        color: $accent;
      }

      &:hover {
        background: $sand;
        color: $ink;
      }

      &.router-link-active {
        background: $accent-soft;
        color: $accent-deep;
        font-weight: 700;
      }

      &--muted {
        color: $ink-muted;

        i {
          color: $ink-muted;
        }
      }
    }

    &__badge {
      position: static;
      margin-left: auto;
      background: $highlight;
    }

    &__foot {
      display: block;
      margin-top: auto;
      border-top: 1px solid $line;
      padding-top: 0.8rem;
    }

    &__user {
      @include flex(row, center, flex-start, 0.6rem);
      padding: 0.3rem 0.6rem 0.8rem;
    }

    &__avatar {
      flex: 0 0 2.2rem;
      height: 2.2rem;
      border-radius: $radius-pill;
      background: $highlight;
      color: $ink;
      @include flex(row, center, center);
      font-size: 0.9rem;
    }

    &__who {
      min-width: 0;
      @include flex(column, flex-start, center);

      strong {
        font-size: $text-xs;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
      }

      small {
        font-size: 0.65rem;
        color: $ink-muted;
      }
    }
  }
}
</style>
