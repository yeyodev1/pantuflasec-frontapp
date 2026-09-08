<script setup lang="ts">
import { onMounted } from 'vue'
import { useCheckout } from '@/composables/useCheckout'
import CheckoutSummary from '@/components/checkout/CheckoutSummary.vue'
import PayphoneBox from '@/components/checkout/PayphoneBox.vue'
import FormField from '@/components/checkout/FormField.vue'
import ShippingOptions from '@/components/checkout/ShippingOptions.vue'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import PhoneField from '@/components/ui/PhoneField.vue'
import BillingSection from '@/components/checkout/BillingSection.vue'
import { formatMoney } from '@/utils/format'
import { pixel } from '@/utils/pixel'
import { useWhatsApp } from '@/composables/useWhatsApp'

const {
  cart, config, loadingConfig, submitting, error, form, payphone, orderNumber,
  shippingCost, tax, total, needsAddress, payphoneReady, setMethod, submit,
} = useCheckout()
const wa = useWhatsApp()

onMounted(() => {
  if (!cart.isEmpty) {
    pixel.initiateCheckout(cart.lines.map((l) => l.productId), cart.subtotal, cart.count)
  }
})
</script>

<template>
  <section class="checkout">
    <header class="checkout__head">
      <CheckoutSteps :paying="Boolean(payphone)" />
      <h1 class="checkout__title">{{ payphone ? 'Paga tu pedido' : 'Finalizar compra' }}</h1>
    </header>

    <p v-if="cart.isEmpty && !payphone" class="checkout__empty">
      <i class="fa-solid fa-bag-shopping"></i>
      Tu carrito está vacío.
      <RouterLink to="/tienda" class="btn btn--primary">Ir a la tienda</RouterLink>
    </p>

    <div v-else class="checkout__layout">
      <CheckoutSummary
        class="checkout__summary"
        :lines="cart.lines"
        :subtotal="cart.subtotal"
        :shipping-cost="shippingCost"
        :shipping-label="config?.shippingMethods.find((m) => m.key === form.shipping.method)?.label ?? ''"
        :tax="tax"
        :tax-rate="config?.taxRate ?? 0"
        :total="total"
      />

      <Transition name="rise" mode="out-in">
        <div v-if="payphone" class="pay">
          <p class="pay__order">
            <i class="fa-solid fa-circle-check"></i>
            Pedido <strong>{{ orderNumber }}</strong> creado. Completa el pago para confirmarlo.
          </p>
          <PayphoneBox :params="payphone" />
        </div>

        <form v-else class="form" @submit.prevent="submit">
          <section class="card" style="--i: 0">
            <h2 class="card__title"><span>1</span> Tus datos</h2>
            <FormField label="Nombre completo" icon="fa-solid fa-user">
              <input v-model="form.customer.name" required autocomplete="name" placeholder="Como aparece en tu cédula" />
            </FormField>
            <FormField label="Correo" icon="fa-solid fa-envelope" hint="Te enviamos la confirmación aquí.">
              <input v-model="form.customer.email" type="email" required autocomplete="email" placeholder="tu@correo.com" />
            </FormField>
            <div class="form__row">
              <FormField label="Celular" icon="fa-solid fa-mobile-screen" hint="Te escribimos por WhatsApp a este número.">
                <PhoneField v-model="form.customer.phone" required />
              </FormField>
              <FormField label="Cédula" icon="fa-solid fa-id-card" optional>
                <input v-model="form.customer.documentId" inputmode="numeric" placeholder="Para la factura" />
              </FormField>
            </div>
          </section>

          <section class="card" style="--i: 1">
            <h2 class="card__title"><span>2</span> Entrega</h2>
            <ShippingOptions
              :methods="config?.shippingMethods ?? []"
              :value="form.shipping.method"
              :loading="loadingConfig"
              @change="setMethod"
            />
            <Transition name="rise">
              <div v-if="needsAddress" class="form__address">
                <FormField label="Dirección" icon="fa-solid fa-location-dot">
                  <input v-model="form.shipping.address" required autocomplete="street-address" placeholder="Calle, número y sector" />
                </FormField>
                <div class="form__row">
                  <FormField label="Ciudad" icon="fa-solid fa-city">
                    <input v-model="form.shipping.city" required autocomplete="address-level2" />
                  </FormField>
                  <FormField label="Referencia" icon="fa-solid fa-map-pin" optional>
                    <input v-model="form.shipping.reference" placeholder="Edificio, piso, punto cercano" />
                  </FormField>
                </div>
              </div>
            </Transition>
            <FormField label="Notas para tu pedido" icon="fa-solid fa-pen" optional>
              <textarea v-model="form.shipping.notes" rows="2" placeholder="Dedicatoria, color preferido, hora de entrega…"></textarea>
            </FormField>
          </section>

          <BillingSection v-if="form.billing" :billing="form.billing" :customer-document="form.customer.documentId" />

          <p v-if="error" class="form__error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
          <p v-if="!loadingConfig && !payphoneReady" class="form__error">
            Los pagos con tarjeta no están disponibles ahora. Escríbenos por WhatsApp para completar tu compra.
          </p>

          <button class="btn btn--primary form__submit" :disabled="submitting || !payphoneReady">
            <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-lock"></i>
            Continuar al pago
            <span class="form__total">{{ formatMoney(total) }}</span>
          </button>
          <p class="form__safe"><i class="fa-brands fa-cc-visa"></i> <i class="fa-brands fa-cc-mastercard"></i> Pago seguro con PayPhone</p>

          <button type="button" class="btn btn--ghost form__wa" @click="wa.checkout()">
            <i class="fa-brands fa-whatsapp"></i> Prefiero terminar la compra por WhatsApp
          </button>
        </form>
      </Transition>
    </div>
  </section>
