<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { countries, flag, isValid, split, toE164, type Country } from '@/utils/phone'

/**
 * Teléfono con selector de país (bandera + código) y número nacional.
 * Emite siempre E.164 (+593982401562), venga como venga escrito.
 */
const props = defineProps<{ modelValue: string; required?: boolean; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const initial = split(props.modelValue)
const country = ref<Country>(initial.country)
const national = ref(initial.national)
const open = ref(false)

const valid = computed(() => !national.value || isValid(country.value, national.value))

function push() {
  emit('update:modelValue', toE164(country.value, national.value))
}

function pick(c: Country) {
  country.value = c
  open.value = false
  push()
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  // Si pega el número con código (+593…), se reparte solo.
  if (raw.trim().startsWith('+')) {
    const s = split(raw)
    country.value = s.country
    national.value = s.national
  } else {
    national.value = raw.replace(/[^\d\s]/g, '')
  }
  push()
}

watch(
  () => props.modelValue,
  (v) => {
    if (v === toE164(country.value, national.value)) return
    const s = split(v)
    country.value = s.country
    national.value = s.national
  },
)
</script>

<template>
  <div class="phone" :class="{ 'phone--open': open, 'phone--bad': !valid }">
    <button type="button" class="phone__country" :aria-expanded="open" aria-label="Código de país" @click="open = !open">
      <img :src="flag(country.iso)" :alt="country.name" width="24" height="18" />
      <span>+{{ country.dial }}</span>
      <i class="fa-solid fa-chevron-down"></i>
    </button>
    <input
      type="tel"
      inputmode="tel"
      autocomplete="tel-national"
      :value="national"
      :required="required"
      :placeholder="placeholder ?? (country.iso === 'ec' ? '98 240 1562' : 'Número')"
      :aria-invalid="!valid"
      @input="onInput"
      @focus="open = false"
    />

    <Transition name="rise">
      <ul v-if="open" class="phone__list" role="listbox">
        <li v-for="c in countries" :key="c.iso">
          <button type="button" role="option" :aria-selected="c.iso === country.iso" :class="{ 'is-on': c.iso === country.iso }" @click="pick(c)">
            <img :src="flag(c.iso)" :alt="''" width="24" height="18" />
            <span>{{ c.name }}</span>
            <small>+{{ c.dial }}</small>
          </button>
        </li>
      </ul>
    </Transition>
    <small v-if="!valid" class="phone__error">Revisa el número para {{ country.name }} ({{ country.min === country.max ? country.min : `${country.min} a ${country.max}` }} dígitos).</small>
  </div>
</template>

<style scoped lang="scss">
.phone {
  position: relative;
  @include flex(row, stretch, flex-start);
  flex-wrap: wrap;

  &__country {
    @include flex(row, center, center, 0.4rem);
    padding: 0 0.8rem;
    border: 1.5px solid $line;
    border-right: none;
    border-radius: $radius-sm 0 0 $radius-sm;
    background: $sand;
    font-weight: 700;
    font-size: $text-sm;
    color: $ink;
    @include transition;

    img {
      border-radius: 3px;
      box-shadow: 0 0 0 1px rgba($ink, 0.1);
    }

    i {
      font-size: 0.6rem;
      color: $ink-muted;
    }

    &:hover {
      background: $highlight-soft;
    }
  }

  input {
    flex: 1;
    min-width: 0;
    border-radius: 0 $radius-sm $radius-sm 0;
  }

  &--bad input {
    border-color: $danger;
  }

  &__list {
    position: absolute;
    top: calc(100% + 0.3rem);
    left: 0;
    z-index: 20;
    list-style: none;
    width: min(100%, 320px);
    max-height: 260px;
    overflow-y: auto;
    background: $surface;
    border: 1px solid $line;
    border-radius: $radius-sm;
    box-shadow: $shadow-md;

    button {
      width: 100%;
      @include flex(row, center, flex-start, 0.6rem);
      padding: 0.6rem 0.8rem;
      text-align: left;
      font-size: $text-sm;

      img {
        border-radius: 3px;
      }

      small {
        margin-left: auto;
        color: $ink-muted;
      }

      &:hover,
      &.is-on {
        background: $accent-soft;
        color: $accent-deep;
      }
    }
  }

  &__error {
    flex-basis: 100%;
    margin-top: 0.35rem;
    font-size: $text-xs;
    color: $danger;
  }
}
</style>
