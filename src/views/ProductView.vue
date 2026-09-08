<script setup lang="ts">
import { useProductPage } from '@/composables/useProductPage'
import { categoryLabel, placeholderImage } from '@/config/catalog'
import { formatMoney } from '@/utils/format'
import { site } from '@/config/site'
import ProductOptions from '@/components/product/ProductOptions.vue'
import ProductDetails from '@/components/product/ProductDetails.vue'
import ProductRail from '@/components/product/ProductRail.vue'
import StickyBuyBar from '@/components/product/StickyBuyBar.vue'
import ProductZoom from '@/components/product/ProductZoom.vue'
import ImageLightbox from '@/components/product/ImageLightbox.vue'
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useWhatsApp } from '@/composables/useWhatsApp'
import { useCartStore } from '@/stores/cart'
import { pixel } from '@/utils/pixel'
import { watch } from 'vue'

const cart = useCartStore()
const wa = useWhatsApp()

const { product, loading, error, variant, imageIndex, qty, price, maxQty, canBuy, pick, related } =
  useProductPage()

// El WhatsApp global sabe qué producto está viendo el cliente mientras esté aquí.
watchEffect(() => wa.setProduct(product.value ? { product: product.value, variant: variant.value, qty: qty.value } : null))
onUnmounted(() => wa.setProduct(null))

// La barra fija aparece cuando el botón principal ya salió de pantalla.
const buyBlock = ref<HTMLElement | null>(null)
const lightbox = ref(false)
const showBar = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver(([e]) => (showBar.value = Boolean(e && !e.isIntersecting && e.boundingClientRect.top < 0)))
  const tick = () => (buyBlock.value ? io?.observe(buyBlock.value) : setTimeout(tick, 300))
  tick()
})
onUnmounted(() => io?.disconnect())

watch(product, (p) => p && pixel.viewContent(p._id, p.name, p.price, p.category))

function addToCart() {
  if (!product.value) return
  cart.add(product.value, variant.value, qty.value)
  pixel.addToCart(product.value._id, product.value.name, price.value, qty.value)
}
</script>

<template>
  <section class="product">
    <div v-if="loading" class="product__layout product__skeleton" aria-busy="true">
      <div>
        <SkeletonBox class="sk-main" />
        <div class="sk-thumbs"><SkeletonBox v-for="n in 5" :key="n" radius="10px" /></div>
      </div>
      <div class="sk-info">
        <SkeletonBox style="width: 30%; height: 0.8rem" radius="6px" />
        <SkeletonBox style="width: 80%; height: 2.2rem" radius="8px" />
        <SkeletonBox style="width: 25%; height: 1.6rem" radius="8px" />
        <div class="sk-opts"><SkeletonBox v-for="n in 4" :key="n" radius="10px" /></div>
        <SkeletonBox style="height: 3rem" radius="999px" />
        <SkeletonBox style="height: 5rem" />
      </div>
    </div>
    <p v-else-if="error" class="product__state product__state--error">
      {{ error }} <RouterLink to="/tienda" class="btn btn--ghost">Volver a la tienda</RouterLink>
    </p>

    <template v-else-if="product">
      <nav class="product__crumbs" aria-label="Ruta">
        <RouterLink to="/tienda">Tienda</RouterLink>
        <i class="fa-solid fa-chevron-right"></i>
        <RouterLink :to="{ path: '/tienda', query: { categoria: product.category } }">
          {{ categoryLabel(product.category) }}
        </RouterLink>
      </nav>

      <div class="product__layout">
        <div class="gallery">
          <Transition name="fade" mode="out-in">
            <ProductZoom
              :key="product.images[imageIndex]?.url || 'placeholder'"
              :src="product.images[imageIndex]?.url || placeholderImage"
              :alt="product.name"
              @open="product.images.length && (lightbox = true)"
            />
          </Transition>
          <ImageLightbox
            :open="lightbox"
            :images="product.images.map((i) => i.url)"
            :index="imageIndex"
            :alt="product.name"
            @update:index="imageIndex = $event"
            @close="lightbox = false"
          />
          <div v-if="product.images.length > 1" class="gallery__thumbs">
            <button
              v-for="(img, i) in product.images"
              :key="img.url"
              class="gallery__thumb"
              :class="{ 'gallery__thumb--on': i === imageIndex }"
              :aria-label="`Foto ${i + 1}`"
              @click="imageIndex = i"
            >
              <img :src="img.url" :alt="''" loading="lazy" />
            </button>
          </div>
        </div>

        <div class="info">
          <p v-if="product.collection" class="info__collection">{{ product.collection }}</p>
          <h1 class="info__name">{{ product.name }}</h1>
          <p class="info__price">
            {{ formatMoney(price) }}
            <s v-if="product.compareAtPrice" class="info__compare">{{ formatMoney(product.compareAtPrice) }}</s>
            <small class="info__tax">IVA incluido</small>
          </p>

          <div ref="buyBlock">
          <ProductOptions
            :product="product"
            :variant="variant"
            :qty="qty"
            :max-qty="maxQty"
            :can-buy="canBuy"
            @pick="pick"
            @update:qty="qty = $event"
            @add="addToCart"
          />
          </div>

          <button v-if="site.whatsapp" type="button" class="info__wa" @click="wa.ask()">
            <i class="fa-brands fa-whatsapp"></i> Preguntar por WhatsApp
          </button>

          <ProductDetails :product="product" />
        </div>
      </div>

      <ProductRail
        eyebrow="Completa el regalo"
        :title="`Más de ${product.collection || 'la colección'}`"
        :items="related.complement"
        :more="product.collection ? { path: '/tienda', query: { coleccion: product.collection } } : undefined"
      />
      <ProductRail
        eyebrow="También te puede gustar"
        :title="`Otros ${categoryLabel(product.category).toLowerCase()}`"
        :items="related.similar"
        :more="{ path: '/tienda', query: { categoria: product.category } }"
      />

      <StickyBuyBar :name="product.name" :price="price" :can-buy="canBuy" :visible="showBar" @add="addToCart" />
    </template>
  </section>
