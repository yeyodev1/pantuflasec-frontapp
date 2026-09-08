<script setup lang="ts">
import FormField from './FormField.vue'
import PhoneField from '@/components/ui/PhoneField.vue'
import type { CheckoutInput } from '@/types'

/** ¿Quiere factura? Con los mismos datos o con RUC/cédula y nombre propios. */
defineProps<{ billing: NonNullable<CheckoutInput['billing']>; customerDocument: string }>()
</script>

<template>
  <section class="card" style="--i: 2">
    <h2 class="card__title"><span>4</span> Factura</h2>

    <div class="toggle" role="group" aria-label="¿Quieres factura?">
      <button
        type="button"
        class="toggle__opt"
        :class="{ 'toggle__opt--on': !billing.wanted }"
        @click="billing.wanted = false"
      >
        <i class="fa-solid fa-receipt"></i> Sin factura
      </button>
      <button
        type="button"
        class="toggle__opt"
        :class="{ 'toggle__opt--on': billing.wanted }"
        @click="billing.wanted = true"
      >
        <i class="fa-solid fa-file-invoice"></i> Quiero factura
      </button>
    </div>

    <Transition name="rise">
      <div v-if="billing.wanted" class="billing">
        <label class="check">
          <input v-model="billing.sameAsCustomer" type="checkbox" />
          Usar mis mismos datos
        </label>

        <p v-if="billing.sameAsCustomer && !customerDocument" class="billing__warn">
          <i class="fa-solid fa-circle-info"></i> Escribe tu cédula arriba, en tus datos, para poder
          facturar.
        </p>

        <div v-if="!billing.sameAsCustomer" class="billing__fields">
          <FormField
            label="RUC o cédula"
            icon="fa-solid fa-id-card"
            hint="10 dígitos para cédula, 13 para RUC."
          >
            <input
              v-model="billing.documentId"
              inputmode="numeric"
              required
              maxlength="13"
              placeholder="0992345678001"
            />
          </FormField>
          <FormField label="Nombre y apellido o razón social" icon="fa-solid fa-user">
            <input v-model="billing.name" required placeholder="Como debe salir en la factura" />
          </FormField>
          <div class="billing__row">
            <FormField label="Correo" icon="fa-solid fa-envelope">
              <input
                v-model="billing.email"
                type="email"
                required
                placeholder="facturas@empresa.com"
              />
            </FormField>
            <FormField label="Celular" icon="fa-solid fa-mobile-screen" optional>
              <PhoneField v-model="billing.phone" />
            </FormField>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped lang="scss">
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

.toggle {
  @include flex(row, stretch, flex-start, 0.5rem);

  &__opt {
    flex: 1;
    @include flex(row, center, center, 0.5rem);
    padding: 0.8rem 0.6rem;
    border: 1.5px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-soft;
    @include transition;
    @include press;

    i {
      color: $ink-muted;
    }

    &--on {
      border-color: $accent;
      background: $accent-soft;
      color: $accent-deep;

      i {
        color: $accent;
      }
    }
  }
}

.billing {
  @include flex(column, stretch, flex-start, 0.9rem);

  &__fields {
    @include flex(column, stretch, flex-start, 0.9rem);
  }

  &__row {
    @include flex(column, stretch, flex-start, 0.9rem);

    @include from('sm') {
      flex-direction: row;

      > * {
        flex: 1;
      }
    }
  }

  &__warn {
    @include flex(row, flex-start, flex-start, 0.5rem);
    font-size: $text-xs;
    color: $warning;
    font-weight: 600;
  }
}

.check {
  @include flex(row, center, flex-start, 0.5rem);
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;

  input {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: $accent;
  }
}
</style>
