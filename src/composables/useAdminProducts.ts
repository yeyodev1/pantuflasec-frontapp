import { ref, watch } from 'vue'
import { productService } from '@/services/product.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Product } from '@/types'

export function useAdminProducts() {
  const toast = useToastStore()
  const items = ref<Product[]>([])
  const total = ref(0)
  const pages = ref(1)
  const page = ref(1)
  const q = ref('')
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const r = await productService.listAll({ q: q.value, page: page.value, sort: 'recent', limit: 40 })
      items.value = r.items
      total.value = r.total
      pages.value = r.pages
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  watch(q, () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      page.value = 1
      load()
    }, 350)
  })
  watch(page, load, { immediate: true })

  /** Cambia un booleano en caliente y revierte si el API falla. */
  async function toggle(product: Product, field: 'isActive' | 'featured') {
    const previous = product[field]
    product[field] = !previous
    try {
      await productService.update(product._id, { [field]: product[field] })
    } catch (e) {
      product[field] = previous
      toast.error((e as ApiError).message)
    }
  }

  async function remove(product: Product) {
    try {
      await productService.remove(product._id)
      items.value = items.value.filter((p) => p._id !== product._id)
      total.value -= 1
      toast.success(`${product.name} eliminado`)
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  return { items, total, pages, page, q, loading, load, toggle, remove }
}
