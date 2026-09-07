import APIBase from './httpBase'
import type { AdminUser, Paginated } from '@/types'

export interface UserInput {
  email?: string
  password?: string
  name?: string
  phone?: string
  accountType?: 'admin' | 'customer'
  isActive?: boolean
}

class UserService extends APIBase {
  async list(query: { q?: string; accountType?: string; page?: number } = {}): Promise<Paginated<AdminUser>> {
    const params = new URLSearchParams()
    if (query.q) params.set('q', query.q)
    if (query.accountType) params.set('accountType', query.accountType)
    if (query.page) params.set('page', String(query.page))
    const qs = params.toString()
    const { data } = await this.get<Paginated<AdminUser>>(`users${qs ? `?${qs}` : ''}`)
    return data
  }

  async create(input: UserInput): Promise<AdminUser> {
    const { data } = await this.post<AdminUser>('users', input)
    return data
  }

  async update(id: string, input: UserInput): Promise<AdminUser> {
    const { data } = await this.put<AdminUser>(`users/${id}`, input)
    return data
  }

  async remove(id: string): Promise<void> {
    await this.delete<void>(`users/${id}`)
  }
}

export const userService = new UserService()
