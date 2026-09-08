<script setup lang="ts">
import { ref } from 'vue'
import type { OrderMessage } from '@/types'
import { formatDate } from '@/utils/format'

/**
 * Conversación sobre el pedido. La misma hilera se usa en el seguimiento del
 * cliente y en el panel: solo cambia quién escribe y de qué lado se pinta.
 */
const props = defineProps<{ messages: OrderMessage[]; viewer: 'customer' | 'team'; sending?: boolean }>()
const emit = defineEmits<{ send: [text: string] }>()

const text = ref('')

function submit() {
  const clean = text.value.trim()
  if (clean.length < 2 || props.sending) return
  emit('send', clean)
  text.value = ''
}
</script>

<template>
  <section class="chat">
    <header class="chat__head">
      <h2 class="chat__title"><i class="fa-solid fa-comments"></i> {{ viewer === 'team' ? 'Mensajes con el cliente' : 'Mensajes con la tienda' }}</h2>
      <small class="chat__hint">{{ viewer === 'team' ? 'Cada respuesta le llega al cliente por correo.' : 'Te respondemos aquí y por correo.' }}</small>
    </header>

    <p v-if="!messages.length" class="chat__empty">
      {{ viewer === 'team' ? 'El cliente todavía no ha escrito.' : '¿Dudas con el pago o la entrega? Escríbenos y te respondemos.' }}
    </p>
    <ol v-else class="chat__list">
      <li
        v-for="(m, i) in messages"
        :key="i"
        class="msg"
        :class="{ 'msg--mine': m.from === viewer }"
        :style="{ '--i': i }"
      >
        <p class="msg__text">{{ m.text }}</p>
        <p class="msg__meta">{{ m.from === 'team' ? 'Pantuflasec' : 'Cliente' }} · {{ formatDate(m.at) }}</p>
      </li>
    </ol>

    <form class="chat__form" @submit.prevent="submit">
      <textarea v-model="text" rows="2" maxlength="1000" :placeholder="viewer === 'team' ? 'Escribe la respuesta…' : 'Escribe tu mensaje…'"></textarea>
      <button class="btn btn--primary" :disabled="sending || text.trim().length < 2">
        <i :class="sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'"></i> Enviar
      </button>
    </form>
  </section>
</template>

<style scoped lang="scss">
.chat {
  @include card;
  padding: 1rem 1.1rem;
  @include flex(column, stretch, flex-start, 0.8rem);
  @include reveal;

  &__head {
    @include flex(column, flex-start, center, 0.2rem);
  }

  &__title {
    @include eyebrow;
    @include flex(row, center, flex-start, 0.4rem);
  }

  &__hint,
  &__empty {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__empty {
    font-size: $text-sm;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.5rem);
    max-height: 22rem;
    overflow-y: auto;
  }

  &__form {
    @include flex(column, stretch, flex-start, 0.5rem);

    @include from('sm') {
      flex-direction: row;
      align-items: flex-end;

      textarea {
        flex: 1;
      }
    }
  }
}

.msg {
  max-width: 85%;
  align-self: flex-start;
  padding: 0.6rem 0.85rem;
  border-radius: $radius-md;
  border-bottom-left-radius: 4px;
  background: $sand;
  @include reveal(0.4s, 0.03s);

  &--mine {
    align-self: flex-end;
    background: $accent-soft;
    border-bottom-left-radius: $radius-md;
    border-bottom-right-radius: 4px;
  }

  &__text {
    font-size: $text-sm;
    color: $ink;
    white-space: pre-line;
  }

  &__meta {
    margin-top: 0.2rem;
    font-size: 0.65rem;
    color: $ink-muted;
  }
}
</style>
