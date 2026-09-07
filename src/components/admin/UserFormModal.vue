<script setup lang="ts">
import { toRef } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'
import type { UserInput } from '@/services/user.service'

const props = defineProps<{ open: boolean; editing: boolean; form: UserInput; saving: boolean }>()
const emit = defineEmits<{ save: []; close: [] }>()

useBodyScroll(toRef(props, 'open'))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="emit('close')">
        <form class="modal__box" role="dialog" aria-modal="true" @submit.prevent="emit('save')">
          <h3 class="modal__title">{{ editing ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
          <label>Correo <input v-model="form.email" type="email" required :disabled="editing" autocomplete="off" /></label>
          <label>Nombre <input v-model="form.name" autocomplete="off" /></label>
          <label>Celular <input v-model="form.phone" type="tel" autocomplete="off" /></label>
          <label>
            Tipo de cuenta
            <select v-model="form.accountType">
              <option value="customer">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <label>
            {{ editing ? 'Nueva contraseña (opcional)' : 'Contraseña' }}
            <input v-model="form.password" type="password" :required="!editing" minlength="8" autocomplete="new-password" />
          </label>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
            <button class="btn btn--primary" :disabled="saving">
              <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i> Guardar
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: $overlay;
  @include flex(column, center, flex-end);
  padding: 1rem;

  @include from('sm') {
    justify-content: center;
  }

  &__box {
    width: 100%;
    max-width: 440px;
    background: $paper;
    border-radius: $radius-md;
    padding: 1.4rem 1.3rem calc(1.3rem + env(safe-area-inset-bottom));
    @include flex(column, stretch, flex-start, 0.8rem);
    box-shadow: $shadow-lg;
  }

  &__title {
    @include display($text-xl, 600);
    margin-bottom: 0.2rem;
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
    margin-top: 0.4rem;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;

  .modal__box {
    transition: transform 0.3s $ease;
  }
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__box {
    transform: translateY(20px);
  }
}
</style>
