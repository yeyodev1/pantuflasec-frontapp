<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { logo, site } from '@/config/site'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useOrdersSummary } from '@/composables/useOrdersSummary'
import TheMenu from './TheMenu.vue'

const route = useRoute()
const userStore = useUserStore()
const cart = useCartStore()
const { pending } = useOrdersSummary()
const menuOpen = ref(false)

// Al navegar se cierra el menú.
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="header__logo" aria-label="Pantuflas Ecuador, inicio">
        <img :src="logo.wordmark" alt="Pantuflas Ecuador" width="180" height="65" />
      </RouterLink>

      <nav class="header__nav" aria-label="Principal">
        <RouterLink v-for="link in site.nav" :key="link.to" :to="link.to" class="header__link">
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="header__actions">
        <!-- Pedidos: el acceso clave del admin, siempre a la vista con su contador. -->
        <RouterLink v-if="userStore.isAdmin" to="/admin/pedidos" class="header__orders" title="Pedidos">
          <i class="fa-solid fa-receipt"></i>
          <span class="header__orders-label">Pedidos</span>
          <span v-if="pending" class="header__count header__count--hot">{{ pending }}</span>
        </RouterLink>

        <RouterLink v-if="!userStore.isAdmin" to="/mis-pedidos" class="header__icon" aria-label="Mis pedidos" title="Mis pedidos">
          <i class="fa-solid fa-receipt"></i>
        </RouterLink>

        <button class="header__icon" aria-label="Abrir carrito" @click="cart.open = true">
          <i class="fa-solid fa-bag-shopping"></i>
          <span v-if="cart.count" :key="cart.count" class="header__count">{{ cart.count }}</span>
        </button>

        <button class="header__icon" aria-label="Abrir menú" :aria-expanded="menuOpen" @click="menuOpen = true">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>

    <TheMenu :open="menuOpen" @close="menuOpen = false" />
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba($paper, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $line;

  &__inner {
    @include container;
    @include flex(row, center, space-between, 1rem);
    padding-block: 0.6rem;
  }

  &__logo img {
    height: 2.4rem;
    width: auto;
    @include transition(transform);

    @include from('md') {
      height: 2.9rem;
    }
  }

  &__logo:hover img {
    transform: scale(1.03);
  }

  &__nav {
    display: none;

    @include from('md') {
      @include flex(row, center, center, 1.75rem);
    }
  }

  &__link {
    @include eyebrow;
    color: $ink-soft;
    padding: 0.6rem 0;
    border-bottom: 1px solid transparent;
    @include transition;

    &:hover,
    &.router-link-active {
      color: $accent-deep;
      border-color: $accent;
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.15rem);
  }

  &__icon {
    position: relative;
    font-size: 1.2rem;
    color: $ink;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: $radius-pill;
    @include flex(row, center, center);
    @include press;

    &:hover {
      background: $sand;
    }
  }

  &__orders {
    position: relative;
    @include flex(row, center, center, 0.45rem);
    height: 2.3rem;
    padding: 0 0.9rem;
    margin-right: 0.3rem;
    border-radius: $radius-pill;
    background: $ink;
    color: $surface;
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.04em;
    @include transition;
    @include press;

    &:hover {
      background: $accent-deep;
    }

    &-label {
      display: none;

      @include from('sm') {
        display: inline;
      }
    }
  }

  &__count {
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;
    min-width: 1.1rem;
    height: 1.1rem;
    padding-inline: 0.25rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $surface;
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1.1rem;
    text-align: center;
    animation: bump 0.4s $ease;

    &--hot {
      top: -0.35rem;
      right: -0.3rem;
      background: #ffcc00;
      color: $ink;
    }
  }
}
</style>
