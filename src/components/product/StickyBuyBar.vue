<script setup lang="ts">
import { formatMoney } from '@/utils/format'

/** Barra fija abajo en móvil: precio + comprar siempre a la mano. */
defineProps<{ name: string; price: number; canBuy: boolean; visible: boolean }>()
const emit = defineEmits<{ add: [] }>()
</script>

<template>
  <Transition name="slide-up">
    <div v-if="visible" class="bar">
      <div class="bar__info">
        <strong>{{ formatMoney(price) }}</strong>
        <small>{{ name }}</small>
      </div>
      <button class="btn btn--primary bar__btn" :disabled="!canBuy" @click="emit('add')">
        <i class="fa-solid fa-bag-shopping"></i> {{ canBuy ? 'Agregar' : 'Agotado' }}
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.bar {
  position: fixed;
  inset: auto 0 0;
  z-index: 80;
  @include flex(row, center, space-between, 0.8rem);
  padding: 0.7rem 1.25rem calc(0.7rem + env(safe-area-inset-bottom));
  background: rgba($paper, 0.96);
  backdrop-filter: blur(10px);
  border-top: 1px solid $line;
  box-shadow: 0 -8px 24px rgba($ink, 0.06);

  @include from('md') {
    display: none;
  }

  &__info {
    @include flex(column, flex-start, center);
    min-width: 0;

    strong {
      font-size: $text-lg;
      color: $price;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 45vw;
    }
  }

  &__btn {
    padding: 0.8rem 1.4rem;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s $ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
