import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productService } from '@/services/product.service'
import type { ApiError, Product, ProductVariant } from '@/types'
import { variantPrice } from '@/utils/product'

/** Carga del producto por slug y selección de variante/imagen. */
export function useProductPage() {
  const route = useRoute()
  const product = ref<Product | null>(null)
  const loading = ref(true)
  const error = ref('')
  const variant = ref<ProductVariant | null>(null)
  const imageIndex = ref(0)
  const qty = ref(1)
  const related = ref<{ complement: Product[]; similar: Product[] }>({ complement: [], similar: [] })

  async function load(slug: string) {
    loading.value = true
    error.value = ''
    product.value = null
    imageIndex.value = 0
    qty.value = 1
    try {
      product.value = await productService.bySlug(slug)
      // Se preselecciona la primera variante con stock para que el botón de
      // compra sirva de una, sin obligar a elegir cuando solo hay una opción.
      variant.value = product.value.variants.find((v) => v.stock > 0) ?? null
      document.title = `${product.value.name} — Pantuflasec`
      productService
        .related(slug)
        .then((r) => (related.value = r))
        .catch(() => (related.value = { complement: [], similar: [] }))
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  watch(() => route.params.slug, (slug) => typeof slug === 'string' && load(slug), {
    immediate: true,
  })

  const price = computed(() => (product.value ? variantPrice(product.value, variant.value) : 0))
  const needsVariant = computed(() => (product.value?.variants.length ?? 0) > 0)
  const maxQty = computed(() => (variant.value ? variant.value.stock : 99))
  const canBuy = computed(() => {
    if (!product.value) return false
    if (!needsVariant.value) return true
    return Boolean(variant.value && variant.value.stock > 0)
  })

  function pick(v: ProductVariant) {
    if (v.stock <= 0) return
    variant.value = v
    qty.value = Math.min(qty.value, v.stock)
  }

  return { product, loading, error, variant, imageIndex, qty, price, needsVariant, maxQty, canBuy, pick, related }
}
