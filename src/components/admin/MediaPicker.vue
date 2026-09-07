<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { useMediaLibrary } from '@/composables/useMediaLibrary'
import MediaGrid from './MediaGrid.vue'
import type { MediaItem } from '@/services/upload.service'

/** Modal para elegir fotos de la biblioteca de Cloudinary desde el editor de producto. */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ pick: [items: MediaItem[]]; close: [] }>()

useBodyScroll(toRef(props, 'open'))
const { items, cursor, loading, configured, load, copy } = useMediaLibrary()
const selected = ref(new Set<string>())

watch(() => props.open, (o) => o && (selected.value = new Set()))

function toggle(m: MediaItem) {
  const s = new Set(selected.value)
  s.has(m.publicId) ? s.delete(m.publicId) : s.add(m.publicId)
  selected.value = s
}

function confirm() {
  emit('pick', items.value.filter((m) => selected.value.has(m.publicId)))
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="picker" @click.self="emit('close')">
        <div class="picker__box" role="dialog" aria-modal="true" aria-label="Biblioteca de imágenes">
          <header class="picker__head">
            <h3>Biblioteca</h3>
            <button type="button" aria-label="Cerrar" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
          </header>
          <div class="picker__body">
            <p v-if="configured === false" class="picker__warn">Cloudinary no está configurado.</p>
            <MediaGrid :items="items" selectable :selected="selected" @pick="toggle" @copy="copy" />
            <button v-if="cursor" type="button" class="btn btn--ghost" :disabled="loading" @click="load(false)">Cargar más</button>
          </div>
          <footer class="picker__foot">
            <span>{{ selected.size }} seleccionadas</span>
            <button type="button" class="btn btn--primary" :disabled="!selected.size" @click="confirm">Agregar</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.picker {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: $overlay;
  @include flex(column, center, flex-end);

  @include from('sm') {
    justify-content: center;
    padding: 1rem;
  }

  &__box {
    width: 100%;
    max-width: 900px;
    max-height: 92vh;
    background: $paper;
    border-radius: $radius-md $radius-md 0 0;
    @include flex(column, stretch, flex-start);
    box-shadow: $shadow-lg;

    @include from('sm') {
      border-radius: $radius-md;
    }
  }

  &__head {
    @include flex(row, center, space-between);
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid $line;

    h3 {
      @include display($text-lg, 600);
    }

    button {
      width: 2.2rem;
      height: 2.2rem;
      font-size: 1.1rem;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.1rem;
    @include flex(column, stretch, flex-start, 0.8rem);
  }

  &__warn {
    color: $warning;
    font-size: $text-sm;
  }

  &__foot {
    @include flex(row, center, space-between);
    padding: 0.8rem 1.1rem calc(0.8rem + env(safe-area-inset-bottom));
    border-top: 1px solid $line;
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
