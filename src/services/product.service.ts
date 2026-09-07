import APIBase from './httpBase'
import type { Paginated, Product, ProductFacets, ProductQuery } from '@/types'

function toParams(query: ProductQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || value === false) continue
    params.set(key, String(value))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

class ProductService extends APIBase {
  async list(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const { data } = await this.get<Paginated<Product>>(`products${toParams(query)}`)
    return data
  }

  async facets(): Promise<ProductFacets> {
    const { data } = await this.get<ProductFacets>('products/facets')
    return data
  }

  async bySlug(slug: string): Promise<Product> {
    const { data } = await this.get<Product>(`products/${encodeURIComponent(slug)}`)
    return data
  }

  // --- Admin ---

  async listAll(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const { data } = await this.get<Paginated<Product>>(`products/admin/all${toParams(query)}`)
    return data
  }

  async adminBySlug(slug: string): Promise<Product> {
    const { data } = await this.get<Product>(`products/admin/${encodeURIComponent(slug)}`)
    return data
  }

  async create(input: Partial<Product>): Promise<Product> {
    const { data } = await this.post<Product>('products', input)
    return data
  }

  async update(id: string, input: Partial<Product>): Promise<Product> {
    const { data } = await this.put<Product>(`products/${id}`, input)
    return data
  }

  async remove(id: string): Promise<void> {
    await this.delete<void>(`products/${id}`)
  }
}

export const productService = new ProductService()
