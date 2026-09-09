<script setup lang="ts">
import { site } from '@/config/site'
import { useWhatsApp } from '@/composables/useWhatsApp'

/** Franja amarilla de marca con las razones para comprar aquí. */
const { ask } = useWhatsApp()

const perks = [
  {
    icon: 'fa-solid fa-truck-fast',
    title: 'Envíos a todo Ecuador',
    text: 'Por Servientrega, de 24 a 72 horas a provincias. En Guayaquil llega en 1 a 2 días.',
  },
  {
    icon: 'fa-solid fa-credit-card',
    title: 'Paga como prefieras',
    text: 'Transferencia o efectivo al retirar sin recargo; con tarjeta se suma la comisión de PayPhone. Precios con IVA incluido.',
  },
  {
    icon: 'fa-solid fa-store',
    title: 'Dos tiendas para retirar',
    text: `${site.stores[0]!.name} y ${site.stores[1]!.name}. Retiro gratis, te avisamos cuando esté listo.`,
  },
  {
    icon: 'fa-brands fa-whatsapp',
    title: 'Atención por WhatsApp',
    text: 'Resolvemos dudas, personalizamos regalos y cerramos tu compra por chat si prefieres.',
    action: true,
  },
]
</script>

<template>
  <section id="contacto" class="perks">
    <div class="perks__inner">
      <header class="perks__head" v-reveal>
        <p class="perks__eyebrow">Compra fácil</p>
        <h2 class="perks__title">Así de simple es regalar con nosotros</h2>
      </header>

      <div class="perks__grid">
        <component
          :is="p.action ? 'button' : 'div'"
          v-for="(p, i) in perks"
          :key="p.title"
          v-reveal="i"
          class="perk"
          :class="{ 'perk--action': p.action }"
          :type="p.action ? 'button' : undefined"
          @click="p.action && ask()"
        >
          <span class="perk__icon"><i :class="p.icon"></i></span>
          <strong class="perk__title">{{ p.title }}</strong>
          <p class="perk__text">{{ p.text }}</p>
          <span v-if="p.action" class="perk__link"
            >{{ site.whatsappDisplay }} <i class="fa-solid fa-arrow-right"></i
          ></span>
        </component>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.perks {
  background: $highlight;
  color: $ink;
  margin-top: $space-xl;
  // Bordes en diagonal suave para que la franja no sea un bloque duro.
  clip-path: polygon(0 3%, 100% 0, 100% 97%, 0 100%);
  padding-block: $space-xl;

  @include from('md') {
    clip-path: polygon(0 8%, 100% 0, 100% 92%, 0 100%);
    padding-block: $space-section;
  }

  &__inner {
    @include container;
  }

  &__head {
    text-align: center;
    margin-bottom: 1.6rem;
    @include flex(column, center, center, 0.3rem);
  }

  &__eyebrow {
    @include eyebrow;
    color: $brand-blue-deep;
  }

  &__title {
    @include display($display-sm);
    max-width: 22ch;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;

    > * {
      flex: 1 1 100%;
    }

    @include from('sm') {
      > * {
        flex-basis: calc(50% - 0.4rem);
      }
    }

    @include from('lg') {
      gap: 1rem;

      > * {
        flex-basis: calc(25% - 0.75rem);
      }
    }
  }
}

.perk {
  @include flex(column, flex-start, flex-start, 0.5rem);
  text-align: left;
  padding: 1.3rem 1.2rem;
  border-radius: $radius-md;
  background: rgba($surface, 0.55);
  border: 1px solid rgba($surface, 0.7);
  backdrop-filter: blur(4px);
  @include lift(-4px, $shadow-md);

  &__icon {
    width: 3rem;
    height: 3rem;
    border-radius: $radius-pill;
    background: $ink;
    color: $highlight;
    font-size: 1.25rem;
    @include flex(row, center, center);
    margin-bottom: 0.3rem;
  }

  &__title {
    @include display($text-lg, 600);
  }

  &__text {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &--action {
    cursor: pointer;
    background: $ink;
    border-color: $ink;
    color: $paper;

    .perk__icon {
      background: #25d366;
      color: #fff;
    }

    .perk__text {
      color: rgba($paper, 0.75);
    }
  }

  &__link {
    margin-top: auto;
    padding-top: 0.4rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $highlight;
    @include flex(row, center, flex-start, 0.4rem);
  }
}
</style>
