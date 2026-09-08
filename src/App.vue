<script setup lang="ts">
import TheHeader from '@/layout/TheHeader.vue'
import TheFooter from '@/layout/TheFooter.vue'
import ToastList from '@/components/ui/ToastList.vue'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import TheWhatsApp from '@/components/ui/TheWhatsApp.vue'
import WhatsAppModal from '@/components/ui/WhatsAppModal.vue'
import ThePreloader from '@/components/ui/ThePreloader.vue'
</script>

<template>
  <div class="app">
    <TheHeader />
    <main class="app__main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter />
    <ToastList />
    <CartDrawer />
    <TheWhatsApp />
    <WhatsAppModal />
    <ThePreloader />
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>
