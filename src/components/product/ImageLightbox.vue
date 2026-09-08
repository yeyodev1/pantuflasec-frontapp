<script setup lang="ts">
import { onMounted, onUnmounted, toRef, watch } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'

/** Visor a pantalla completa con flechas, teclado y deslizamiento. */
const props = defineProps<{ open: boolean; images: string[]; index: number; alt: string }>()
const emit = defineEmits<{ close: []; 'update:index': [i: number] }>()

useBodyScroll(toRef(props, 'open'))

const go = (d: number) => emit('update:index', (props.index + d + props.images.length) % props.images.length)

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}

let startX = 0
const onTouchStart = (e: TouchEvent) => (startX = e.touches[0]?.clientX ?? 0)
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - startX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
watch(() => props.open, (o) => o && (startX = 0))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="lb" role="dialog" aria-modal="true" :aria-label="alt" @click.self="emit('close')">
        <button class="lb__close" aria-label="Cerrar" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>

        <button v-if="images.length > 1" class="lb__nav lb__nav--prev" aria-label="Anterior" @click="go(-1)"><i class="fa-solid fa-chevron-left"></i></button>
        <Transition name="fade" mode="out-in">
          <img :key="images[index]" :src="images[index]" :alt="alt" class="lb__img" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd" />
        </Transition>
        <button v-if="images.length > 1" class="lb__nav lb__nav--next" aria-label="Siguiente" @click="go(1)"><i class="fa-solid fa-chevron-right"></i></button>

        <div v-if="images.length > 1" class="lb__dots">
          <button v-for="(_, i) in images" :key="i" :class="['lb__dot', { 'lb__dot--on': i === index }]" :aria-label="`Foto ${i + 1}`" @click="emit('update:index', i)"></button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.lb {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba($ink, 0.96);
  @include flex(column, center, center);
  padding: 1rem;

  &__img {
    max-width: min(100%, 1100px);
    max-height: 85vh;
    object-fit: contain;
    border-radius: $radius-sm;
    box-shadow: $shadow-lg;
  }

  &__close,
  &__nav {
    position: absolute;
    width: 2.8rem;
    height: 2.8rem;
    border-radius: $radius-pill;
    background: rgba($paper, 0.12);
    color: $paper;
    font-size: 1.2rem;
    @include flex(row, center, center);
    @include press;

    &:hover {
      background: $highlight;
      color: $ink;
    }
  }

  &__close {
    top: calc(1rem + env(safe-area-inset-top));
    right: 1rem;
  }

  &__nav {
    top: 50%;
    transform: translateY(-50%);

    &--prev {
      left: 0.6rem;
    }

    &--next {
      right: 0.6rem;
    }

    @include from('md') {
      &--prev {
        left: 2rem;
      }

      &--next {
        right: 2rem;
      }
    }
  }

  &__dots {
    position: absolute;
    bottom: calc(1.2rem + env(safe-area-inset-bottom));
    @include flex(row, center, center, 0.4rem);
  }

  &__dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: $radius-pill;
    background: rgba($paper, 0.35);
    transition: background 0.2s ease, transform 0.2s ease;

    &--on {
      background: $highlight;
      transform: scale(1.3);
    }
  }
}
</style>
