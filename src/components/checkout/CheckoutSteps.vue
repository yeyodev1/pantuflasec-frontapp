<script setup lang="ts">
/** Indicador de pasos del checkout: 1 Datos → 2 Pago. */
defineProps<{ paying: boolean }>()
</script>

<template>
  <ol class="steps" aria-label="Progreso">
    <li class="steps__item" :class="{ 'steps__item--done': paying, 'steps__item--on': !paying }"><span>1</span> Datos</li>
    <li class="steps__item" :class="{ 'steps__item--on': paying }"><span>2</span> Pago</li>
  </ol>
</template>

<style scoped lang="scss">
.steps {
  list-style: none;
  @include flex(row, center, flex-start, 0.6rem);
  margin-bottom: 0.6rem;

  &__item {
    @include flex(row, center, center, 0.4rem);
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $ink-muted;

    span {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: $radius-pill;
      border: 1.5px solid $line;
      @include flex(row, center, center);
      font-size: 0.7rem;
      @include transition;
    }

    &--on {
      color: $accent-deep;

      span {
        background: $accent;
        border-color: $accent;
        color: $surface;
      }
    }

    &--done span {
      background: $success;
      border-color: $success;
      color: $surface;
    }

    & + &::before {
      content: '';
      width: 1.4rem;
      height: 1.5px;
      background: $line;
      margin-right: 0.2rem;
    }
  }
}
</style>
