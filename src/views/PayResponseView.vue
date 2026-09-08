<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@/services/order.service'
import { useCartStore } from '@/stores/cart'
import type { ApiError } from '@/types'
import { pixel } from '@/utils/pixel'
import { rememberOrder } from '@/utils/myOrders'

/**
 * PayPhone vuelve aquí con ?id=&clientTransactionId=. Se confirma con el
 * backend de inmediato: si pasan 5 minutos sin confirmar, PayPhone reversa.
 */
const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const error = ref('')
const cancelled = ref(false)

onMounted(async () => {
  const id = Number(route.query.id)
  const token = String(route.query.clientTransactionId ?? '')
  if (!id || !token) {
    error.value = 'Falta información del pago. Si ya pagaste, escríbenos por WhatsApp.'
    return
  }
  try {
    const order = await orderService.confirm(id, token)
    if (order.payment.status === 'paid') {
      pixel.purchase(
        order.number,
        order.items.map((i) => i.productId),
        order.total,
        order.items.reduce((n, i) => n + i.qty, 0),
      )
      rememberOrder({ token, number: order.number, total: order.total, createdAt: order.createdAt })
      cart.clear()
      router.replace({ name: 'Order', params: { code: token }, query: { nuevo: '1' } })
    } else {
      cancelled.value = true
    }
  } catch (e) {
    error.value = (e as ApiError).message
  }
})
</script>

<template>
  <section class="pay">
    <template v-if="cancelled">
      <i class="fa-regular fa-circle-xmark pay__icon pay__icon--warn"></i>
      <h1 class="pay__title">El pago no se completó</h1>
      <p class="pay__text">Tu carrito sigue intacto. Puedes intentar de nuevo cuando quieras.</p>
      <RouterLink to="/checkout" class="btn btn--primary">Volver a intentar</RouterLink>
    </template>
    <template v-else-if="error">
      <i class="fa-solid fa-triangle-exclamation pay__icon pay__icon--warn"></i>
      <h1 class="pay__title">No pudimos confirmar el pago</h1>
      <p class="pay__text">{{ error }}</p>
      <RouterLink to="/tienda" class="btn btn--ghost">Ir a la tienda</RouterLink>
    </template>
    <template v-else>
      <i class="fa-solid fa-spinner fa-spin pay__icon"></i>
      <h1 class="pay__title">Confirmando tu pago…</h1>
      <p class="pay__text">No cierres esta página.</p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.pay {
  @include container(560px);
  @include flex(column, center, center, 0.8rem);
  text-align: center;
  padding-block: $space-section;
  @include reveal;

  &__icon {
    font-size: 2.6rem;
    color: $accent;

    &--warn {
      color: $warning;
    }
  }

  &__title {
    @include display($display-sm);
  }

  &__text {
    color: $ink-soft;
  }
}
</style>
