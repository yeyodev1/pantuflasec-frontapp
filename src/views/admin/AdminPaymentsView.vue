<script setup lang="ts">
import { ref } from 'vue'
import AdminShell from '@/layout/AdminShell.vue'
import BankLogoPicker from '@/components/admin/BankLogoPicker.vue'
import { usePaymentSettings } from '@/composables/useAdminSettings'

/** Cuentas para transferencias y pago en efectivo al retirar. La tarjeta (PayPhone) se configura en el servidor. */
const { payments, loading, saving, addAccount, removeAccount, save } = usePaymentSettings()

/** Índice de la cuenta cuyo logo se está eligiendo; null = cerrado. */
const logoFor = ref<number | null>(null)

function setLogo(logo: { url: string; publicId: string }) {
  const a = logoFor.value === null ? null : payments.transfer.accounts[logoFor.value]
  if (a) {
    a.logo = logo
    a.showLogo = true
  }
  logoFor.value = null
}
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
          <div class="account__logo">
            <img v-if="a.logo?.url" :src="a.logo.url" alt="" :class="{ 'account__img--off': !a.showLogo }" />
            <span v-else class="account__noimg"><i class="fa-solid fa-building-columns"></i></span>
            <div class="account__logo-actions">
              <button type="button" class="btn btn--ghost" @click="logoFor = i"><i class="fa-solid fa-magnifying-glass"></i> {{ a.logo?.url ? 'Cambiar logo' : 'Buscar logo' }}</button>
              <label v-if="a.logo?.url" class="check"><input v-model="a.showLogo" type="checkbox" /> Mostrar al cliente</label>
              <button v-if="a.logo?.url" type="button" class="account__remove" @click="a.logo = { url: '', publicId: '' }"><i class="fa-solid fa-xmark"></i> Quitar logo</button>
            </div>
          </div>
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

    <BankLogoPicker
      :open="logoFor !== null"
      :bank="logoFor === null ? '' : (payments.transfer.accounts[logoFor]?.bank ?? '')"
      @pick="setLogo"
      @close="logoFor = null"
    />
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

  &__logo {
    @include flex(row, center, flex-start, 0.8rem);
    flex-wrap: wrap;

    img,
    .account__noimg {
      width: 3rem;
      height: 3rem;
      border-radius: $radius-sm;
      object-fit: contain;
      background: $sand;
      border: 1px solid $line;
    }

    .account__noimg {
      @include flex(row, center, center);
      color: $ink-muted;
    }

    .account__img--off { opacity: 0.4; }
  }

  &__logo-actions {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;

    .btn { padding: 0.45rem 0.9rem; font-size: $text-xs; }
    .check { margin: 0; }
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
