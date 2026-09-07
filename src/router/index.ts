import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { site } from '@/config/site'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: site.name },
  },
  {
    path: '/tienda',
    name: 'Catalog',
    component: () => import('@/views/CatalogView.vue'),
    meta: { title: 'Tienda' },
  },
  {
    path: '/producto/:slug',
    name: 'Product',
    component: () => import('@/views/ProductView.vue'),
    meta: { title: 'Producto' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { title: 'Finalizar compra' },
  },
  {
    path: '/pay-response',
    name: 'PayResponse',
    component: () => import('@/views/PayResponseView.vue'),
    meta: { title: 'Confirmando pago' },
  },
  {
    path: '/pedido/:code',
    name: 'Order',
    component: () => import('@/views/OrderView.vue'),
    meta: { title: 'Tu pedido' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Ingresar', guestOnly: true },
  },
  {
    path: '/cuenta',
    name: 'Account',
    component: () => import('@/views/AccountView.vue'),
    meta: { title: 'Mi cuenta', requiresAuth: true },
  },
  {
    path: '/admin',
    redirect: '/admin/productos',
  },
  {
    path: '/admin/productos',
    name: 'AdminProducts',
    component: () => import('@/views/admin/AdminProductsView.vue'),
    meta: { title: 'Productos', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/productos/:slug',
    name: 'AdminProductEdit',
    component: () => import('@/views/admin/AdminProductEditView.vue'),
    meta: { title: 'Editar producto', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/pedidos',
    name: 'AdminOrders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: { title: 'Pedidos', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsers',
    component: () => import('@/views/admin/AdminUsersView.vue'),
    meta: { title: 'Usuarios', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/archivos',
    name: 'AdminMedia',
    component: () => import('@/views/admin/AdminMediaView.vue'),
    meta: { title: 'Archivos', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/pedidos/:id',
    name: 'AdminOrder',
    component: () => import('@/views/admin/AdminOrderView.vue'),
    meta: { title: 'Pedido', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Con "atrás" el navegador devuelve la posición guardada; con un hash se
  // baja a la sección; si no, arriba.
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { left: 0, top: 0 }
  },
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth || to.meta.guestOnly) {
    // La sesión se verifica contra el API una sola vez por carga.
    await userStore.restore()
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'Login', query: { next: to.fullPath }, replace: true }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { name: 'Account', replace: true }
  }

  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return { name: 'Account', replace: true }
  }
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title && title !== site.name ? `${title} — ${site.name}` : site.name
})

export default router
