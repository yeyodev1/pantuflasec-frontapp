<script setup lang="ts">
import { computed, toRef } from 'vue'
import { logo, site, whatsappLink } from '@/config/site'
import { categories } from '@/config/catalog'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { useOrdersSummary } from '@/composables/useOrdersSummary'

/** Menú a pantalla completa. Se abre desde el header; cada enlace entra escalonado. */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const userStore = useUserStore()
const cart = useCartStore()
const { pending } = useOrdersSummary()
useBodyScroll(toRef(props, 'open'))

const main = computed(() => [
  { to: '/', label: 'Inicio', icon: 'fa-solid fa-house' },
  { to: '/tienda', label: 'Tienda', icon: 'fa-solid fa-store' },
  { to: '/tienda?orden=recent', label: 'Novedades', icon: 'fa-solid fa-wand-magic-sparkles' },
  { to: '/tienda?categoria=arreglos', label: 'Regalos y box', icon: 'fa-solid fa-gift' },
  { to: '/mis-pedidos', label: 'Mis pedidos', icon: 'fa-solid fa-receipt' },
])
</script>

<template>
  <Teleport to="body">
    <Transition name="menu">
      <div v-if="open" class="menu" role="dialog" aria-modal="true" aria-label="Menú">
        <header class="menu__head">
          <img :src="logo.wordmark" alt="Pantuflas Ecuador" class="menu__brand" width="150" height="54" />
          <button class="menu__close" aria-label="Cerrar menú" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
        </header>

        <nav class="menu__body">
          <ul class="menu__main">
            <li v-for="(l, i) in main" :key="l.to" :style="{ '--i': i }">
              <RouterLink :to="l.to" class="menu__link" @click="emit('close')"><i :class="l.icon"></i>{{ l.label }}</RouterLink>
            </li>
            <li :style="{ '--i': main.length }">
              <button class="menu__link" @click="emit('close'); cart.open = true">
                <i class="fa-solid fa-bag-shopping"></i>Carrito
                <span v-if="cart.count" class="menu__badge">{{ cart.count }}</span>
              </button>
            </li>
          </ul>

          <p class="menu__eyebrow" :style="{ '--i': 6 }">Categorías</p>
          <ul class="menu__cats" :style="{ '--i': 7 }">
            <li v-for="c in categories" :key="c.key">
              <RouterLink :to="{ path: '/tienda', query: { categoria: c.key } }" class="menu__cat" @click="emit('close')">
                <i :class="c.icon"></i> {{ c.label }}
              </RouterLink>
            </li>
          </ul>

          <ul v-if="userStore.isAdmin" class="menu__account" :style="{ '--i': 9 }">
            <li v-if="userStore.isAdmin">
              <RouterLink to="/admin/pedidos" class="menu__link menu__link--accent" @click="emit('close')">
                <i class="fa-solid fa-receipt"></i>Pedidos
                <span v-if="pending" class="menu__badge menu__badge--hot">{{ pending }}</span>
              </RouterLink>
            </li>
            <li v-if="userStore.isAdmin">
              <RouterLink to="/admin/productos" class="menu__link" @click="emit('close')"><i class="fa-solid fa-gauge"></i>Panel</RouterLink>
            </li>
            <li v-if="userStore.isAdmin">
              <RouterLink to="/cuenta" class="menu__link" @click="emit('close')"><i class="fa-solid fa-user"></i>Mi cuenta</RouterLink>
            </li>
          </ul>
        </nav>

        <footer class="menu__foot" :style="{ '--i': 11 }">
          <a :href="whatsappLink()" class="menu__contact" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i> {{ site.whatsappDisplay }}
          </a>
          <a :href="site.social.instagram" class="menu__contact" target="_blank" rel="noopener">
            <i class="fa-brands fa-instagram"></i> {{ site.social.instagramHandle }}
          </a>
          <p class="menu__stores">
            <span v-for="s in site.stores" :key="s.name"><i class="fa-solid fa-location-dot"></i> {{ s.name }} · {{ s.address }}</span>
          </p>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.menu {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: $paper;
  @include flex(column, stretch, flex-start);
  overflow-y: auto;
  padding: 0 1.25rem calc(1.5rem + env(safe-area-inset-bottom));

  @include from('md') {
    padding-inline: clamp(2rem, 8vw, 8rem);
  }

  // Cada bloque entra escalonado según --i.
  &__main li,
  &__eyebrow,
  &__cats,
  &__account,
  &__foot {
    @include reveal(0.5s, 0.05s);
  }

  &__head {
    @include flex(row, center, space-between);
    padding-block: 0.85rem;
    border-bottom: 1px solid $line;
    position: sticky;
    top: 0;
    background: $paper;
  }

  &__brand {
    height: 2.6rem;
    width: auto;
  }

  &__close {
    width: 2.6rem;
    height: 2.6rem;
    font-size: 1.4rem;
    border-radius: $radius-pill;
    @include press;

    &:hover {
      background: $sand;
    }
  }

  &__body {
    flex: 1;
    padding-top: 1.2rem;
  }

  &__main,
  &__account {
    list-style: none;
  }

  &__link {
    width: 100%;
    @include flex(row, center, flex-start, 0.9rem);
    text-align: left;
    @include display($display-sm, 500);
    padding: 0.45rem 0;
    color: $ink;
    @include transition(color);

    i {
      width: 1.6rem;
      font-size: 1.1rem;
      color: $accent;
      text-align: center;
    }

    &:hover,
    &.router-link-exact-active {
      color: $accent-deep;
    }

    &--accent {
      color: $accent-deep;
    }
  }

  &__badge {
    margin-left: 0.4rem;
    min-width: 1.4rem;
    height: 1.4rem;
    padding-inline: 0.35rem;
    border-radius: $radius-pill;
    background: $sand;
    color: $ink-soft;
    font-family: $font-principal;
    font-size: 0.7rem;
    font-weight: 700;
    @include flex(row, center, center);

    &--hot {
      background: $accent;
      color: $surface;
    }
  }

  &__eyebrow {
    @include eyebrow;
    margin: 1.4rem 0 0.6rem;
  }

  &__cats {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__cat {
    @include flex(row, center, center, 0.45rem);
    font-size: $text-sm;
    font-weight: 600;
    padding: 0.5rem 0.9rem;
    border: 1px solid $line;
    border-radius: $radius-pill;
    background: $surface;
    color: $ink-soft;
    @include transition;
    @include press;

    i {
      color: $accent-deep;
      font-size: 0.8rem;
    }

    &:hover {
      border-color: $accent;
      color: $accent-deep;
      background: $accent-soft;
    }
  }

  &__account {
    margin-top: 1.4rem;
    padding-top: 1rem;
    border-top: 1px solid $line;

    .menu__link {
      @include display($text-xl, 500);
      padding: 0.35rem 0;
    }
  }

  &__foot {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid $line;
    @include flex(column, flex-start, flex-start, 0.5rem);
  }

  &__contact {
    @include flex(row, center, flex-start, 0.6rem);
    font-weight: 600;
    color: $ink;

    i {
      font-size: 1.2rem;
      color: $accent;
    }

    &:hover {
      color: $accent-deep;
    }
  }

  &__stores {
    @include flex(column, flex-start, flex-start, 0.2rem);
    font-size: $text-xs;
    color: $ink-muted;

    i {
      color: $accent;
      margin-right: 0.3rem;
    }
  }
}

// Entrada: el panel baja desde arriba con un leve desvanecido; salida más rápida.
.menu-enter-active {
  transition: transform 0.45s $ease, opacity 0.3s ease;
}
.menu-leave-active {
  transition: transform 0.3s $ease, opacity 0.25s ease;
}
.menu-enter-from,
.menu-leave-to {
  transform: translateY(-4%);
  opacity: 0;
}
</style>
