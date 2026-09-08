import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/product.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Category, Product, ProductImage, ProductVariant } from '@/types'

export type VariantDraft = Omit<ProductVariant, '_id'> & { _id?: string }

export interface ProductDraft {
  name: string
  description: string
  category: Category
  collection: string
  price: number
  compareAtPrice: number | null
  images: ProductImage[]
  variants: VariantDraft[]
  tags: string
  isActive: boolean
  featured: boolean
  newArrival: boolean
  showOnHome: boolean
  sortOrder: number
}

function empty(): ProductDraft {
  return {
    name: '',
    description: '',
    category: 'pantuflas',
    collection: '',
    price: 0,
    compareAtPrice: null,
    images: [],
    variants: [],
    tags: '',
    isActive: true,
    featured: false,
    newArrival: false,
    showOnHome: false,
    sortOrder: 0,
  }
}

/** Carga (o arranca vacío) y guarda un producto. Crea o actualiza según haya id. */
export function useProductForm() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToastStore()

  const draft = reactive<ProductDraft>(empty())
  const id = ref<string | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function load() {
    const slug = route.params.slug
    if (typeof slug !== 'string' || slug === 'nuevo') return
    loading.value = true
    try {
      const p = await productService.adminBySlug(slug)
      id.value = p._id
      Object.assign(draft, {
        ...p,
        tags: p.tags.join(', '),
        variants: p.variants.map((v) => ({ ...v })),
        images: p.images.map((i) => ({ ...i })),
      })
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  function toPayload(): Partial<Product> {
    return {
      ...draft,
      price: Number(draft.price),
      compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
      tags: draft.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      variants: draft.variants.map((v) => ({
        ...v,
        stock: Number(v.stock),
        price: v.price === null || v.price === ('' as unknown) ? null : Number(v.price),
      })) as ProductVariant[],
    }
  }

  async function save() {
    saving.value = true
    error.value = ''
    try {
      const saved = id.value
        ? await productService.update(id.value, toPayload())
        : await productService.create(toPayload())
      toast.success('Producto guardado')
      if (!id.value) router.replace(`/admin/productos/${saved.slug}`)
      id.value = saved._id
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      saving.value = false
    }
  }

  function addVariant() {
    draft.variants.push({ label: '', size: '', color: '', sku: '', price: null, stock: 0 })
  }

  function removeVariant(i: number) {
    draft.variants.splice(i, 1)
  }

  load()

  return { draft, id, loading, saving, error, save, addVariant, removeVariant }
}
