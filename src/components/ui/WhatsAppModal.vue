<script setup lang="ts">
import { useWhatsApp } from '@/composables/useWhatsApp'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { site } from '@/config/site'

const { open, title, message, go, close } = useWhatsApp()
useBodyScroll(open)
</script>

<template>
  <Teleport to="body">
    <Transition name="wamodal">
      <div v-if="open" class="wam" @click.self="close">
        <div class="wam__box" role="dialog" aria-modal="true" :aria-label="title">
          <header class="wam__head">
            <span class="wam__avatar"><i class="fa-brands fa-whatsapp"></i></span>
            <div>
              <h3 class="wam__title">{{ title }}</h3>
              <p class="wam__to">Pantuflas Ecuador · {{ site.whatsappDisplay }}</p>
            </div>
            <button class="wam__close" aria-label="Cerrar" @click="close"><i class="fa-solid fa-xmark"></i></button>
          </header>

          <div class="wam__chat">
            <p class="wam__bubble">{{ message }}</p>
          </div>

          <p class="wam__note">
            <i class="fa-solid fa-circle-info"></i>
            No modifiques el mensaje por defecto para que te atendamos más rápido.
          </p>

          <div class="wam__actions">
            <button class="btn btn--ghost" @click="close">Cancelar</button>
            <button class="btn wam__go" @click="go"><i class="fa-brands fa-whatsapp"></i> Abrir WhatsApp</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.wam {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: $overlay;
  @include flex(column, center, flex-end);

  @include from('sm') {
    justify-content: center;
    padding: 1rem;
  }

  &__box {
    width: 100%;
    max-width: 460px;
    background: $paper;
    border-radius: $radius-md $radius-md 0 0;
    box-shadow: $shadow-lg;
    padding-bottom: env(safe-area-inset-bottom);
    @include flex(column, stretch, flex-start);

    @include from('sm') {
      border-radius: $radius-md;
    }
  }

  &__head {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 1rem 1.1rem;
    border-bottom: 1px solid $line;
  }

  &__avatar {
    flex: 0 0 2.6rem;
    height: 2.6rem;
    border-radius: $radius-pill;
    background: #25d366;
    color: #fff;
    font-size: 1.4rem;
    @include flex(row, center, center);
  }

  &__title {
    @include display($text-lg, 600);
  }

  &__to {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__close {
    margin-left: auto;
    width: 2.2rem;
    height: 2.2rem;
    font-size: 1.1rem;
    color: $ink-muted;
  }

  // Fondo tipo chat: el mensaje se ve como saldrá en WhatsApp.
  &__chat {
    background: #e5ddd5;
    padding: 1rem 1.1rem;
    max-height: 42vh;
    overflow-y: auto;
  }

  &__bubble {
    background: #dcf8c6;
    border-radius: 12px 12px 2px 12px;
    padding: 0.7rem 0.85rem;
    font-size: $text-sm;
    line-height: 1.5;
    white-space: pre-line;
    color: #111;
    margin-left: 1.5rem;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
  }

  &__note {
    @include flex(row, flex-start, flex-start, 0.5rem);
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-soft;
    padding: 0.8rem 1.1rem 0;

    i {
      color: $accent;
      margin-top: 0.15rem;
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
    padding: 0.9rem 1.1rem 1.1rem;

    .btn {
      flex: 1;
    }
  }

  &__go {
    background: #25d366;
    color: #fff;

    &:hover {
      background: #1ebe5b;
    }
  }
}

.wamodal-enter-active,
.wamodal-leave-active {
  transition: opacity 0.25s ease;

  .wam__box {
    transition: transform 0.35s $ease;
  }
}
.wamodal-enter-from,
.wamodal-leave-to {
  opacity: 0;

  .wam__box {
    transform: translateY(24px);
  }
}
</style>
