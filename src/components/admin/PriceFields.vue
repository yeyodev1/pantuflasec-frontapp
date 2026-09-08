<script setup lang="ts">
import { ref, watch } from 'vue'
import { netOfPrice, priceWithFee } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'

/**
 * Dos precios ligados: lo que el negocio quiere recibir y lo que ve el
 * cliente (con la comisión de PayPhone dentro). Se guarda el del cliente;
 * escribir cualquiera de los dos recalcula el otro.
 */
const props = defineProps<{ modelValue: number; label?: string; placeholder?: string; required?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [price: number] }>()

const net = ref<string>(props.modelValue > 0 ? String(netOfPrice(props.modelValue)) : '')
const price = ref<string>(props.modelValue > 0 ? String(props.modelValue) : '')

// Cambios desde afuera (cargar el producto) refrescan ambos sin disparar el recálculo cruzado.
watch(
  () => props.modelValue,
  (v) => {
    if (Number(price.value) === v) return
    price.value = v > 0 ? String(v) : ''
    net.value = v > 0 ? String(netOfPrice(v)) : ''
  },
)

function fromNet(e: Event) {
  net.value = (e.target as HTMLInputElement).value
  const p = priceWithFee(Number(net.value))
  price.value = p ? String(p) : ''
  emit('update:modelValue', p)
}

function fromPrice(e: Event) {
  price.value = (e.target as HTMLInputElement).value
  const p = Number(price.value)
  net.value = p > 0 ? String(netOfPrice(p)) : ''
  emit('update:modelValue', Number.isFinite(p) ? p : 0)
}
</script>

<template>
  <div class="prices">
    <label class="prices__field prices__field--net">
      <span><i class="fa-solid fa-hand-holding-dollar"></i> {{ label ? `${label}: lo que recibes` : 'Lo que recibes' }}</span>
      <input :value="net" type="number" step="0.01" min="0" :placeholder="placeholder ?? '15.00'" :required="required" @input="fromNet" />
    </label>
    <span class="prices__eq"><i class="fa-solid fa-arrow-right-arrow-left"></i></span>
    <label class="prices__field prices__field--public">
      <span><i class="fa-solid fa-tag"></i> Precio que ve el cliente</span>
      <input :value="price" type="number" step="0.01" min="0" :placeholder="placeholder ? String(priceWithFee(Number(placeholder))) : '15.95'" :required="required" @input="fromPrice" />
    </label>
    <p class="prices__hint">
      <template v-if="Number(price) > 0">
        En la tienda se muestra <strong>{{ formatMoney(Number(price)) }}</strong> con IVA incluido. Con tarjeta (PayPhone descuenta 5,75 %) recibes
        <strong>{{ formatMoney(netOfPrice(Number(price))) }}</strong>; con transferencia o efectivo recibes los {{ formatMoney(Number(price)) }} completos.
      </template>
      <template v-else>Escribe lo que quieres recibir y calculamos el precio para el cliente (o al revés).</template>
    </p>
  </div>
</template>

<style scoped lang="scss">
.prices {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.6rem;
  padding: 0.8rem 0.9rem;
  border-radius: $radius-sm;
  background: $sand;

  &__field {
    flex: 1 1 10rem;
    margin: 0;

    span {
      display: block;
      margin-bottom: 0.35rem;
      font-size: $text-xs;
      font-weight: 600;

      i {
        margin-right: 0.25rem;
      }
    }

    &--net span {
      color: $success;
    }

    &--public span {
      color: $accent-deep;
    }

    &--public input {
      font-weight: 700;
      color: $price;
    }
  }

  &__eq {
    flex: 0 0 auto;
    padding-bottom: 0.8rem;
    color: $ink-muted;
    font-size: 0.8rem;
  }

  &__hint {
    flex: 1 1 100%;
    font-size: $text-xs;
    color: $ink-soft;
    line-height: 1.4;
  }
}
</style>
