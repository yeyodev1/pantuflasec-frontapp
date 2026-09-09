<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import type { BankAccount } from '@/types'
import { formatMoney } from '@/utils/format'
import { useToastStore } from '@/stores/toast'
import { whatsappLink } from '@/config/site'

/**
 * Bloque que aparece en el checkout al elegir transferencia: las cuentas a
 * las que transferir, el total, y el comprobante con vista previa para que
 * el cliente lo verifique antes de confirmar. El archivo sube a Cloudinary
 * apenas se crea el pedido y queda amarrado a él.
 */
const props = defineProps<{ accounts: BankAccount[]; instructions: string; total: number; file: File | null; note: string }>()
const emit = defineEmits<{ 'update:file': [file: File | null]; 'update:note': [note: string] }>()

const toast = useToastStore()
const preview = ref('')

watch(
  () => props.file,
  (f) => {
    if (preview.value) URL.revokeObjectURL(preview.value)
    preview.value = f ? URL.createObjectURL(f) : ''
  },
  { immediate: true },
)
onUnmounted(() => preview.value && URL.revokeObjectURL(preview.value))

const sizeLabel = computed(() => (props.file ? `${(props.file.size / 1024 / 1024).toFixed(1)} MB` : ''))

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] ?? null
  input.value = ''
  if (f && f.size > 10 * 1024 * 1024) return toast.error('La imagen pesa más de 10 MB. Prueba con una captura.')
  emit('update:file', f)
}

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.info('Copiado')
  } catch {
    toast.error('No se pudo copiar')
  }
}
</script>

<template>
  <div class="transfer">
    <p class="transfer__step"><span>1</span> Transfiere <strong>{{ formatMoney(total) }}</strong>{{ accounts.length ? ' a una de estas cuentas' : '' }}</p>
    <ul v-if="accounts.length" class="accounts">
      <li v-for="(a, i) in accounts" :key="i" class="account">
        <img v-if="a.showLogo && a.logo?.url" :src="a.logo.url" alt="" class="account__logo" />
        <span class="account__bank">{{ a.bank }}<small v-if="a.type"> · {{ a.type }}</small></span>
        <button type="button" class="account__number" title="Copiar número" @click="copy(a.number)">
          {{ a.number }} <i class="fa-regular fa-copy"></i>
        </button>
        <span class="account__meta">{{ a.holder }}<template v-if="a.documentId"> · {{ a.documentId }}</template><template v-if="a.email"> · {{ a.email }}</template></span>
      </li>
    </ul>
    <a v-else :href="whatsappLink('Hola, quiero pagar por transferencia. ¿Me pasan los datos de la cuenta? 🙏')" class="btn btn--ghost transfer__wa" target="_blank" rel="noopener">
      <i class="fa-brands fa-whatsapp"></i> Pedir los datos de la cuenta por WhatsApp
    </a>
    <p class="transfer__hint">{{ instructions }}</p>

    <p class="transfer__step"><span>2</span> Sube la captura del comprobante y revísala</p>
    <label class="proof" :class="{ 'proof--has': file }">
      <img v-if="preview" :src="preview" alt="Vista previa del comprobante" class="proof__preview" />
      <span v-else class="proof__icon"><i class="fa-solid fa-cloud-arrow-up"></i></span>
      <span class="proof__text">
        <strong>{{ file ? file.name : 'Elegir captura o foto del comprobante' }}</strong>
        <small>{{ file ? `${sizeLabel} · toca para cambiarla` : 'JPG, PNG o captura de pantalla. Puedes subirla después desde tu pedido si aún no transfieres.' }}</small>
      </span>
      <input type="file" accept="image/*" hidden @change="onFile" />
    </label>
    <button v-if="file" type="button" class="transfer__remove" @click="emit('update:file', null)"><i class="fa-solid fa-xmark"></i> Quitar comprobante</button>
    <input :value="note" maxlength="300" placeholder="Nota (opcional): banco, hora, nombre de quien transfirió" @input="emit('update:note', ($event.target as HTMLInputElement).value)" />
  </div>
</template>

<style scoped lang="scss">
.transfer {
  @include flex(column, stretch, flex-start, 0.6rem);
  padding: 0.9rem;
  border-radius: $radius-md;
  background: $sand;

  &__step {
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    @include flex(row, center, flex-start, 0.5rem);

    span {
      flex: 0 0 1.5rem;
      height: 1.5rem;
      border-radius: $radius-pill;
      background: $highlight;
      color: $ink;
      font-size: 0.75rem;
      font-weight: 700;
      @include flex(row, center, center);
    }
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__wa {
    border-color: #25d366;
    color: #128c7e;
    align-self: flex-start;

    &:hover { background: #25d366; color: #fff; }
  }

  &__remove {
    align-self: flex-start;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-muted;
    @include flex(row, center, center, 0.3rem);

    &:hover { color: $danger; }
  }
}

.accounts {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.5rem);
}

.account {
  @include flex(column, flex-start, center, 0.15rem);
  padding: 0.7rem 0.9rem;
  border-radius: $radius-sm;
  background: $surface;

  &__logo {
    width: 2.2rem;
    height: 2.2rem;
    object-fit: contain;
    border-radius: 6px;
    background: $surface;
    margin-bottom: 0.2rem;
  }

  &__bank {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink;

    small { font-weight: 500; color: $ink-muted; }
  }

  &__number {
    font-family: $font-principal;
    font-size: $text-lg;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: $accent-deep;
    padding: 0;
    @include flex(row, center, flex-start, 0.4rem);

    i { font-size: 0.8rem; color: $ink-muted; }
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-soft;
  }
}

.proof {
  @include flex(row, center, flex-start, 0.8rem);
  margin: 0;
  padding: 0.8rem;
  border: 1.5px dashed $accent;
  border-radius: $radius-sm;
  background: $accent-soft;
  cursor: pointer;
  @include transition;

  &--has {
    border-style: solid;
    border-color: $success;
    background: $success-bg;
  }

  &__icon {
    flex: 0 0 3rem;
    height: 3rem;
    border-radius: $radius-sm;
    background: $accent;
    color: $surface;
    font-size: 1.1rem;
    @include flex(row, center, center);
  }

  &__preview {
    flex: 0 0 4.5rem;
    width: 4.5rem;
    height: 4.5rem;
    object-fit: cover;
    border-radius: $radius-sm;
    border: 1px solid $line;
    background: $surface;
  }

  &__text {
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);

    strong {
      font-size: $text-sm;
      color: $ink;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
      line-height: 1.3;
    }
  }
}
</style>
