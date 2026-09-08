<script setup lang="ts">
import AdminShell from '@/layout/AdminShell.vue'
import { useShippingSettings } from '@/composables/useAdminSettings'

/**
 * Métodos de entrega que ve el cliente en el checkout: retiros en tienda y
 * envíos con su precio. Sirve para tarifas por zona (por ejemplo las de
 * flores amarillas) sin tocar código.
 */
const { methods, loading, saving, add, remove, move, save } = useShippingSettings()
</script>

<template>
  <AdminShell title="Métodos de entrega">
    <template #actions>
      <button class="btn btn--primary" :disabled="saving || loading" @click="save">
        <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i> Guardar
      </button>
    </template>

    <p class="hint">
      Cada fila es una opción del checkout, en este orden. Un <strong>envío</strong> lleva precio y descripción (zona, courier,
      tiempo); un <strong>retiro</strong> lleva la dirección de la tienda y es gratis. Apaga una opción para ocultarla sin borrarla.
      El pago en efectivo solo aparece con retiros.
    </p>

    <form v-if="!loading" class="form" @submit.prevent="save">
      <div v-for="(m, i) in methods" :key="i" class="method" :class="{ 'method--off': !m.enabled }" :style="{ '--i': i % 10 }">
        <div class="method__row">
          <label class="method__kind">
            Tipo
            <select v-model="m.kind">
              <option value="delivery">Envío</option>
              <option value="pickup">Retiro en tienda</option>
            </select>
          </label>
          <label class="method__grow">Nombre <input v-model="m.label" required maxlength="80" placeholder="Envío flores amarillas · Norte de Guayaquil" /></label>
          <label v-if="m.kind === 'delivery'" class="method__cost">Precio ($) <input v-model="m.cost" type="number" step="0.01" min="0" required /></label>
        </div>
        <div class="method__row">
          <label v-if="m.kind === 'delivery'" class="method__grow">
            Descripción <input v-model="m.description" maxlength="160" placeholder="Entrega el mismo día, de 10:00 a 18:00" />
          </label>
          <template v-else>
            <label class="method__grow">Dirección <input v-model="m.address" required maxlength="160" placeholder="Av. Agustín Freire, frente al Garzocentro" /></label>
            <label>Ciudad <input v-model="m.city" required maxlength="60" placeholder="Guayaquil" /></label>
            <label class="method__grow">Nota <input v-model="m.description" maxlength="160" placeholder="Te avisamos cuando esté listo." /></label>
          </template>
        </div>
        <div class="method__actions">
          <label class="check"><input v-model="m.enabled" type="checkbox" /> Activo</label>
          <span class="method__spacer"></span>
          <button type="button" class="pill" title="Subir" :disabled="i === 0" @click="move(i, -1)"><i class="fa-solid fa-arrow-up"></i></button>
          <button type="button" class="pill" title="Bajar" :disabled="i === methods.length - 1" @click="move(i, 1)"><i class="fa-solid fa-arrow-down"></i></button>
          <button type="button" class="pill pill--danger" title="Quitar" @click="remove(i)"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>

      <div class="form__add">
        <button type="button" class="btn btn--ghost" @click="add('delivery')"><i class="fa-solid fa-plus"></i> Agregar envío</button>
        <button type="button" class="btn btn--ghost" @click="add('pickup')"><i class="fa-solid fa-store"></i> Agregar retiro</button>
      </div>

      <button class="btn btn--primary" :disabled="saving">
        <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i> Guardar
      </button>
    </form>
    <p v-else class="hint">Cargando…</p>
  </AdminShell>
</template>

<style scoped lang="scss">
.hint {
  font-size: $text-xs;
  color: $ink-muted;
}

.form {
  @include flex(column, flex-start, flex-start, 1rem);
  max-width: 900px;

  &__add {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }
}

.method {
  width: 100%;
  @include card;
  padding: 0.9rem 1rem;
  @include flex(column, stretch, flex-start, 0.6rem);
  @include reveal(0.4s, 0.03s);
  @include transition(opacity);

  &--off {
    opacity: 0.55;
  }

  &__row {
    @include flex(column, stretch, flex-start, 0.6rem);

    @include from('sm') {
      flex-direction: row;
      align-items: flex-end;
    }
  }

  &__grow {
    flex: 1;
  }

  &__kind {
    @include from('sm') {
      flex: 0 0 11rem;
    }
  }

  &__cost {
    @include from('sm') {
      flex: 0 0 7rem;
    }
  }

  &__actions {
    @include flex(row, center, flex-start, 0.3rem);
  }

  &__spacer {
    flex: 1;
  }
}

.check {
  @include flex(row, center, flex-start, 0.5rem);
  font-size: $text-sm;
  color: $ink;
  margin: 0;

  input {
    width: auto;
  }
}

.pill {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  color: $ink-muted;
  font-size: 0.8rem;
  @include flex(row, center, center);
  @include transition;
  @include press;

  &--danger:hover {
    color: $danger;
    border-color: $danger;
  }

  &:disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}
</style>
