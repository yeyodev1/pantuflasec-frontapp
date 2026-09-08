<script setup lang="ts">
/** Bloque numerado del checkout: "1 Tus datos", "2 Entrega", "3 Pago". */
defineProps<{ number: number; title: string }>()
</script>

<template>
  <section class="card" :style="{ '--i': number - 1 }">
    <h2 class="card__title">
      <span>{{ number }}</span> {{ title }}
    </h2>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.card {
  @include card;
  padding: 1.1rem 1rem 1.2rem;
  @include flex(column, stretch, flex-start, 0.9rem);
  @include reveal;

  @include from('sm') {
    padding: 1.4rem 1.3rem;
  }

  &__title {
    @include display($text-lg, 600);
    @include flex(row, center, flex-start, 0.6rem);
    margin-bottom: 0.2rem;

    span {
      width: 1.7rem;
      height: 1.7rem;
      border-radius: $radius-pill;
      background: $accent-soft;
      color: $accent-deep;
      font-family: $font-principal;
      font-size: 0.8rem;
      font-weight: 700;
      @include flex(row, center, center);
    }
  }
}
</style>
