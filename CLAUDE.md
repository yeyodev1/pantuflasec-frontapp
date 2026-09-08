# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Frontend de Pantuflasec. Vue 3 + Vite + TypeScript, SCSS propio, Pinia, vue-router.
Desplegado en Vercel: `https://pantuflas.ec` (alias `https://dev-project-front.bakano.ec`) (proyecto `pantuflasec-frontapp`).
El backend vive en el repo hermano `*-backapp` (Express 5 + Mongoose).

## Comandos

```sh
pnpm install
pnpm dev          # :5173 — necesita el backapp en :8100
pnpm build        # vue-tsc -b && vite build (el type-check corre acá)
pnpm typecheck
pnpm format
```

No hay suite de tests. La verificación es `pnpm build` + revisión en navegador.
Si vite sirve código viejo tras un cambio grande: `rm -rf node_modules/.vite && pnpm dev --force`.

## Reglas duras

- **Mobile first.** Estilos base para móvil; los breakpoints solo agrandan con
  `@include from('md')`. `until()` es la excepción, no el punto de partida.
- **Ningún archivo pasa de 300 líneas** (`.vue` completo, `.ts`, `.scss`). La salida no es
  partirlo en dos de 290: es sacar la lógica a un composable y dejar un componente que solo compone.
- **Layout con flexbox.** Para "grillas" usar el mixin `flex-cards($basis, $gap)`.
- **Nada de librerías UI ni Tailwind.** SCSS propio con los tokens de `src/styles/`.
- **Paleta = logo.** `colorVariables.module.scss`: azul del letrero (`$accent`) para acciones,
  amarillo (`$highlight`) para resaltar, rojo de "Ecuador" (`$price`) para precios y eyebrows,
  azul marino (`$ink`) para texto. Nada de fucsia.
- **Iconos con Font Awesome por CDN** (`<i class="fa-solid fa-…">`). Sin emojis en la UI.
- **Logo y favicon vienen de Cloudinary** (`config/site.ts` → `logo.*`, transformaciones en la URL).
  No hay imágenes en `public/`.
- **Sin cuentas de cliente.** El login (`/login`, enlace discreto "Admin" en el footer) es para el
  equipo. Roles en `meta.roles` de cada ruta: `admin` (todo) y `staff` (vendedor: solo pedidos).
  Al entrar, cada rol va a `userStore.home`. El sidebar (`AdminShell`) filtra sus enlaces por rol y
  en escritorio es fijo a toda la altura; el panel no muestra el pie de la tienda. El detalle de
  pedido tiene `OrderTimeline` (historial) y los botones de contacto anotan un evento antes de abrir.
- **Teléfonos** siempre en E.164 vía `PhoneField` (selector de país con bandera de flagcdn,
  Ecuador por defecto, `utils/phone.ts` parsea y valida). Úsalo en cualquier formulario con celular.
- **Fotos de producto:** máximo 5 (validado en el editor y en el backend). En la página de producto
  hay lupa al pasar el mouse (`ProductZoom`) y visor a pantalla completa (`ImageLightbox`).
- **Carrito:** `CartDrawer` es a pantalla completa; agregar no muestra toast, resalta la línea nueva.
  `QuickAdd` en cada tarjeta agrega sin entrar al producto (selector de talla si hay variantes). Los clientes siguen sus compras en `/mis-pedidos`: tokens guardados en localStorage
  (`utils/myOrders.ts`) al pagar o al abrir un enlace, más un formulario que pide los enlaces por correo.
- **Menú a pantalla completa** (`layout/TheMenu.vue`) abierto desde el header; el admin ve un
  botón "Pedidos" con contador (`useOrdersSummary`) en el header y en el menú. La sección de
  usuarios existe en `/admin/usuarios` pero no está en el sidebar por decisión del cliente.
- **WhatsApp con contexto** (`useWhatsApp`): el botón flotante, el menú, el footer, el home, la
  página de producto y el checkout abren `WhatsAppModal` con el mensaje armado según dónde esté el
  cliente (producto abierto con variante y cantidad; carrito + datos guardados del checkout; o
  consulta general). Los mensajes de WhatsApp llevan emojis; la UI nunca. El modal avisa que no se
  modifique el mensaje. Datos del cliente en localStorage (`utils/customer.ts`).
- **Cargas:** los GET de `httpBase` se reintentan dos veces ante 503 o caída de red. Al cambiar de
  vista hay barra de progreso arriba (`TheRouteBar`) y las vistas muestran `SkeletonBox` mientras
  llegan datos (producto, tira de galería, categorías, catálogo). Nada de textos "Cargando…".
- **Preloader** (`ThePreloader.vue` + `usePreloader`): pantalla amarilla con el logo hasta que
  el router resolvió la vista, cargaron fuentes y página, y terminó todo lo registrado con
  `track()` (collage, tira de galería, portadas de categorías, primeras fotos del catálogo, foto
  principal del producto, vía `waitForImages`). Mínimo 0,7 s, máximo 6 s. Un bloque nuevo con
  imágenes de primera pintura debe registrar su carga con `track()`.
- **El copy vive en `src/config/site.ts`**, no dentro de los componentes.
- Todo `VITE_*` queda expuesto en el navegador: nunca un secreto con ese prefijo.

## Estilos: la trampa de `additionalData`

`vite.config.ts` antepone `@/styles/index.scss` a **cada** bloque `<style lang="scss">`.
Por eso `index.scss` solo puede contener cosas que **no emiten CSS**: variables, `@forward`,
funciones y mixins. Un solo selector ahí se duplica en el CSS de todos los componentes.

Todo lo que emite CSS (reset, `html`/`body`, custom properties, `.btn`, transiciones) va en
`global.scss`, importado una única vez desde `main.ts`. Las fuentes se cargan con `<link>`
en `index.html`.

