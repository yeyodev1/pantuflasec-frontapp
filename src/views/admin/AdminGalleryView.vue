<script setup lang="ts">
import { ref } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import MediaPicker from '@/components/admin/MediaPicker.vue'
import { useAdminGallery } from '@/composables/useAdminGallery'
import type { GalleryItem } from '@/types'

const { items, loading, uploading, addFromLibrary, upload, save, remove, move } = useAdminGallery()
const picker = ref(false)
const toDelete = ref<GalleryItem | null>(null)

function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) upload(files)
  input.value = ''
}

function commit(item: GalleryItem, field: 'title' | 'subtitle' | 'link', e: Event) {
  const value = (e.target as HTMLInputElement).value.trim()
  if (value !== item[field]) save(item, { [field]: value })
}
</script>

<template>
  <AdminShell title="Galería del home">
    <template #actions>
      <button class="btn btn--ghost" @click="picker = true"><i class="fa-solid fa-images"></i> Biblioteca</button>
      <label class="btn btn--primary">
        <i :class="uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'"></i> Subir
        <input type="file" accept="image/*" multiple hidden :disabled="uploading" @change="onFiles" />
      </label>
    </template>

    <p class="hint">
      Estas fotos se muestran en la portada con movimiento. El orden de aquí es el orden de la tienda.
      Título, subtítulo y enlace son opcionales: el enlace puede ser una ruta como <code>/tienda?coleccion=Stitch</code>.
    </p>

    <ul class="list" :class="{ 'list--dim': loading }">
      <li v-for="(it, i) in items" :key="it._id" class="row" :class="{ 'row--off': !it.isActive }" :style="{ '--i': i % 10 }">
        <img :src="it.image.url" :alt="''" class="row__img" />
        <div class="row__fields">
          <input :value="it.title" placeholder="Título" @change="commit(it, 'title', $event)" />
          <input :value="it.subtitle" placeholder="Subtítulo" @change="commit(it, 'subtitle', $event)" />
          <input :value="it.link" placeholder="Enlace (opcional)" @change="commit(it, 'link', $event)" />
        </div>
        <div class="row__actions">
          <button class="pill" title="Subir" :disabled="i === 0" @click="move(i, -1)"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="pill" title="Bajar" :disabled="i === items.length - 1" @click="move(i, 1)"><i class="fa-solid fa-arrow-down"></i></button>
          <button :class="['pill', { 'pill--on': it.isActive }]" :title="it.isActive ? 'Visible' : 'Oculta'" @click="save(it, { isActive: !it.isActive })">
            <i :class="it.isActive ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
          </button>
          <button class="pill pill--danger" title="Quitar" @click="toDelete = it"><i class="fa-solid fa-trash"></i></button>
        </div>
      </li>
      <li v-if="!loading && !items.length" class="empty">
        La galería está vacía. Agrega fotos desde la biblioteca o súbelas. Mientras tanto la portada usa los productos destacados.
      </li>
    </ul>

    <MediaPicker :open="picker" @pick="addFromLibrary($event); picker = false" @close="picker = false" />
    <BaseModal
      :open="Boolean(toDelete)"
      title="¿Quitar de la galería?"
      message="La foto sigue en la biblioteca; solo deja de mostrarse en la portada."
      confirm-label="Quitar"
      danger
      @confirm="toDelete && remove(toDelete); toDelete = null"
      @cancel="toDelete = null"
    />
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

.btn {
  cursor: pointer;
}

.list {
  list-style: none;
  @include card;
  @include transition(opacity);
  &--dim { opacity: 0.5; }
}

.row {
  @include flex(row, center, flex-start, 0.8rem);
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid $line;
  @include reveal(0.4s, 0.03s);
  &:last-child { border-bottom: none; }
  &--off { opacity: 0.55; }

  &__img {
    flex: 0 0 4.5rem;
    width: 4.5rem;
    height: 4.5rem;
    object-fit: cover;
    border-radius: $radius-sm;
    background: $sand;
  }

  &__fields {
    flex: 1;
    min-width: 0;
    @include flex(column, stretch, flex-start, 0.3rem);

    input {
      padding: 0.45rem 0.7rem;
      font-size: $text-sm;
    }

    @include from('md') {
      flex-direction: row;
      > * { flex: 1; }
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.3rem);
    flex-wrap: wrap;
    max-width: 5rem;

    @include from('md') {
      max-width: none;
      flex-wrap: nowrap;
    }
  }
}

.pill {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  color: $ink-muted;
  font-size: 0.8rem;
  @include flex(row, center, center);
  @include transition;
  @include press;
  &--on { color: $accent-deep; border-color: $accent; background: $accent-soft; }
  &--danger:hover { color: $danger; border-color: $danger; }
  &:disabled { opacity: 0.3; pointer-events: none; }
}

.empty {
  padding: 1.5rem;
  text-align: center;
  color: $ink-muted;
  font-size: $text-sm;
}
</style>
