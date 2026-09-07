<script setup lang="ts">
import type { MediaItem } from '@/services/upload.service'

defineProps<{ items: MediaItem[]; selectable?: boolean; selected?: Set<string> }>()
const emit = defineEmits<{ pick: [item: MediaItem]; copy: [url: string]; remove: [item: MediaItem] }>()

const kb = (b: number) => (b ? `${Math.round(b / 1024)} KB` : '')
</script>

<template>
  <div class="grid">
    <figure
      v-for="(m, i) in items"
      :key="m.publicId"
      class="tile"
      :class="{ 'tile--on': selected?.has(m.publicId) }"
      :style="{ '--i': i % 12 }"
      @click="selectable && emit('pick', m)"
    >
      <img :src="m.url" :alt="''" loading="lazy" />
      <figcaption class="tile__bar">
        <span class="tile__meta">{{ m.format }} {{ kb(m.bytes) }}</span>
        <span class="tile__actions">
          <button type="button" title="Copiar URL" @click.stop="emit('copy', m.url)"><i class="fa-solid fa-link"></i></button>
          <button v-if="!selectable" type="button" title="Eliminar" @click.stop="emit('remove', m)"><i class="fa-solid fa-trash"></i></button>
          <i v-else-if="selected?.has(m.publicId)" class="fa-solid fa-circle-check tile__check"></i>
        </span>
      </figcaption>
    </figure>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;

  > * {
    flex: 1 1 calc(50% - 0.3rem);
    max-width: calc(50% - 0.3rem);
  }

  @include from('sm') {
    > * {
      flex-basis: calc(33.333% - 0.4rem);
      max-width: calc(33.333% - 0.4rem);
    }
  }

  @include from('md') {
    > * {
      flex-basis: calc(25% - 0.45rem);
      max-width: calc(25% - 0.45rem);
    }
  }

  @include from('lg') {
    > * {
      flex-basis: calc(16.666% - 0.5rem);
      max-width: calc(16.666% - 0.5rem);
    }
  }
}

.tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: $radius-sm;
  overflow: hidden;
  background: $sand;
  border: 2px solid transparent;
  cursor: pointer;
  @include reveal(0.4s, 0.03s);
  @include transition(border-color);

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--on {
    border-color: $accent;
  }

  &__bar {
    position: absolute;
    inset: auto 0 0;
    @include flex(row, center, space-between, 0.3rem);
    padding: 0.3rem 0.4rem;
    background: rgba($ink, 0.6);
    color: $paper;
    font-size: 0.62rem;
  }

  &__actions {
    @include flex(row, center, flex-end, 0.1rem);

    button {
      color: $paper;
      width: 1.7rem;
      height: 1.6rem;
      font-size: 0.7rem;

      &:hover {
        color: $accent-soft;
      }
    }
  }

  &__check {
    color: $accent-soft;
    font-size: 0.9rem;
  }
}
</style>
