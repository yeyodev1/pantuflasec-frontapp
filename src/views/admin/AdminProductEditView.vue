<script setup lang="ts">
import AdminShell from '@/layout/AdminShell.vue'
import VariantsEditor from '@/components/admin/VariantsEditor.vue'
import ImagesEditor from '@/components/admin/ImagesEditor.vue'
import { useProductForm } from '@/composables/useProductForm'
import { categories } from '@/config/catalog'
import PriceFields from '@/components/admin/PriceFields.vue'

const { draft, id, loading, saving, error, save, addVariant, removeVariant } = useProductForm()
</script>

<template>
  <AdminShell :title="id ? 'Editar producto' : 'Nuevo producto'">
    <template #actions>
      <RouterLink to="/admin/productos" class="btn btn--ghost">Volver</RouterLink>
    </template>

    <p v-if="loading" class="hint">Cargando…</p>
    <form v-else class="form" @submit.prevent="save">
      <fieldset class="form__group">
        <legend>Básico</legend>
        <label>Nombre <input v-model="draft.name" required /></label>
        <div class="form__row">
          <label>
            Categoría
            <select v-model="draft.category">
              <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
            </select>
          </label>
          <label
            >Colección / licencia
            <input v-model="draft.collection" placeholder="Stitch, Snoopy, Sanrio…"
          /></label>
        </div>
        <PriceFields v-model="draft.price" required />
        <label
          >Precio anterior (tachado, opcional)
          <input v-model="draft.compareAtPrice" type="number" step="0.01" min="0" placeholder="Precio que veía el cliente antes de la oferta"
        /></label>
        <label>Descripción <textarea v-model="draft.description" rows="4"></textarea></label>
        <label
          >Etiquetas (separadas por coma)
          <input v-model="draft.tags" placeholder="disney, niños, regalo"
        /></label>
      </fieldset>

      <ImagesEditor :images="draft.images" />
      <VariantsEditor :variants="draft.variants" @add="addVariant" @remove="removeVariant" />

      <fieldset class="form__group">
        <legend>Visibilidad</legend>
        <div class="form__row form__row--checks">
          <label class="check"
            ><input v-model="draft.isActive" type="checkbox" /> Visible en la tienda</label
          >
          <label class="check"><input v-model="draft.featured" type="checkbox" /> Destacado</label>
          <label class="check"><input v-model="draft.newArrival" type="checkbox" /> Nuevo (sección "Nuevo")</label>
          <label class="check"><input v-model="draft.showOnHome" type="checkbox" /> Mostrar en el inicio</label>
          <label>Orden <input v-model="draft.sortOrder" type="number" step="1" /></label>
        </div>
      </fieldset>

      <p v-if="error" class="form__error">
        <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
      </p>

      <div class="form__actions">
        <button class="btn btn--primary" :disabled="saving">
          <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i> Guardar
        </button>
        <RouterLink
          v-if="id"
          :to="`/producto/${$route.params.slug}`"
          class="btn btn--ghost"
          target="_blank"
        >
          Ver en la tienda
        </RouterLink>
      </div>
    </form>
  </AdminShell>
</template>

<style scoped lang="scss">
.hint {
  color: $ink-muted;
}

.form {
  @include flex(column, stretch, flex-start, 1.5rem);
  max-width: 820px;

  &__group {
    border: none;
    @include flex(column, stretch, flex-start, 0.8rem);

    legend {
      @include display($text-lg, 600);
      margin-bottom: 0.4rem;
    }
  }

  &__row {
    @include flex(column, stretch, flex-start, 0.8rem);

    @include from('sm') {
      flex-direction: row;

      > * {
        flex: 1;
      }
    }

    &--checks {
      align-items: center;
    }
  }

  &__error {
    color: $danger;
    font-size: $text-sm;
  }

  &__actions {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;
  }
}

.check {
  @include flex(row, center, flex-start, 0.5rem);
  font-size: $text-sm;
  color: $ink;

  input {
    width: auto;
  }
}
</style>
