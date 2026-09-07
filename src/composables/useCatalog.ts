import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/product.service'
import { PAGE_SIZE } from '@/config/catalog'
import type { ApiError, Category, Product, ProductFacets, ProductQuery, ProductSort } from '@/types'

/**
 * Estado del catálogo atado a la URL: los filtros viven en la query string
 * para que un enlace compartido por WhatsApp abra la misma vista.
 */
export function useCatalog() {
  const route = useRoute()
  const router = useRouter()

  const items = ref<Product[]>([])
  const total = ref(0)
  const pages = ref(1)
  const loading = ref(false)
  const error = ref('')
  const facets = ref<ProductFacets | null>(null)

  const query = ref<ProductQuery>(readQuery())

  function readQuery(): ProductQuery {
    const q = route.query
    return {
      q: typeof q.q === 'string' ? q.q : '',
      category: (typeof q.categoria === 'string' ? q.categoria : '') as Category | '',
      collection: typeof q.coleccion === 'string' ? q.coleccion : '',
      sort: (typeof q.orden === 'string' ? q.orden : 'featured') as ProductSort,
      page: Number(q.pagina) || 1,
    }
  }

  function writeQuery() {
    const next: Record<string, string> = {}
    if (query.value.q) next.q = query.value.q
    if (query.value.category) next.categoria = query.value.category
    if (query.value.collection) next.coleccion = query.value.collection
    if (query.value.sort && query.value.sort !== 'featured') next.orden = query.value.sort
    if ((query.value.page ?? 1) > 1) next.pagina = String(query.value.page)
    router.replace({ query: next })
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const result = await productService.list({ ...query.value, limit: PAGE_SIZE })
      items.value = result.items
      total.value = result.total
      pages.value = result.pages
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  async function loadFacets() {
    try {
      facets.value = await productService.facets()
    } catch {
      facets.value = null
    }
  }

  function setFilter(patch: Partial<ProductQuery>) {
    query.value = { ...query.value, ...patch, page: 1 }
    writeQuery()
  }

  function setPage(page: number) {
    query.value = { ...query.value, page }
    writeQuery()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // La URL es la fuente de verdad: cambiar la query recarga.
  watch(
    () => route.query,
    () => {
      query.value = readQuery()
      load()
    },
    { immediate: true },
  )

  loadFacets()

  return { items, total, pages, loading, error, facets, query, setFilter, setPage, reload: load }
}
