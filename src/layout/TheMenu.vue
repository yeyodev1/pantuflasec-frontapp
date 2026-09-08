<script setup lang="ts">
import { toRef } from 'vue'
import { logo, site } from '@/config/site'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { useOrdersSummary } from '@/composables/useOrdersSummary'
import { useWhatsApp } from '@/composables/useWhatsApp'
import MenuCategories from './MenuCategories.vue'

/** Menú a pantalla completa en azul marino de marca, con las categorías en foto. */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const userStore = useUserStore()
const cart = useCartStore()
const { pending } = useOrdersSummary()
const { ask } = useWhatsApp()
useBodyScroll(toRef(props, 'open'))

const main = [
  { to: '/', label: 'Inicio', icon: 'fa-solid fa-house' },
  { to: '/tienda', label: 'Tienda', icon: 'fa-solid fa-store' },
  { to: '/tienda?orden=recent', label: 'Novedades', icon: 'fa-solid fa-wand-magic-sparkles' },
  { to: '/tienda?categoria=arreglos', label: 'Regalos y box', icon: 'fa-solid fa-gift' },
  { to: '/mis-pedidos', label: 'Mis pedidos', icon: 'fa-solid fa-receipt' },
]
</script>

<template>
  <Teleport to="body">
    <Transition name="menu">
      <div v-if="open" class="menu" role="dialog" aria-modal="true" aria-label="Menú">
        <span class="menu__glow" aria-hidden="true"></span>

        <header class="menu__head">
          <img :src="logo.wordmark" alt="Pantuflas Ecuador" class="menu__brand" width="150" height="54" />
          <button class="menu__close" aria-label="Cerrar menú" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
        </header>

        <div class="menu__body">
          <nav class="menu__nav" aria-label="Principal">
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

            <ul v-if="userStore.isAdmin" class="menu__admin" :style="{ '--i': 7 }">
              <li>
                <RouterLink to="/admin/pedidos" class="menu__link menu__link--sm menu__link--hot" @click="emit('close')">
                  <i class="fa-solid fa-receipt"></i>Pedidos
                  <span v-if="pending" class="menu__badge menu__badge--hot">{{ pending }}</span>
                </RouterLink>
              </li>
              <li><RouterLink to="/admin/productos" class="menu__link menu__link--sm" @click="emit('close')"><i class="fa-solid fa-gauge"></i>Panel</RouterLink></li>
              <li><RouterLink to="/cuenta" class="menu__link menu__link--sm" @click="emit('close')"><i class="fa-solid fa-user"></i>Mi cuenta</RouterLink></li>
            </ul>
          </nav>

          <MenuCategories class="menu__cats" :style="{ '--i': 6 }" @pick="emit('close')" />
        </div>

        <footer class="menu__foot" :style="{ '--i': 9 }">
          <button type="button" class="menu__wa" @click="emit('close'); ask()">
            <i class="fa-brands fa-whatsapp"></i> {{ site.whatsappDisplay }}
          </button>
          <a :href="site.social.instagram" class="menu__ig" target="_blank" rel="noopener">
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
  background: $ink;
  color: $paper;
  @include flex(column, stretch, flex-start);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
  isolation: isolate;

  @include from('md') {
    padding-inline: clamp(2rem, 6vw, 6rem);
  }

  // Resplandor amarillo de marca arriba a la derecha.
  &__glow {
    position: absolute;
    top: -20vh;
    right: -20vw;
    width: 70vw;
    height: 70vw;
    max-width: 640px;
    max-height: 640px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($highlight, 0.35), transparent 65%);
    pointer-events: none;
    z-index: -1;
  }

  &__main li,
  &__admin,
  &__cats,
  &__foot {
    @include reveal(0.5s, 0.05s);
  }

  &__head {
    @include flex(row, center, space-between);
    padding-block: 0.85rem;
    border-bottom: 1px solid rgba($paper, 0.1);
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgba($ink, 0.9);
    backdrop-filter: blur(8px);
    margin-inline: -1.25rem;
    padding-inline: 1.25rem;

    @include from('md') {
      margin-inline: 0;
      padding-inline: 0;
    }
  }

  &__brand {
    height: 2.6rem;
    width: auto;
  }

  &__close {
    width: 2.6rem;
    height: 2.6rem;
    font-size: 1.3rem;
    border-radius: $radius-pill;
    color: $paper;
    background: rgba($paper, 0.08);
    @include press;

    &:hover {
      background: $highlight;
      color: $ink;
    }
  }

  &__body {
    flex: 1;
    padding-top: 1.4rem;
    @include flex(column, stretch, flex-start, 1.6rem);

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;
      gap: 3rem;
      padding-top: 2.5rem;

      > .menu__nav {
        flex: 0 0 36%;
      }

      > .menu__cats {
        flex: 1;
      }
    }
  }

  &__main,
  &__admin {
    list-style: none;
  }

  &__link {
    width: 100%;
    @include flex(row, center, flex-start, 0.9rem);
    text-align: left;
    @include display($display-sm, 500);
    padding: 0.4rem 0;
    color: $paper;
    @include transition(color);

    i {
      width: 1.7rem;
      font-size: 1.05rem;
      color: $highlight;
      text-align: center;
    }

    &:hover,
    &.router-link-exact-active {
      color: $highlight;
    }

    &--sm {
      @include display($text-xl, 500);
      padding: 0.3rem 0;
    }

    &--hot {
      color: $highlight;
    }
  }

  &__badge {
    margin-left: 0.4rem;
    min-width: 1.4rem;
    height: 1.4rem;
    padding-inline: 0.35rem;
    border-radius: $radius-pill;
    background: rgba($paper, 0.15);
    color: $paper;
    font-family: $font-principal;
    font-size: 0.7rem;
    font-weight: 700;
    @include flex(row, center, center);

    &--hot {
      background: $highlight;
      color: $ink;
    }
  }

  &__admin {
    margin-top: 1.2rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba($paper, 0.1);
  }

  &__foot {
    margin-top: 1.6rem;
    padding-top: 1.1rem;
    border-top: 1px solid rgba($paper, 0.1);
    @include flex(column, flex-start, flex-start, 0.6rem);
  }

  &__wa {
    @include flex(row, center, center, 0.6rem);
    padding: 0.75rem 1.3rem;
    border-radius: $radius-pill;
    background: #25d366;
    color: #fff;
    font-weight: 700;
    @include press;

    i {
      font-size: 1.25rem;
    }
  }

  &__ig {
    @include flex(row, center, flex-start, 0.6rem);
    font-weight: 600;
    color: $paper;

    i {
      font-size: 1.2rem;
      color: $highlight;
    }
  }

  &__stores {
    @include flex(column, flex-start, flex-start, 0.2rem);
    font-size: $text-xs;
    color: rgba($paper, 0.6);

    i {
      color: $highlight;
      margin-right: 0.3rem;
    }
  }
}


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
