import { ref } from 'vue'
import { galleryService } from '@/services/gallery.service'
import { mediaService, type MediaItem } from '@/services/upload.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, GalleryItem } from '@/types'

export function useAdminGallery() {
  const toast = useToastStore()
  const items = ref<GalleryItem[]>([])
  const loading = ref(false)
  const uploading = ref(false)

  async function load() {
    loading.value = true
    try {
      items.value = await galleryService.listAll()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  async function addFromLibrary(media: MediaItem[]) {
    try {
      for (const m of media) {
        items.value.push(await galleryService.create({ image: { url: m.url, publicId: m.publicId } }))
      }
      toast.success(media.length === 1 ? 'Foto agregada a la galería' : `${media.length} fotos agregadas`)
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  async function upload(files: File[]) {
    uploading.value = true
    try {
      for (const f of files) {
        const r = await mediaService.upload(f, 'galeria')
        items.value.push(await galleryService.create({ image: r }))
      }
      toast.success('Fotos subidas y agregadas')
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      uploading.value = false
    }
  }

  async function save(item: GalleryItem, patch: Partial<GalleryItem>) {
    try {
      const updated = await galleryService.update(item._id, patch)
      items.value = items.value.map((i) => (i._id === updated._id ? updated : i))
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  async function remove(item: GalleryItem) {
    try {
      await galleryService.remove(item._id)
      items.value = items.value.filter((i) => i._id !== item._id)
      toast.success('Foto quitada de la galería')
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= items.value.length) return
    const next = [...items.value]
    const [it] = next.splice(index, 1)
    next.splice(j, 0, it!)
    items.value = next
    try {
      await galleryService.reorder(next.map((i) => i._id))
    } catch (e) {
      toast.error((e as ApiError).message)
      load()
    }
  }

  load()
  return { items, loading, uploading, load, addFromLibrary, upload, save, remove, move }
}
