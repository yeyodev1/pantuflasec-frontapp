<script setup lang="ts">
import { ref } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import MediaGrid from '@/components/admin/MediaGrid.vue'
import { useMediaLibrary } from '@/composables/useMediaLibrary'
import type { MediaItem } from '@/services/upload.service'

const { items, cursor, loading, uploading, configured, load, upload, remove, copy } = useMediaLibrary()
const toDelete = ref<MediaItem | null>(null)
const folder = ref('productos')

function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) upload(files, folder.value)
  input.value = ''
}
</script>

<template>
  <AdminShell title="Archivos">
    <template #actions>
      <select v-model="folder" class="folder" aria-label="Carpeta">
        <option value="productos">productos</option>
        <option value="catalogo">catalogo</option>
        <option value="banners">banners</option>
      </select>
      <label class="btn btn--primary" :class="{ 'btn--busy': uploading }">
        <i :class="uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'"></i>
        {{ uploading ? 'Subiendo…' : 'Subir' }}
        <input type="file" accept="image/*" multiple hidden :disabled="uploading || !configured" @change="onFiles" />
      </label>
    </template>

    <p v-if="configured === false" class="warn">
      <i class="fa-solid fa-triangle-exclamation"></i>
      Cloudinary no está configurado en el servidor. Pon las tres variables `CLOUDINARY_*` y recarga.
    </p>

    <p class="hint">Todas las fotos de la tienda viven en Cloudinary. Copia la URL para usarla en un producto o elige "Elegir de la biblioteca" al editarlo.</p>

    <MediaGrid :items="items" @copy="copy" @remove="toDelete = $event" />

    <p v-if="!loading && configured && !items.length" class="empty">Todavía no hay imágenes.</p>
    <button v-if="cursor" class="btn btn--ghost more" :disabled="loading" @click="load(false)">
      <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i> Cargar más
    </button>

    <BaseModal
      :open="Boolean(toDelete)"
      title="¿Eliminar imagen?"
      message="Se borra de Cloudinary. Si algún producto la usa, el servidor lo impedirá."
      confirm-label="Eliminar"
      danger
      @confirm="toDelete && remove(toDelete); toDelete = null"
      @cancel="toDelete = null"
    />
  </AdminShell>
</template>

<style scoped lang="scss">
.folder {
  width: auto;
  padding: 0.55rem 2rem 0.55rem 0.8rem;
  border-radius: $radius-pill;
  font-size: $text-sm;
}

.btn {
  cursor: pointer;

  &--busy {
    opacity: 0.7;
    pointer-events: none;
  }
}

.warn {
  @include card;
  padding: 0.8rem 1rem;
  font-size: $text-sm;
  color: $warning;
  background: $warning-bg;
  border-color: transparent;
}

.hint,
.empty {
  font-size: $text-xs;
  color: $ink-muted;
}

.more {
  align-self: center;
}
</style>
