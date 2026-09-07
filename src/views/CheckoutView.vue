<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'
import CheckoutSummary from '@/components/checkout/CheckoutSummary.vue'
import PayphoneBox from '@/components/checkout/PayphoneBox.vue'
import { onMounted } from 'vue'
import { pixel } from '@/utils/pixel'

const {
  cart, config, loadingConfig, submitting, error, form, payphone, orderNumber,
  shippingCost, tax, total, needsAddress, payphoneReady, setMethod, submit,
} = useCheckout()

onMounted(() => {
  if (!cart.isEmpty) {
    pixel.initiateCheckout(cart.lines.map((l) => l.productId), cart.subtotal, cart.count)
  }
})
</script>

<template>
  <section class="checkout">
    <header class="checkout__head">
      <p class="checkout__eyebrow">{{ payphone ? 'Paso 2 de 2' : 'Paso 1 de 2' }}</p>
      <h1 class="checkout__title">{{ payphone ? 'Paga tu pedido' : 'Finalizar compra' }}</h1>
    </header>

    <p v-if="cart.isEmpty && !payphone" class="checkout__empty">
      Tu carrito está vacío.
      <RouterLink to="/tienda" class="btn btn--primary">Ir a la tienda</RouterLink>
    </p>

    <div v-else class="checkout__layout">
      <Transition name="rise" mode="out-in">
      <!-- Fase 2: cajita de PayPhone -->
      <div v-if="payphone" class="pay">
        <p class="pay__order">
          Pedido <strong>{{ orderNumber }}</strong> creado. Completa el pago para confirmarlo.
        </p>
        <PayphoneBox :params="payphone" />
      </div>

      <!-- Fase 1: datos -->
      <form v-else class="form" @submit.prevent="submit">
        <fieldset class="form__group">
          <legend>Tus datos</legend>
          <label>Nombre completo <input v-model="form.customer.name" required autocomplete="name" /></label>
          <label>Correo <input v-model="form.customer.email" type="email" required autocomplete="email" /></label>
          <div class="form__row">
            <label>Celular <input v-model="form.customer.phone" type="tel" required autocomplete="tel" placeholder="0991234567" /></label>
            <label>Cédula <input v-model="form.customer.documentId" inputmode="numeric" placeholder="Opcional" /></label>
          </div>
        </fieldset>

        <fieldset class="form__group">
          <legend>Entrega</legend>
          <p v-if="loadingConfig" class="form__hint">Cargando opciones…</p>
          <div v-else class="methods">
            <button
              v-for="m in config?.shippingMethods ?? []"
              :key="m.key"
              type="button"
              class="methods__opt"
              :class="{ 'methods__opt--on': form.shipping.method === m.key }"
              @click="setMethod(m.key)"
            >
              <span>{{ m.label }}</span>
              <strong>{{ m.cost ? `$${m.cost.toFixed(2)}` : 'Gratis' }}</strong>
            </button>
          </div>
          <template v-if="needsAddress">
            <label>Dirección <input v-model="form.shipping.address" required autocomplete="street-address" /></label>
            <div class="form__row">
              <label>Ciudad <input v-model="form.shipping.city" required autocomplete="address-level2" /></label>
              <label>Referencia <input v-model="form.shipping.reference" placeholder="Opcional" /></label>
            </div>
          </template>
          <label>Notas para tu pedido <textarea v-model="form.shipping.notes" rows="2" placeholder="Opcional"></textarea></label>
        </fieldset>

        <p v-if="error" class="form__error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
        <p v-if="!loadingConfig && !payphoneReady" class="form__error">
          Los pagos con tarjeta no están disponibles ahora. Escríbenos por WhatsApp para completar tu compra.
        </p>

        <button class="btn btn--primary form__submit" :disabled="submitting || !payphoneReady">
          <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
          Continuar al pago
        </button>
      </form>
      </Transition>

      <CheckoutSummary
        :lines="cart.lines"
        :subtotal="cart.subtotal"
        :shipping-cost="shippingCost"
        :shipping-label="config?.shippingMethods.find((m) => m.key === form.shipping.method)?.label ?? ''"
        :tax="tax"
        :tax-rate="config?.taxRate ?? 0"
        :total="total"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.checkout {
  @include container(1000px);
  padding-block: $space-md $space-section;

  &__head {
    @include reveal;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
    margin-bottom: 1.2rem;
  }

  &__empty {
    @include flex(column, center, center, 1rem);
    padding-block: $space-lg;
    color: $ink-soft;
  }

  &__layout {
    @include flex(column, stretch, flex-start, 1.5rem);

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;
      gap: 2.5rem;

      > :first-child {
        flex: 1 1 60%;
      }

      > :last-child {
        flex: 1 1 40%;
        position: sticky;
        top: 80px;
      }
    }
  }
}

.form {
  @include flex(column, stretch, flex-start, 1.2rem);

  &__group {
    border: none;
    @include flex(column, stretch, flex-start, 0.8rem);

    legend {
      @include display($text-lg, 600);
      margin-bottom: 0.6rem;
    }
  }

  &__row {
    @include flex(column, stretch, flex-start, 0.8rem);

    @include from('sm') {
      flex-direction: row;

      > * {
        flex: 1;
      }
    }
  }

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__error {
    color: $danger;
    font-size: $text-sm;
    @include flex(row, center, flex-start, 0.5rem);
  }

  &__submit {
    width: 100%;
    padding-block: 1rem;
  }
}

.methods {
  @include flex(column, stretch, flex-start, 0.5rem);

  &__opt {
    @include flex(row, center, space-between, 0.8rem);
    text-align: left;
    padding: 0.8rem 1rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    font-size: $text-sm;
    @include transition;
    @include press;

    &--on {
      border-color: $accent;
      background: $accent-soft;
    }

    strong {
      color: $accent-deep;
      white-space: nowrap;
    }
  }
}

.pay {
  @include flex(column, stretch, flex-start, 1rem);

  &__order {
    @include card;
    padding: 0.9rem 1rem;
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
