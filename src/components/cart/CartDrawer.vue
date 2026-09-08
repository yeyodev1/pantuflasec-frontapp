<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { formatMoney } from '@/utils/format'
import CartLineItem from './CartLineItem.vue'

/** Carrito a pantalla completa: líneas a la izquierda, resumen fijo a la derecha. */
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
    <Transition name="cart">
      <div v-if="cart.open" class="cart" role="dialog" aria-modal="true" aria-label="Carrito">
        <header class="cart__head">
          <div class="cart__head-inner">
            <h2 class="cart__title">
              <i class="fa-solid fa-bag-shopping"></i> Tu carrito
              <small v-if="cart.count">{{ cart.count }} {{ cart.count === 1 ? 'artículo' : 'artículos' }}</small>
            </h2>
            <button class="cart__close" aria-label="Cerrar" @click="cart.open = false"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </header>

        <div class="cart__body">
          <section class="cart__lines">
            <p v-if="cart.isEmpty" class="cart__empty">
              <i class="fa-solid fa-bag-shopping"></i>
              Todavía no has agregado nada.
              <RouterLink to="/tienda" class="btn btn--primary" @click="cart.open = false">Ir a la tienda</RouterLink>
            </p>
            <TransitionGroup v-else name="rise">
              <CartLineItem
                v-for="line in cart.lines"
                :key="line.key"
                :line="line"
                :fresh="cart.lastAdded === line.key"
                @qty="cart.setQty(line.key, $event)"
                @remove="cart.remove(line.key)"
              />
            </TransitionGroup>
            <button v-if="!cart.isEmpty" class="cart__more" @click="cart.open = false">
              <i class="fa-solid fa-arrow-left"></i> Seguir comprando
            </button>
          </section>

          <aside v-if="!cart.isEmpty" class="cart__summary">
            <div class="cart__total">
              <span>Subtotal</span>
              <strong>{{ formatMoney(cart.subtotal) }}</strong>
            </div>
            <p class="cart__note">Envío e IVA se calculan en el siguiente paso. Retiro en tienda gratis.</p>
            <button class="btn btn--primary cart__cta" @click="checkout">
              <i class="fa-solid fa-lock"></i> Finalizar compra
            </button>
            <p class="cart__safe"><i class="fa-brands fa-cc-visa"></i> <i class="fa-brands fa-cc-mastercard"></i> Pago seguro con PayPhone</p>
          </aside>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.cart {
  position: fixed;
  inset: 0;
  z-index: 201;
  background: $paper;
  @include flex(column, stretch, flex-start);
  overflow-y: auto;

  &__head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgba($paper, 0.94);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid $line;
  }

  &__head-inner {
    @include container(1100px);
    @include flex(row, center, space-between);
    padding-block: 0.9rem;
  }

  &__title {
    @include display($text-xl, 600);
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $accent;
      font-size: 1rem;
    }

    small {
      font-family: $font-principal;
      font-size: $text-xs;
      font-weight: 500;
      color: $ink-muted;
      margin-left: 0.3rem;
    }
  }

  &__close {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
    border-radius: $radius-pill;
    @include press;

    &:hover {
      background: $sand;
    }
  }

  &__body {
    @include container(1100px);
    flex: 1;
    @include flex(column, stretch, flex-start, 1.2rem);
    padding-block: 0.6rem 7rem;

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;
      gap: 2.5rem;
      padding-block: 1.5rem 3rem;
    }
  }

  &__lines {
    flex: 1;
    min-width: 0;
  }

  &__empty {
    @include flex(column, center, center, 1rem);
    padding-block: $space-lg;
    color: $ink-soft;
    text-align: center;

    i {
      font-size: 2rem;
      color: $ink-muted;
    }
  }

  &__more {
    margin-top: 1rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $accent-deep;
    @include flex(row, center, flex-start, 0.4rem);
  }

  // Móvil: resumen fijo abajo. Escritorio: panel a la derecha, pegado al scroll.
  &__summary {
    position: fixed;
    inset: auto 0 0;
    padding: 0.9rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
    background: $surface;
    border-top: 1px solid $line;
    box-shadow: 0 -8px 24px rgba($ink, 0.06);

    @include from('md') {
      position: sticky;
      top: 80px;
      inset: auto;
      flex: 0 0 340px;
      padding: 1.4rem 1.3rem;
      border: 1px solid $line;
      border-radius: $radius-md;
      box-shadow: none;
      background: $sand;
    }
  }

  &__total {
    @include flex(row, center, space-between);
    font-size: $text-lg;

    strong {
      color: $price;
    }
  }

  &__note {
    font-size: $text-xs;
    color: $ink-muted;
    margin: 0.3rem 0 0.8rem;
  }

  &__cta {
    width: 100%;
    padding-block: 1rem;
  }

  &__safe {
    text-align: center;
    font-size: $text-xs;
    color: $ink-muted;
    margin-top: 0.6rem;

    i {
      font-size: 1.05rem;
      vertical-align: middle;
    }
  }
}

.cart-enter-active {
  transition: transform 0.4s $ease, opacity 0.3s ease;
}
.cart-leave-active {
  transition: transform 0.3s $ease, opacity 0.25s ease;
}
.cart-enter-from,
.cart-leave-to {
  transform: translateY(4%);
  opacity: 0;
}
</style>
