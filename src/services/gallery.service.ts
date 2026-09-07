import APIBase from './httpBase'
import type { GalleryItem } from '@/types'

export type GalleryInput = Partial<Pick<GalleryItem, 'title' | 'subtitle' | 'image' | 'link' | 'isActive' | 'order'>>

class GalleryService extends APIBase {
  async list(): Promise<GalleryItem[]> {
    const { data } = await this.get<GalleryItem[]>('gallery')
    return data
  }

  async listAll(): Promise<GalleryItem[]> {
    const { data } = await this.get<GalleryItem[]>('gallery/admin/all')
    return data
  }

  async create(input: GalleryInput): Promise<GalleryItem> {
    const { data } = await this.post<GalleryItem>('gallery', input)
    return data
  }

  async update(id: string, input: GalleryInput): Promise<GalleryItem> {
    const { data } = await this.put<GalleryItem>(`gallery/${id}`, input)
    return data
  }

  async remove(id: string): Promise<void> {
    await this.delete<void>(`gallery/${id}`)
  }

  async reorder(ids: string[]): Promise<void> {
    await this.put<void>('gallery/reorder', { ids })
  }
}

export const galleryService = new GalleryService()
