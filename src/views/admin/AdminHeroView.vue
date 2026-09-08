<script setup lang="ts">
import { ref } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import MediaPicker from '@/components/admin/MediaPicker.vue'
import { useHeroSettings } from '@/composables/useAdminSettings'
import { useMediaLibrary } from '@/composables/useMediaLibrary'
import type { MediaItem } from '@/services/upload.service'

/**
 * Portada del home: una foto grande (por ejemplo la colección de flores
 * amarillas) con título y botón. Si está apagada, el home muestra el collage.
 */
const { hero, loading, saving, save } = useHeroSettings()
const { upload, uploading, items } = useMediaLibrary()
const picker = ref(false)

function pick(media: MediaItem[]) {
  const m = media[0]
  if (m) hero.image = { url: m.url, publicId: m.publicId }
  picker.value = false
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const before = items.value.length
  await upload([file], 'portada')
  // `upload` deja la nueva foto al inicio de la biblioteca.
  if (items.value.length > before && items.value[0]) {
    hero.image = { url: items.value[0].url, publicId: items.value[0].publicId }
  }
}
</script>

<template>
  <AdminShell title="Portada del home">
    <template #actions>
      <button class="btn btn--primary" :disabled="saving || loading" @click="save">
        <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i> Guardar
      </button>
    </template>

    <p class="hint">
      La portada es lo primero que ve el cliente. Elige una foto horizontal (mínimo 1200 px de
      ancho), escribe el título y a dónde lleva el botón, por ejemplo
      <code>/tienda?coleccion=Flores amarillas</code>. Apagada, vuelve el collage de fotos.
    </p>

    <div v-if="!loading" class="layout">
      <form class="form" @submit.prevent="save">
        <label class="check">
          <input v-model="hero.enabled" type="checkbox" /> Mostrar esta portada en la tienda
        </label>

        <div class="image">
          <img v-if="hero.image.url" :src="hero.image.url" alt="" class="image__preview" />
          <div v-else class="image__empty"><i class="fa-regular fa-image"></i> Sin foto</div>
          <div class="image__actions">
            <button type="button" class="btn btn--ghost" @click="picker = true">
              <i class="fa-solid fa-images"></i> Biblioteca
            </button>
            <label class="btn btn--ghost">
              <i :class="uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'"></i>
              Subir
              <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFile" />
            </label>
          </div>
        </div>

        <label
          >Etiqueta pequeña
          <input v-model="hero.eyebrow" maxlength="60" placeholder="Nueva colección"
        /></label>
        <label
          >Título
          <input
            v-model="hero.title"
            maxlength="120"
            required
            placeholder="Flores amarillas para regalar"
        /></label>
        <label
          >Texto
          <textarea
            v-model="hero.text"
            rows="2"
            maxlength="240"
            placeholder="Arreglos, peluches y detalles…"
          ></textarea>
        </label>
        <div class="form__row">
          <label
            >Texto del botón
            <input v-model="hero.ctaLabel" maxlength="40" placeholder="Ver catálogo"
          /></label>
          <label
            >Enlace del botón
            <input
              v-model="hero.ctaLink"
              maxlength="300"
              placeholder="/tienda?coleccion=Flores amarillas"
          /></label>
        </div>
      </form>

      <section class="preview" :class="{ 'preview--off': !hero.enabled }">
        <p class="preview__label">Vista previa</p>
        <div class="preview__hero">
          <div class="preview__text">
            <small>{{ hero.eyebrow || 'Etiqueta' }}</small>
            <strong>{{ hero.title || 'Título de la portada' }}</strong>
            <p>{{ hero.text }}</p>
            <span class="btn btn--primary">{{ hero.ctaLabel || 'Ver catálogo' }}</span>
          </div>
          <img v-if="hero.image.url" :src="hero.image.url" alt="" />
        </div>
      </section>
    </div>

    <MediaPicker :open="picker" @pick="pick" @close="picker = false" />
  </AdminShell>
</template>

<style scoped lang="scss">
.hint {
  font-size: $text-xs;
  color: $ink-muted;

  code {
    background: $sand;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
}

.layout {
  @include flex(column, stretch, flex-start, 1.5rem);

  @include from('lg') {
    flex-direction: row;
    align-items: flex-start;

    > * {
      flex: 1;
      min-width: 0;
    }
  }
}

.form {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__row {
    @include flex(column, stretch, flex-start, 0.8rem);

    @include from('sm') {
      flex-direction: row;
      > * {
        flex: 1;
      }
    }
  }
}

.check {
  @include flex(row, center, flex-start, 0.5rem);
  font-size: $text-sm;
  color: $ink;

  input {
    width: auto;
  }
}

.image {
  @include card;
  overflow: hidden;

  &__preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  &__empty {
    aspect-ratio: 16 / 9;
    @include flex(row, center, center, 0.5rem);
    background: $sand;
    color: $ink-muted;
    font-size: $text-sm;
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    padding: 0.7rem;

    .btn {
      padding: 0.55rem 1rem;
      font-size: $text-xs;
      cursor: pointer;
    }
  }
}

.preview {
  &--off {
    opacity: 0.5;
  }

  &__label {
    @include eyebrow;
    margin-bottom: 0.5rem;
  }

  &__hero {
    @include card;
    overflow: hidden;
    background: linear-gradient(160deg, $highlight-soft, $paper 65%);
    @include flex(column, stretch, flex-start);

    img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }
  }

  &__text {
    padding: 1.2rem 1.1rem;
    @include flex(column, flex-start, flex-start, 0.4rem);

    small {
      @include eyebrow;
    }
    strong {
      @include display($text-xl, 500);
    }
    p {
      font-size: $text-sm;
      color: $ink-soft;
    }
    .btn {
      margin-top: 0.3rem;
      padding: 0.55rem 1.1rem;
      font-size: $text-xs;
    }
  }
}
</style>
