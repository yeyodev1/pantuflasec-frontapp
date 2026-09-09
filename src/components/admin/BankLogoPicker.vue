<script setup lang="ts">
import { ref, watch } from 'vue'
import { settingService } from '@/services/setting.service'
import { useToastStore } from '@/stores/toast'
import { mediaService } from '@/services/upload.service'
import type { ApiError, BrandCandidate } from '@/types'

/**
 * Elegir el logo de un banco: busca en Brandfetch por el nombre y muestra los
 * candidatos; al elegir uno se copia a Cloudinary. Si Brandfetch no está
 * configurado o no lo encuentra, se sube una imagen a mano.
 */
const props = defineProps<{ open: boolean; bank: string }>()
const emit = defineEmits<{ pick: [logo: { url: string; publicId: string }]; close: [] }>()

const toast = useToastStore()
const query = ref('')
const items = ref<BrandCandidate[]>([])
const searching = ref(false)
const importing = ref('')
const notice = ref('')

async function search() {
  const q = query.value.trim()
  if (q.length < 2) return
  searching.value = true
  notice.value = ''
  try {
    const r = await settingService.searchBankLogo(q)
    items.value = r.items
    if (!r.items.length) notice.value = 'Brandfetch no encontró ese banco. Prueba con otro nombre o sube el logo a mano.'
  } catch (e) {
    items.value = []
    notice.value = (e as ApiError).message
  } finally {
    searching.value = false
  }
}

async function choose(c: BrandCandidate) {
  importing.value = c.domain
  try {
    emit('pick', await settingService.importBankLogo(c))
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    importing.value = ''
  }
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  importing.value = 'upload'
  try {
    emit('pick', await mediaService.upload(file, 'bancos'))
  } catch (err) {
    toast.error((err as ApiError).message)
  } finally {
    importing.value = ''
  }
}

watch(
  () => props.open,
  (o) => {
    if (!o) return
    query.value = props.bank
    items.value = []
    notice.value = ''
    if (props.bank.trim().length >= 2) void search()
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="picker" @click.self="emit('close')">
        <div class="picker__box" role="dialog" aria-modal="true" aria-label="Logo del banco">
          <header class="picker__head">
            <h3>Logo del banco</h3>
            <button type="button" aria-label="Cerrar" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
          </header>
          <div class="picker__body">
            <form class="picker__search" @submit.prevent="search">
              <input v-model="query" placeholder="Nombre del banco, ej. Banco Pichincha" />
              <button class="btn btn--primary" :disabled="searching"><i :class="searching ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-magnifying-glass'"></i> Buscar</button>
            </form>
            <p v-if="notice" class="picker__notice"><i class="fa-solid fa-circle-info"></i> {{ notice }}</p>
            <ul v-if="items.length" class="brands">
              <li v-for="c in items" :key="c.domain">
                <button type="button" class="brand" :disabled="Boolean(importing)" @click="choose(c)">
                  <img :src="c.icon" alt="" />
                  <span><strong>{{ c.name }}</strong><small>{{ c.domain }}</small></span>
                  <i :class="importing === c.domain ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-chevron-right'"></i>
                </button>
              </li>
            </ul>
            <label class="btn btn--ghost picker__upload">
              <i :class="importing === 'upload' ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'"></i> Subir logo a mano
              <input type="file" accept="image/*" hidden :disabled="Boolean(importing)" @change="onFile" />
            </label>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.picker {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: $overlay;
  @include flex(column, center, flex-end);

  @include from('sm') {
    justify-content: center;
    padding: 1rem;
  }

  &__box {
    width: 100%;
    max-width: 520px;
    max-height: 92vh;
    background: $paper;
    border-radius: $radius-md $radius-md 0 0;
    @include flex(column, stretch, flex-start);
    box-shadow: $shadow-lg;

    @include from('sm') {
      border-radius: $radius-md;
    }
  }

  &__head {
    @include flex(row, center, space-between);
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid $line;

    h3 { @include display($text-lg, 600); }
    button { width: 2.2rem; height: 2.2rem; font-size: 1.1rem; }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.1rem calc(1rem + env(safe-area-inset-bottom));
    @include flex(column, stretch, flex-start, 0.8rem);
  }

  &__search {
    @include flex(row, center, flex-start, 0.5rem);
    input { flex: 1; }
    .btn { padding: 0.7rem 1rem; }
  }

  &__notice {
    font-size: $text-xs;
    color: $warning;
    @include flex(row, flex-start, flex-start, 0.4rem);
  }

  &__upload {
    cursor: pointer;
    align-self: flex-start;
  }
}

.brands {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.4rem);
}

.brand {
  width: 100%;
  @include flex(row, center, flex-start, 0.7rem);
  text-align: left;
  padding: 0.55rem 0.7rem;
  border: 1px solid $line;
  border-radius: $radius-sm;
  background: $surface;
  @include transition;
  @include press;

  &:hover { border-color: $accent; background: $accent-soft; }

  img { width: 2.4rem; height: 2.4rem; object-fit: contain; border-radius: 8px; background: $sand; }
  span { flex: 1; min-width: 0; @include flex(column, flex-start, center); }
  strong { font-size: $text-sm; }
  small { font-size: $text-xs; color: $ink-muted; }
  > i { color: $ink-muted; font-size: 0.8rem; }
}
</style>
