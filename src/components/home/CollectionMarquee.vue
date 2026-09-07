<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { productService } from '@/services/product.service'

/** Cinta infinita con las colecciones. Se duplica la lista para el loop sin salto. */
const names = ref<string[]>([])
const loop = computed(() => [...names.value, ...names.value])

onMounted(async () => {
  try {
    names.value = (await productService.facets()).collections.slice(0, 18).map((c) => c.name)
  } catch {
    names.value = []
  }
})
</script>

<template>
  <div v-if="names.length" class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <RouterLink
        v-for="(n, i) in loop"
        :key="`${n}-${i}`"
        :to="{ path: '/tienda', query: { coleccion: n } }"
        class="marquee__item"
      >
        <i class="fa-solid fa-star"></i> {{ n }}
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.marquee {
  overflow: hidden;
  border-block: 1px solid $line;
  background: $surface;
  padding-block: 0.7rem;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);

  &__track {
    display: flex;
    gap: 2.2rem;
    width: max-content;
    animation: marquee 40s linear infinite;

    &:hover {
      animation-play-state: paused;
    }
  }

  &__item {
    @include eyebrow;
    @include flex(row, center, center, 0.5rem);
    white-space: nowrap;
    color: $ink-soft;
    @include transition(color);

    i {
      font-size: 0.55rem;
      color: $accent;
    }

    &:hover {
      color: $accent-deep;
    }
  }
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
</style>
