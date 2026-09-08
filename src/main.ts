import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { initPixel, pixel } from '@/utils/pixel'
import { vReveal } from '@/composables/useScrollReveal'
import '@/styles/global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.directive('reveal', vReveal)

const userStore = useUserStore(pinia)

// httpBase emite este evento al recibir un 401: la sesión caducó.
window.addEventListener('auth:token-expired', () => {
  userStore.clear()
  if (router.currentRoute.value.meta.requiresAuth) {
    router.replace({ name: 'Login', query: { next: router.currentRoute.value.fullPath } })
  }
})

// Con token guardado se restaura la sesión al abrir cualquier página (el admin ve
// su acceso a pedidos desde la portada, no solo en rutas protegidas).
if (userStore.hasToken) userStore.restore()

initPixel()
router.afterEach(() => pixel.pageView())

app.mount('#app')
