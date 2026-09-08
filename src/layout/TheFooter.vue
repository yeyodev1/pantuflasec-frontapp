<script setup lang="ts">
import { logo, site } from '@/config/site'
import { useWhatsApp } from '@/composables/useWhatsApp'

const year = new Date().getFullYear()
const { ask } = useWhatsApp()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <img :src="logo.wordmark" alt="Pantuflas Ecuador" class="footer__logo" width="180" height="65" />
        <p class="footer__tagline">{{ site.tagline }}</p>
        <div class="footer__social">
          <button type="button" aria-label="WhatsApp" @click="ask()"><i class="fa-brands fa-whatsapp"></i></button>
          <a :href="site.social.instagram" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
        </div>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Navegación</h4>
        <RouterLink v-for="link in site.nav" :key="link.to" :to="link.to">{{ link.label }}</RouterLink>
        <RouterLink to="/tienda?categoria=arreglos">Regalos y box</RouterLink>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Tiendas</h4>
        <span v-for="s in site.stores" :key="s.name" class="footer__store">
          <i class="fa-solid fa-location-dot"></i> <span><strong>{{ s.name }}</strong><br />{{ s.address }}, {{ s.city }}</span>
        </span>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Contacto</h4>
        <button type="button" class="footer__link" @click="ask()"><i class="fa-brands fa-whatsapp"></i> {{ site.whatsappDisplay }}</button>
        <a :href="site.social.instagram" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i> {{ site.social.instagramHandle }}</a>
        <a :href="`mailto:${site.email}`"><i class="fa-solid fa-envelope"></i> {{ site.email }}</a>
      </div>
    </div>

    <div class="footer__bar">
      <span>© {{ year }} Pantuflas Ecuador</span>
      <span class="footer__credit">
        <RouterLink to="/login" class="footer__admin"><i class="fa-solid fa-lock"></i> Admin</RouterLink>
        · Hecho por <a href="https://bakano.ec" target="_blank" rel="noopener">Bakano</a>
      </span>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: $ink;
  color: rgba($paper, 0.8);
  margin-top: auto;

  &__inner {
    @include container;
    @include flex-cards(200px, 2rem);
    padding-block: $space-xl $space-lg;
  }

  &__brand {
    flex-basis: 260px;
  }

  &__logo {
    height: 3rem;
    width: auto;
    margin-bottom: 0.8rem;
  }

  &__tagline {
    font-size: $text-sm;
    max-width: 30ch;
  }

  &__social {
    @include flex(row, center, flex-start, 0.5rem);
    margin-top: 0.9rem;

    a,
    button {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: $radius-pill;
      background: rgba($paper, 0.08);
      color: $paper;
      font-size: 1.1rem;
      @include flex(row, center, center);
      @include transition;

      &:hover {
        background: $accent;
        transform: translateY(-2px);
      }
    }
  }

  &__col {
    @include flex(column, flex-start, flex-start, 0.5rem);

    a,
    .footer__link {
      font-size: $text-sm;
      @include flex(row, center, flex-start, 0.5rem);
      @include transition(color);

      &:hover {
        color: $accent-soft;
      }

      i {
        width: 1rem;
        text-align: center;
        color: $accent;
      }
    }
  }

  &__heading {
    @include eyebrow;
    color: $paper;
    font-family: $font-principal;
    margin-bottom: 0.3rem;
  }

  &__store {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    font-size: $text-sm;
    line-height: 1.4;

    i {
      margin-top: 0.25rem;
      color: $accent;
    }

    strong {
      color: $paper;
    }
  }

  &__bar {
    @include container;
    @include flex(row, center, space-between, 1rem);
    flex-wrap: wrap;
    padding-block: 1rem;
    border-top: 1px solid rgba($paper, 0.1);
    font-size: $text-xs;
    color: rgba($paper, 0.55);
  }

  &__credit a {
    color: $paper;
  }

  &__admin {
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
