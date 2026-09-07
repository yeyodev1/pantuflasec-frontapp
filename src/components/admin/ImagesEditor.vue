<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { uploadService } from '@/services/upload.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, ProductImage } from '@/types'
import MediaPicker from './MediaPicker.vue'
import type { MediaItem } from '@/services/upload.service'

const props = defineProps<{ images: ProductImage[] }>()
const toast = useToastStore()
const canUpload = ref(false)
const uploading = ref(false)
const url = ref('')
const pickerOpen = ref(false)

function fromLibrary(items: MediaItem[]) {
  for (const m of items) {
    if (!props.images.some((i) => i.url === m.url)) props.images.push({ url: m.url, publicId: m.publicId })
  }
  pickerOpen.value = false
}

onMounted(async () => {
  try {
    canUpload.value = (await uploadService.status()).cloudinary
  } catch {
    canUpload.value = false
  }
})

async function onFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  uploading.value = true
  try {
    for (const file of files) {
      const img = await uploadService.image(file)
      props.images.push(img)
    }
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    uploading.value = false
    ;(event.target as HTMLInputElement).value = ''
  }
}

function addUrl() {
  const clean = url.value.trim()
  if (!clean) return
  props.images.push({ url: clean, publicId: '' })
  url.value = ''
}

function move(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= props.images.length) return
  const [item] = props.images.splice(i, 1)
  props.images.splice(j, 0, item!)
}
</script>

<template>
  <fieldset class="images">
    <legend>Fotos</legend>
    <div class="images__grid">
      <figure v-for="(img, i) in images" :key="img.url" class="images__item">
        <img :src="img.url" :alt="''" />
        <figcaption>
          <button type="button" aria-label="Mover antes" @click="move(i, -1)"><i class="fa-solid fa-chevron-left"></i></button>
          <button type="button" aria-label="Quitar" @click="images.splice(i, 1)"><i class="fa-solid fa-trash"></i></button>
          <button type="button" aria-label="Mover después" @click="move(i, 1)"><i class="fa-solid fa-chevron-right"></i></button>
        </figcaption>
      </figure>
    </div>

    <div v-if="canUpload" class="images__actions">
      <label class="btn btn--ghost images__upload">
        <i :class="uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'"></i>
        {{ uploading ? 'Subiendo…' : 'Subir fotos' }}
        <input type="file" accept="image/*" multiple hidden :disabled="uploading" @change="onFiles" />
      </label>
      <button type="button" class="btn btn--ghost" @click="pickerOpen = true">
        <i class="fa-solid fa-images"></i> Elegir de la biblioteca
      </button>
    </div>
    <p v-else class="images__hint">
      Cloudinary no está configurado en el servidor: no se pueden subir fotos. Como salida temporal puedes pegar una URL.
    </p>

    <div v-if="!canUpload" class="images__url">
      <input v-model="url" type="url" placeholder="https://…/foto.jpg" @keydown.enter.prevent="addUrl" />
      <button type="button" class="btn btn--ghost" @click="addUrl">Agregar URL</button>
    </div>

    <MediaPicker :open="pickerOpen" @pick="fromLibrary" @close="pickerOpen = false" />
  </fieldset>
</template>

<style scoped lang="scss">
.images {
  border: none;
  @include flex(column, stretch, flex-start, 0.7rem);

  legend {
    @include display($text-lg, 600);
    margin-bottom: 0.4rem;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  &__item {
    flex: 0 0 calc(33.333% - 0.4rem);
    aspect-ratio: 1;
    position: relative;
    border-radius: $radius-sm;
    overflow: hidden;
    background: $sand;

    @include from('md') {
      flex-basis: 8rem;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    figcaption {
      position: absolute;
      inset: auto 0 0;
      @include flex(row, center, space-between);
      background: rgba($ink, 0.55);

      button {
        color: $paper;
        width: 2rem;
        height: 1.9rem;
        font-size: 0.75rem;
      }
    }
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__upload {
    cursor: pointer;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__url {
    @include flex(row, stretch, flex-start, 0.5rem);

    input {
      flex: 1;
    }
  }
}
</style>