</template>

<style scoped lang="scss">
.product {
  @include container;
  padding-block: $space-sm $space-section;

  &__state {
    @include flex(column, center, center, 1rem);
    padding-block: $space-lg;
    color: $ink-soft;
    text-align: center;

    &--error {
      color: $danger;
    }
  }

  &__skeleton {
    .sk-main { aspect-ratio: 1; }
    .sk-thumbs { display: flex; gap: 0.5rem; margin-top: 0.6rem; > * { flex: 0 0 4rem; aspect-ratio: 1; } }
    .sk-info { @include flex(column, stretch, flex-start, 0.9rem); }
    .sk-opts { display: flex; gap: 0.5rem; > * { flex: 0 0 4.2rem; height: 2.8rem; } }
  }

  &__crumbs {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-xs;
    color: $ink-muted;
    margin-bottom: 0.8rem;

    a:hover {
      color: $accent-deep;
    }
  }

  &__layout {
    @include flex(column, stretch, flex-start, 1.4rem);

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;
      gap: 2.5rem;

      > * {
        flex: 1 1 0;
        min-width: 0;
      }
    }
  }
}

.gallery {
  @include reveal;

  &__thumbs {
    @include flex(row, center, flex-start, 0.5rem);
    margin-top: 0.6rem;
    overflow-x: auto;
  }

  &__thumb {
    flex: 0 0 4rem;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    overflow: hidden;
    border: 2px solid transparent;
    @include transition;
    @include press;

    &:hover {
      transform: translateY(-2px);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--on {
      border-color: $accent;
    }
  }
}

.info {
  @include flex(column, stretch, flex-start, 0.7rem);
  --i: 2;
  @include reveal;

  &__collection {
    @include eyebrow;
  }

  &__name {
    @include display($display-sm, 500);
  }

  &__tax {
    display: block;
    font-family: $font-principal;
    font-size: $text-xs;
    font-weight: 500;
    color: $ink-muted;
    letter-spacing: 0;
  }

  &__price {
    font-size: $text-xl;
    font-weight: 700;
    color: $price;
  }

  &__compare {
    font-size: $text-sm;
    font-weight: 400;
    color: $ink-muted;
    margin-left: 0.4rem;
  }

  &__wa {
    @include flex(row, center, center, 0.5rem);
    font-size: $text-sm;
    font-weight: 600;
    color: #128c7e;
    padding: 0.5rem;
  }

}


</style>
