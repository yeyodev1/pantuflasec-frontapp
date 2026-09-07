<script setup lang="ts">
import { site, whatsappLink } from '@/config/site'
import CategoryTiles from '@/components/home/CategoryTiles.vue'
import FeaturedProducts from '@/components/home/FeaturedProducts.vue'
import HeroCollage from '@/components/home/HeroCollage.vue'
import CollectionMarquee from '@/components/home/CollectionMarquee.vue'

const perks = [
  { icon: 'fa-solid fa-truck-fast', title: 'Envíos a todo Ecuador', text: 'Por Servientrega, de 24 a 72 horas a provincias.' },
  { icon: 'fa-solid fa-credit-card', title: 'Paga con tarjeta', text: 'Cobro seguro con PayPhone, sin salir de la tienda.' },
  { icon: 'fa-solid fa-store', title: 'Tienda en Guayaquil', text: 'La Garzota, av. Agustín Freire frente al Garzocentro.' },
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <HeroCollage />
      <div class="hero__inner">
        <p class="hero__eyebrow" style="--i: 0">{{ site.name }}</p>
        <h1 class="hero__title" style="--i: 1">{{ site.tagline }}</h1>
        <p class="hero__text" style="--i: 2">{{ site.description }}</p>
        <div class="hero__actions" style="--i: 3">
          <RouterLink to="/tienda" class="btn btn--primary">
            <i class="fa-solid fa-bag-shopping"></i> Ver la tienda
          </RouterLink>
          <a v-if="site.whatsapp" :href="whatsappLink()" class="btn btn--ghost" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i> Escríbenos
          </a>
        </div>
      </div>
    </section>

    <CollectionMarquee />
    <div v-reveal><CategoryTiles /></div>
    <div v-reveal><FeaturedProducts eyebrow="Favoritos" title="Los más pedidos" :query="{ featured: true }" /></div>
    <div v-reveal><FeaturedProducts eyebrow="Nuevo" title="Recién llegados" :query="{ sort: 'recent' }" /></div>

    <section id="contacto" class="perks">
      <article v-for="(perk, i) in perks" :key="perk.title" v-reveal="i" class="perk">
        <span class="perk__icon"><i :class="perk.icon"></i></span>
        <h3 class="perk__title">{{ perk.title }}</h3>
        <p class="perk__text">{{ perk.text }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  background: linear-gradient(160deg, $accent-soft, $paper 60%);
  overflow: hidden;

  &__inner {
    position: relative;
    z-index: 1;
    @include container(880px);
    @include flex(column, flex-start, center, 1rem);
    padding-block: $space-xl;
    text-align: left;

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

.perks {
  @include container;
  @include flex-cards(240px, 1rem);
  padding-block: $space-xl $space-section;
}

.perk {
  @include card;
  padding: 1.5rem 1.4rem;
  @include lift;

  &__icon {
    @include flex(row, center, center);
    width: 2.6rem;
    height: 2.6rem;
    border-radius: $radius-sm;
    background: $accent-soft;
    color: $accent-deep;
    margin-bottom: 0.8rem;
  }

  &__title {
    @include display($text-lg, 600);
    margin-bottom: 0.3rem;
  }

  &__text {
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
