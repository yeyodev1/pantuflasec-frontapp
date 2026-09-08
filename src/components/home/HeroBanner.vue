<script setup lang="ts">
import type { HeroSettings } from '@/types'

/**
 * Portada configurable desde el admin: una foto grande con título y botón.
 * En móvil la foto va debajo del texto; en escritorio, al lado y a toda la
 * altura, para que se vea grande y no como las fotitos del collage.
 */
defineProps<{ hero: HeroSettings }>()
</script>

<template>
  <section class="banner">
    <div class="banner__inner">
      <div class="banner__text">
        <p v-if="hero.eyebrow" class="banner__eyebrow" style="--i: 0">{{ hero.eyebrow }}</p>
        <h1 class="banner__title" style="--i: 1">{{ hero.title }}</h1>
        <p v-if="hero.text" class="banner__copy" style="--i: 2">{{ hero.text }}</p>
        <div class="banner__actions" style="--i: 3">
          <RouterLink :to="hero.ctaLink || '/tienda'" class="btn btn--primary">
            <i class="fa-solid fa-bag-shopping"></i> {{ hero.ctaLabel || 'Ver catálogo' }}
          </RouterLink>
          <RouterLink to="/tienda" class="banner__all"
            >Toda la tienda <i class="fa-solid fa-arrow-right"></i
          ></RouterLink>
        </div>
      </div>
      <RouterLink
        :to="hero.ctaLink || '/tienda'"
        class="banner__media"
        tabindex="-1"
        aria-hidden="true"
      >
        <img :src="hero.image.url" alt="" loading="eager" fetchpriority="high" />
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.banner {
  background: linear-gradient(160deg, $highlight-soft, $paper 65%);
  overflow: hidden;

  &__inner {
    @include container(1240px);
    @include flex(column, stretch, flex-start, 1.4rem);
    padding-block: $space-lg 1.5rem;

    @include from('md') {
      flex-direction: row;
      align-items: center;
      gap: 2.5rem;
      padding-block: $space-xl;
      min-height: 60vh;
    }

    @include from('lg') {
      gap: 4rem;
      min-height: 68vh;
    }
  }

  &__text {
    @include flex(column, flex-start, center, 0.9rem);

    @include from('md') {
      flex: 0 1 46%;
    }
  }

  &__eyebrow,
  &__title,
  &__copy,
  &__actions {
    @include reveal(0.7s, 0.12s);
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-lg);
  }

  &__copy {
    font-size: $text-lg;
    color: $ink-soft;
    max-width: 44ch;
  }

  &__actions {
    @include flex(row, center, flex-start, 1rem);
    flex-wrap: wrap;
    margin-top: 0.4rem;
  }

  &__all {
    font-size: $text-sm;
    font-weight: 600;
    color: $accent-deep;
    @include flex(row, center, center, 0.4rem);
  }

  // Foto grande: cuadrada en móvil, vertical en escritorio, con esquina amarilla detrás.
  &__media {
    position: relative;
    display: block;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-md;
    aspect-ratio: 4 / 3;
    animation: rise-in 0.9s $ease 0.2s both;

    @include from('md') {
      flex: 1 1 54%;
      aspect-ratio: 5 / 4;
      max-height: 72vh;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s $ease;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover img {
        transform: scale(1.03);
      }
    }
  }
}
</style>