En componentes: `$ink`, `$accent`, `@include from('md')`, `@include container` — sin `@use`.

## Arquitectura

- **Routes** (`src/router/index.ts`) — lazy imports, `meta.title`, `meta.requiresAuth`; el
  título se aplica en `afterEach`.
- **Services** (`src/services/`) — `class XService extends APIBase`, `export const xService`.
  `httpBase.ts` resuelve la URL del API (env → localhost → túnel `-front`/`-back` → prod),
  pone el Bearer de `localStorage.access_token` y emite `auth:token-expired` en 401.
- **Stores** (`src/stores/`) — Pinia options API. `user.ts` guarda la sesión y `restore()`
  la verifica contra `/auth/me` al arrancar.
- **Composables** — estado de módulo (`ref` fuera de la función) para estado UI compartido.
- **Errores del API** — siempre `{ status, message, data? }` (`ApiError`); el `message` viene
  en español desde el backend y se puede mostrar tal cual en un toast.

## La tienda

- **Rutas públicas:** `/tienda` (catálogo, filtros en la query string: `q`, `categoria`, `coleccion`,
  `orden`, `pagina`), `/producto/:slug`, `/checkout`, `/pay-response` (vuelta de PayPhone),
  `/pedido/:token`. **Admin** (`requiresAdmin`): `/admin/productos`, `/admin/productos/:slug|nuevo`,
  `/admin/pedidos`, `/admin/pedidos/:id`, `/admin/usuarios`, `/admin/portada`, `/admin/galeria`,
  `/admin/pagos`, `/admin/archivos`. `AdminShell` es el marco: sidebar en escritorio y barra
  inferior en móvil.
- **Carrito:** `stores/cart.ts` (Pinia + localStorage `pantuflasec.cart`). Guarda una copia de
  precio e imagen; el backend revalida al crear el pedido. `CartDrawer` se abre al agregar.
- **Checkout en dos fases** (`useCheckout`): formulario (datos, entrega, **pago** con
  `PaymentOptions`) → `POST /orders`. Con tarjeta se pinta la Cajita de PayPhone
  (`PayphoneBox.vue`, script y CSS por CDN en `index.html`) y el carrito se vacía solo cuando
  `/pay-response` confirma. Con transferencia o efectivo el pedido queda reservado, el carrito se
  vacía y se va a `/pedido/:token?nuevo=1`. Efectivo solo aparece con retiro en tienda; la lista de
  métodos sale de `/orders/config` (`payments`, editable en `/admin/pagos`).
- **Precios con IVA incluido.** `taxIncluded` viene del backend: el resumen muestra "Incluye IVA"
  en gris y no lo suma. Nunca volver a sumar IVA en el front.
- **Página del pedido** (`OrderView`): `OrderPaymentPanel` (cuentas con botón de copiar, subir
  comprobante, estado en revisión/rechazado con motivo, instrucciones de efectivo) y
  `OrderMessages` (hilera cliente ↔ equipo, misma pieza que usa el panel con `viewer="team"`).
  En el admin, `PaymentReview` aprueba o rechaza (con motivo) y `AdminOrdersView` tiene el chip
  "Comprobantes por revisar" (`pay=review`). Etiquetas de métodos y estados de pago en `config/orders.ts`.
- **Catálogo y categorías:** etiquetas, iconos y orden en `config/catalog.ts`; estados de pedido
  en `config/orders.ts`. Deben coincidir con los enums del backapp.
- **Movimiento:** mixins `reveal` (entrada escalonada con `--i`), `lift` (hover solo con puntero
  fino) y `press` en `_mixins.scss`; keyframes `rise-in`, `bump`, `shimmer` en `global.scss`.
  Toda animación respeta `prefers-reduced-motion` por la regla global.
- **Home:** `HeroBanner` (portada del admin en `/admin/portada`: foto grande + título + botón; si
  está apagada cae a `HeroCollage`, fotos flotando con parallax de mouse), `HomeGallery` (dos
  filas de fotos en loop opuesto con parallax de scroll; usa la galería del admin y cae a
  destacados), `CollectionMarquee` (cinta infinita de colecciones) y la directiva `v-reveal`
  (`useScrollReveal`) para entrar al hacer scroll. La sección "Recién llegados" lista solo
  productos con `newArrival`.
- **Sección "Nuevo":** `newArrival` en el producto (checkbox en el editor), badge rojo en la
  tarjeta, chip amarillo en los filtros, `/tienda?nuevo=1` en header, menú y "Ver todo".
- **Redes:** `socialLinks` en `config/site.ts` (Instagram, TikTok, Facebook) alimenta menú y pie.
- **Meta Pixel:** `utils/pixel.ts`. Sin `VITE_META_PIXEL_ID` es un no-op. Eventos: PageView por
  ruta, ViewContent, AddToCart, InitiateCheckout, Purchase (con `order_id`).
- **Fotos: solo Cloudinary.** `public/catalogo/` está en `.gitignore` y no debe volver al repo
  (se purgó del historial). El admin sube y elige fotos en `/admin/archivos` (`useMediaLibrary`,
  `MediaGrid`, `MediaPicker`); el editor de producto abre la biblioteca con "Elegir de la biblioteca".

## Convenciones

- `<script setup lang="ts">` siempre; orden script → template → style; `<style scoped lang="scss">`.
- Sin punto y coma, comillas simples, 2 espacios (Prettier).
- Componentes PascalCase; singletons de layout con prefijo `The`; vistas con sufijo `View`.
- BEM en clases: `.header__nav`, `.btn--primary`.
- Comentarios y copy en español; explican el porqué, no el qué.
