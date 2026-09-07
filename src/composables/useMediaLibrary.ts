import { ref } from 'vue'
import { mediaService, uploadService, type MediaItem } from '@/services/upload.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError } from '@/types'

/** Biblioteca de imágenes en Cloudinary: listar con paginación, subir y borrar. */
export function useMediaLibrary() {
  const toast = useToastStore()
  const items = ref<MediaItem[]>([])
  const cursor = ref<string | null>(null)
  const loading = ref(false)
  const uploading = ref(false)
  const configured = ref<boolean | null>(null)

  async function load(reset = true) {
    loading.value = true
    try {
      if (configured.value === null) configured.value = (await uploadService.status()).cloudinary
      if (!configured.value) return
      const r = await mediaService.list(reset ? undefined : (cursor.value ?? undefined))
      items.value = reset ? r.items : [...items.value, ...r.items]
      cursor.value = r.nextCursor
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  async function upload(files: File[], folder = 'productos') {
    uploading.value = true
    try {
      for (const file of files) {
        const r = await mediaService.upload(file, folder)
        items.value.unshift({
          publicId: r.publicId,
          url: r.url,
          width: 0,
          height: 0,
          bytes: file.size,
          format: file.type.split('/')[1] ?? '',
          createdAt: new Date().toISOString(),
        })
      }
      toast.success(files.length === 1 ? 'Imagen subida' : `${files.length} imágenes subidas`)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      uploading.value = false
    }
  }

  async function remove(item: MediaItem) {
    try {
      await mediaService.remove(item.publicId)
      items.value = items.value.filter((i) => i.publicId !== item.publicId)
      toast.success('Imagen eliminada')
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.info('URL copiada')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  load()

  return { items, cursor, loading, uploading, configured, load, upload, remove, copy }
}
