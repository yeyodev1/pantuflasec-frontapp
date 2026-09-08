<script setup lang="ts">
import { site } from '@/config/site'
import { useWhatsApp } from '@/composables/useWhatsApp'
import CategoryTiles from '@/components/home/CategoryTiles.vue'
import FeaturedProducts from '@/components/home/FeaturedProducts.vue'
import HeroCollage from '@/components/home/HeroCollage.vue'
import CollectionMarquee from '@/components/home/CollectionMarquee.vue'
import HomeGallery from '@/components/home/HomeGallery.vue'
import HomePerks from '@/components/home/HomePerks.vue'

const { ask } = useWhatsApp()

</script>

<template>
  <div class="home">
    <section class="hero">
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
    <div v-reveal><CategoryTiles /></div>
    <div v-reveal><FeaturedProducts eyebrow="Favoritos" title="Los más pedidos" :query="{ featured: true }" /></div>
    <div v-reveal><FeaturedProducts eyebrow="Nuevo" title="Recién llegados" :query="{ sort: 'recent' }" /></div>

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
