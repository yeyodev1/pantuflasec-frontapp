<script setup lang="ts">
import AdminShell from '@/layout/AdminShell.vue'
import { usePaymentSettings } from '@/composables/useAdminSettings'

/** Cuentas para transferencias y pago en efectivo al retirar. La tarjeta (PayPhone) se configura en el servidor. */
const { payments, loading, saving, addAccount, removeAccount, save } = usePaymentSettings()
</script>

<template>
  <AdminShell title="Métodos de pago">
    <template #actions>
      <button class="btn btn--primary" :disabled="saving || loading" @click="save">
        <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i> Guardar
      </button>
    </template>

    <p class="hint">
      Las cuentas se muestran al cliente al confirmar el pedido y le llegan por correo. Cuando suba
      el comprobante, te avisamos por correo y lo apruebas o rechazas desde el pedido. El efectivo
      solo aplica al retirar en tienda.
    </p>

    <form v-if="!loading" class="form" @submit.prevent="save">
      <fieldset class="group">
        <legend><i class="fa-solid fa-building-columns"></i> Transferencia bancaria</legend>
        <label class="check"
          ><input v-model="payments.transfer.enabled" type="checkbox" /> Aceptar
          transferencias</label
        >

        <div v-for="(a, i) in payments.transfer.accounts" :key="i" class="account">
          <div class="account__row">
            <label>Banco <input v-model="a.bank" required placeholder="Banco Pichincha" /></label>
            <label>
              Tipo
              <select v-model="a.type">
                <option>Ahorros</option>
                <option>Corriente</option>
              </select>
            </label>
            <label>Número <input v-model="a.number" required placeholder="2200123456" /></label>
          </div>
          <div class="account__row">
            <label
              >Titular
              <input v-model="a.holder" required placeholder="Nombre como aparece en el banco"
            /></label>
            <label
              >Cédula o RUC
              <input v-model="a.documentId" inputmode="numeric" placeholder="Opcional"
            /></label>
            <label>Correo <input v-model="a.email" type="email" placeholder="Opcional" /></label>
          </div>
          <button type="button" class="account__remove" @click="removeAccount(i)">
            <i class="fa-solid fa-trash"></i> Quitar cuenta
          </button>
        </div>
        <button type="button" class="btn btn--ghost" @click="addAccount">
          <i class="fa-solid fa-plus"></i> Agregar cuenta
        </button>

        <label
          >Instrucciones para el cliente
          <textarea v-model="payments.transfer.instructions" rows="2" maxlength="400"></textarea>
        </label>
      </fieldset>

      <fieldset class="group">
        <legend><i class="fa-solid fa-money-bill-wave"></i> Efectivo en tienda</legend>
        <label class="check"
          ><input v-model="payments.cash.enabled" type="checkbox" /> Aceptar pago en efectivo al
          retirar</label
        >
        <label
          >Instrucciones para el cliente
          <textarea v-model="payments.cash.instructions" rows="2" maxlength="400"></textarea>
        </label>
      </fieldset>

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
  @include flex(column, flex-start, flex-start, 1.5rem);
  max-width: 820px;
}

.group {
  width: 100%;
  border: none;
  @include flex(column, stretch, flex-start, 0.8rem);

  legend {
    @include display($text-lg, 600);
    margin-bottom: 0.4rem;

    i {
      color: $accent;
      margin-right: 0.3rem;
      font-size: 0.9rem;
    }
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

.account {
  @include card;
  padding: 0.9rem 1rem;
  @include flex(column, stretch, flex-start, 0.6rem);
  @include reveal;

  &__row {
    @include flex(column, stretch, flex-start, 0.6rem);

    @include from('sm') {
      flex-direction: row;
      > * {
        flex: 1;
      }
    }
  }

  &__remove {
    align-self: flex-end;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-muted;
    @include flex(row, center, center, 0.3rem);
    @include transition(color);

    &:hover {
      color: $danger;
    }
  }
}
</style>
