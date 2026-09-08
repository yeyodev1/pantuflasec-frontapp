<script setup lang="ts">
import { useRoute } from 'vue-router'
import { site } from '@/config/site'
import { useWhatsApp } from '@/composables/useWhatsApp'

/** Botón flotante de WhatsApp en toda la tienda; se esconde en el admin y el checkout. */
const route = useRoute()
const { ask } = useWhatsApp()
const hidden = () => route.path.startsWith('/admin')
</script>

<template>
  <Transition name="pop">
    <button
      v-if="site.whatsapp && !hidden()"
      type="button"
      class="wa"
      aria-label="Escríbenos por WhatsApp"
      @click="ask()"
    >
      <i class="fa-brands fa-whatsapp"></i>
      <span class="wa__label">{{ site.whatsappDisplay }}</span>
    </button>
  </Transition>
</template>

<style scoped lang="scss">
.wa {
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 85;
  @include flex(row, center, center, 0.5rem);
  height: 3.2rem;
  padding: 0 1rem;
  border-radius: $radius-pill;
  background: #25d366;
  color: #fff;
  font-weight: 700;
  font-size: $text-sm;
  box-shadow: 0 10px 28px rgba(#25d366, 0.4);
  @include transition;
  @include press;

  i {
    font-size: 1.5rem;
  }

  &__label {
    display: none;

    @include from('md') {
      display: inline;
    }
  }

  @include from('md') {
    right: 1.5rem;
    bottom: 1.5rem;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 34px rgba(#25d366, 0.5);
    }
  }
}

.pop-enter-active,
.pop-leave-active {
  transition: transform 0.35s $ease, opacity 0.3s ease;
}
.pop-enter-from,
.pop-leave-to {
  transform: scale(0.6);
  opacity: 0;
}
</style>
