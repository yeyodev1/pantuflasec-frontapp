import APIBase from './httpBase'

class UploadService extends APIBase {
  async status(): Promise<{ cloudinary: boolean }> {
    const { data } = await this.get<{ cloudinary: boolean }>('uploads/status')
    return data
  }

  async image(file: File): Promise<{ url: string; publicId: string }> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await this.post<{ url: string; publicId: string }>('uploads/image', form, undefined, {
      timeout: 60000,
    })
    return data
  }
}

export const uploadService = new UploadService()

export interface MediaItem {
  publicId: string
  url: string
  width: number
  height: number
  bytes: number
  format: string
  createdAt: string
}

class MediaService extends APIBase {
  async list(cursor?: string): Promise<{ items: MediaItem[]; nextCursor: string | null }> {
    const { data } = await this.get<{ items: MediaItem[]; nextCursor: string | null }>(
      `uploads${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    )
    return data
  }

  async upload(file: File, folder = 'productos'): Promise<{ url: string; publicId: string }> {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)
    const { data } = await this.post<{ url: string; publicId: string }>('uploads/image', form, undefined, {
      timeout: 60000,
    })
    return data
  }

  async remove(publicId: string): Promise<void> {
    await this.delete<void>(`uploads/${encodeURIComponent(publicId)}`)
  }
}

export const mediaService = new MediaService()
