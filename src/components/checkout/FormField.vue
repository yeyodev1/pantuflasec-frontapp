<script setup lang="ts">
/** Label con icono + control. El control va en el slot para no duplicar atributos. */
defineProps<{ label: string; icon?: string; hint?: string; optional?: boolean }>()
</script>

<template>
  <label class="field">
    <span class="field__label">
      <i v-if="icon" :class="icon"></i>
      {{ label }}
      <em v-if="optional">opcional</em>
    </span>
    <slot />
    <small v-if="hint" class="field__hint">{{ hint }}</small>
  </label>
</template>

<style scoped lang="scss">
.field {
  display: block;
  margin: 0;

  &__label {
    @include flex(row, center, flex-start, 0.45rem);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $ink-soft;
    margin-bottom: 0.45rem;

    i {
      color: $accent;
      font-size: 0.8rem;
      width: 1rem;
      text-align: center;
    }

    em {
      font-style: normal;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0;
      color: $ink-muted;
      margin-left: auto;
    }
  }

  :deep(input),
  :deep(textarea) {
    padding: 0.9rem 1rem;
    font-size: 1rem;
    border-radius: $radius-sm;
    background: $surface;
    border: 1.5px solid $line;

    &:focus {
      border-color: $accent;
      box-shadow: 0 0 0 4px rgba($accent, 0.12);
    }

    &::placeholder {
      color: $ink-muted;
    }
  }

  &__hint {
    display: block;
    margin-top: 0.35rem;
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
