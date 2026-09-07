<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { formatMoney } from '@/utils/format'
import CartLineItem from './CartLineItem.vue'

const cart = useCartStore()
const router = useRouter()
const open = computed(() => cart.open)

useBodyScroll(open)

function checkout() {
  cart.open = false
  router.push({ name: 'Checkout' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.open" class="backdrop" @click="cart.open = false"></div>
    </Transition>
    <Transition name="slide">
      <aside v-if="cart.open" class="drawer" aria-label="Carrito">
        <header class="drawer__head">
          <h2 class="drawer__title"><i class="fa-solid fa-bag-shopping"></i> Tu carrito</h2>
          <button class="drawer__close" aria-label="Cerrar" @click="cart.open = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="drawer__body">
          <p v-if="cart.isEmpty" class="drawer__empty">
            Todavía no has agregado nada.
            <RouterLink to="/tienda" class="btn btn--ghost" @click="cart.open = false">Ir a la tienda</RouterLink>
          </p>
          <TransitionGroup name="rise">
            <CartLineItem
              v-for="line in cart.lines"
              :key="line.key"
              :line="line"
              @qty="cart.setQty(line.key, $event)"
              @remove="cart.remove(line.key)"
            />
          </TransitionGroup>
        </div>

        <footer v-if="!cart.isEmpty" class="drawer__foot">
          <div class="drawer__total">
            <span>Subtotal</span>
            <strong>{{ formatMoney(cart.subtotal) }}</strong>
          </div>
          <p class="drawer__note">El envío se calcula en el siguiente paso.</p>
          <button class="btn btn--primary drawer__cta" @click="checkout">Finalizar compra</button>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.backdrop {
  position: fixed;
  inset: 0;
  background: $overlay;
  z-index: 200;
}

.drawer {
  position: fixed;
  inset: 0;
  z-index: 201;
  background: $paper;
  @include flex(column, stretch, flex-start);

  @include from('sm') {
    left: auto;
    width: min(420px, 100%);
    box-shadow: $shadow-lg;
  }

  &__head {
    @include flex(row, center, space-between);
    padding: 1rem 1.25rem;
    border-bottom: 1px solid $line;
  }

  &__title {
    @include display($text-lg, 600);
    @include flex(row, center, flex-start, 0.5rem);
  }

  &__close {
    width: 2.4rem;
    height: 2.4rem;
    font-size: 1.2rem;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding-inline: 1.25rem;
  }

  &__empty {
    @include flex(column, center, center, 1rem);
    padding-block: $space-lg;
    color: $ink-soft;
    text-align: center;
  }

  &__foot {
    padding: 1rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom));
    border-top: 1px solid $line;
    background: $surface;
  }

  &__total {
    @include flex(row, center, space-between);
    font-size: $text-lg;
  }

  &__note {
    font-size: $text-xs;
    color: $ink-muted;
    margin: 0.3rem 0 0.9rem;
  }

  &__cta {
    width: 100%;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.35s $ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
