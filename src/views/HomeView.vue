<script setup lang="ts">
import { ref } from 'vue'
import { site } from '@/config/site'
import { useWhatsApp } from '@/composables/useWhatsApp'
import { settingService } from '@/services/setting.service'
import { track, waitForImages } from '@/composables/usePreloader'
import CategoryTiles from '@/components/home/CategoryTiles.vue'
import FeaturedProducts from '@/components/home/FeaturedProducts.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import HeroCollage from '@/components/home/HeroCollage.vue'
import CollectionMarquee from '@/components/home/CollectionMarquee.vue'
import HomeGallery from '@/components/home/HomeGallery.vue'
import HomePerks from '@/components/home/HomePerks.vue'
import HomeCollections from '@/components/home/HomeCollections.vue'
import type { HeroSettings } from '@/types'

const { ask } = useWhatsApp()

// Portada del admin (foto grande + botón). Si está apagada o falla, el collage de siempre.
const hero = ref<HeroSettings | null>(null)
const heroResolved = ref(false)
track(
  settingService
    .hero()
    .then(async (h) => {
      if (h.enabled && h.image.url) {
        hero.value = h
        await waitForImages([h.image.url])
      }
    })
    .catch(() => undefined)
    .finally(() => (heroResolved.value = true)),
)
</script>

<template>
  <div class="home">
    <HeroBanner v-if="hero" :hero="hero" />
    <section v-else-if="heroResolved" class="hero">
      <div class="hero__inner">
        <p class="hero__eyebrow" style="--i: 0">{{ site.name }}</p>
        <h1 class="hero__title" style="--i: 1">{{ site.tagline }}</h1>
        <p class="hero__text" style="--i: 2">{{ site.description }}</p>
        <div class="hero__actions" style="--i: 3">
          <RouterLink to="/tienda" class="btn btn--primary">
            <i class="fa-solid fa-bag-shopping"></i> Ver la tienda
          </RouterLink>
          <button v-if="site.whatsapp" type="button" class="btn btn--ghost" @click="ask()">
            <i class="fa-brands fa-whatsapp"></i> Escríbenos
          </button>
        </div>
      </div>
      <HeroCollage />
    </section>

    <CollectionMarquee />
    <HomeGallery />
    <HomeCollections />
    <div v-reveal><CategoryTiles /></div>
    <div v-reveal>
      <FeaturedProducts eyebrow="Favoritos" title="Los más pedidos" :query="{ featured: true }" />
    </div>
    <div v-reveal>
      <FeaturedProducts
        eyebrow="Nuevo"
        title="Recién llegados"
        :query="{ nuevo: '1', newArrival: true }"
      />
    </div>

    <HomePerks />
  </div>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  background: linear-gradient(160deg, $highlight-soft, $paper 65%);
  overflow: hidden;

  &__inner {
    position: relative;
    z-index: 1;
    @include container(880px);
    @include flex(column, flex-start, center, 1rem);
    padding-block: $space-lg 0.5rem;
    text-align: left;

    @include from('lg') {
      padding-block: $space-section;
    }

    @include from('md') {
      align-items: center;
      text-align: center;
      padding-block: $space-section;
    }
  }

  &__eyebrow,
  &__title,
  &__text,
  &__actions {
    @include reveal(0.7s, 0.12s);
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-lg);
  }

  &__text {
    font-size: $text-lg;
    color: $ink-soft;
    max-width: 48ch;
  }

  &__actions {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;
    margin-top: 0.4rem;
  }
}
</style>
