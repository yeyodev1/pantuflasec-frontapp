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
