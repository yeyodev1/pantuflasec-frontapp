<script setup lang="ts">
import { useRoute } from 'vue-router'
import { site, whatsappLink } from '@/config/site'

/** Botón flotante de WhatsApp en toda la tienda; se esconde en el admin y el checkout. */
const route = useRoute()
const hidden = () => route.path.startsWith('/admin') || route.path.startsWith('/checkout')
</script>

<template>
  <Transition name="pop">
    <a
      v-if="site.whatsapp && !hidden()"
      :href="whatsappLink()"
      class="wa"
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
    >
      <i class="fa-brands fa-whatsapp"></i>
      <span class="wa__label">{{ site.whatsappDisplay }}</span>
    </a>
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
