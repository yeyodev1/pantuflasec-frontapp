<script setup lang="ts">
import { useAppVersion } from '@/composables/useAppVersion'
import { updateBanner } from '@/config/site'

const { updateAvailable, reload } = useAppVersion()
</script>

<template>
  <Teleport to="body">
    <Transition name="update">
      <div v-if="updateAvailable" class="update" role="status" aria-live="polite">
        <i class="fa-solid fa-rotate"></i>
        <div class="update__text">
          <strong>{{ updateBanner.title }}</strong>
          <span>{{ updateBanner.body }}</span>
        </div>
        <button type="button" class="update__btn" @click="reload">
          {{ updateBanner.action }}
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.update {
  // Abajo y a todo el ancho en móvil, por encima del botón de WhatsApp.
  position: fixed;
  left: 0.9rem;
  right: 0.9rem;
  bottom: calc(0.9rem + env(safe-area-inset-bottom));
  z-index: 320;
  @include flex(row, center, flex-start, 0.8rem);
  flex-wrap: wrap;
  background: $ink;
  color: $paper;
  padding: 0.9rem 1rem;
  border-radius: $radius-sm;
  box-shadow: $shadow-md;
  border-left: 4px solid $highlight;

  > i {
    color: $highlight;
    font-size: 1.1rem;
  }

  &__text {
    @include flex(column, flex-start, center, 0.1rem);
    flex: 1;
    min-width: 160px;
    font-size: $text-sm;

    span {
      color: rgba($paper, 0.75);
    }
  }

  &__btn {
    @include press;
    flex-shrink: 0;
    background: $highlight;
    color: $ink;
    font-weight: 700;
    font-size: $text-sm;
    padding: 0.6rem 1rem;
    border: 0;
    border-radius: $radius-sm;
    cursor: pointer;
    @include focus-ring($highlight);
  }

  @include from('md') {
    left: auto;
    right: 1.4rem;
    max-width: 420px;
  }
}

.update-enter-active,
.update-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s $ease;
}

.update-enter-from,
.update-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