</template>

<style scoped lang="scss">
.checkout {
  @include container(1040px);
  padding-block: $space-md $space-section;

  &__head {
    @include reveal;
    margin-bottom: 1.2rem;
  }

  &__title {
    @include display($display-sm);
  }

  &__empty {
    @include flex(column, center, center, 1rem);
    padding-block: $space-lg;
    color: $ink-soft;

    i {
      font-size: 2rem;
      color: $ink-muted;
    }
  }

  &__layout {
    @include flex(column, stretch, flex-start, 1rem);

    @include from('md') {
      flex-direction: row-reverse;
      align-items: flex-start;
      gap: 2.5rem;

      > :last-child {
        flex: 1 1 60%;
      }

      > :first-child {
        flex: 1 1 40%;
        position: sticky;
        top: 80px;
      }
    }
  }
}


.form {
  @include flex(column, stretch, flex-start, 1rem);

  &__row {
    @include flex(column, stretch, flex-start, 0.9rem);

    @include from('sm') {
      flex-direction: row;

      > * {
        flex: 1;
      }
    }
  }

  &__address {
    @include flex(column, stretch, flex-start, 0.9rem);
    padding-top: 0.2rem;
  }

  &__error {
    color: $danger;
    font-size: $text-sm;
    @include flex(row, center, flex-start, 0.5rem);
    padding: 0.7rem 0.9rem;
    background: $danger-bg;
    border-radius: $radius-sm;
  }

  &__submit {
    width: 100%;
    padding-block: 1.05rem;
    font-size: 0.95rem;
    gap: 0.6rem;
  }

  &__total {
    margin-left: auto;
    padding-left: 0.8rem;
    border-left: 1px solid rgba($surface, 0.35);
  }

  &__wa {
    width: 100%;
    border-color: #25d366;
    color: #128c7e;

    &:hover {
      background: #25d366;
      color: #fff;
    }
  }

  &__safe {
    text-align: center;
    font-size: $text-xs;
    color: $ink-muted;

    i {
      font-size: 1.1rem;
      vertical-align: middle;
    }
  }
}

.card {
  @include card;
  padding: 1.1rem 1rem 1.2rem;
  @include flex(column, stretch, flex-start, 0.9rem);
  @include reveal;

  @include from('sm') {
    padding: 1.4rem 1.3rem;
  }

  &__title {
    @include display($text-lg, 600);
    @include flex(row, center, flex-start, 0.6rem);
    margin-bottom: 0.2rem;

    span {
      width: 1.7rem;
      height: 1.7rem;
      border-radius: $radius-pill;
      background: $accent-soft;
      color: $accent-deep;
      font-family: $font-principal;
      font-size: 0.8rem;
      font-weight: 700;
      @include flex(row, center, center);
    }
  }
}

.pay {
  @include flex(column, stretch, flex-start, 1rem);

  &__order {
    @include card;
    @include flex(row, center, flex-start, 0.6rem);
    padding: 0.9rem 1rem;
    font-size: $text-sm;
    color: $ink-soft;

    i {
      color: $success;
    }
  }
}
</style>
