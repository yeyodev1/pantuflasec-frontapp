# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Frontend de Pantuflasec. Vue 3 + Vite + TypeScript, SCSS propio, Pinia, vue-router.
Desplegado en Vercel. El backend vive en el repo hermano `*-backapp` (Express 5 + Mongoose).

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
- **Iconos con Font Awesome por CDN** (`<i class="fa-solid fa-…">`). Sin emojis en la UI.
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
  `/admin/pedidos`, `/admin/pedidos/:id`, `/admin/usuarios`. `AdminShell` es el marco: sidebar
  en escritorio y barra inferior en móvil.
- **Carrito:** `stores/cart.ts` (Pinia + localStorage `pantuflasec.cart`). Guarda una copia de
  precio e imagen; el backend revalida al crear el pedido. `CartDrawer` se abre al agregar.
- **Checkout en dos fases** (`useCheckout`): formulario → `POST /orders` → se pinta la Cajita de
  PayPhone (`PayphoneBox.vue`, script y CSS por CDN en `index.html`). El carrito se vacía solo
  cuando `/pay-response` confirma el pago.
- **Catálogo y categorías:** etiquetas, iconos y orden en `config/catalog.ts`; estados de pedido
  en `config/orders.ts`. Deben coincidir con los enums del backapp.
- **Movimiento:** mixins `reveal` (entrada escalonada con `--i`), `lift` (hover solo con puntero
  fino) y `press` en `_mixins.scss`; keyframes `rise-in`, `bump`, `shimmer` en `global.scss`.
  Toda animación respeta `prefers-reduced-motion` por la regla global.
- **Home:** `HeroCollage` (fotos destacadas flotando con parallax de mouse), `CollectionMarquee`
  (cinta infinita de colecciones) y la directiva `v-reveal` (`useScrollReveal`) para entrar al
  hacer scroll.
- **Meta Pixel:** `utils/pixel.ts`. Sin `VITE_META_PIXEL_ID` es un no-op. Eventos: PageView por
  ruta, ViewContent, AddToCart, InitiateCheckout, Purchase (con `order_id`).
- **Fotos del catálogo importado** viven en `public/catalogo/*.webp` (URLs `/catalogo/…`),
  extraídas de los PDFs del cliente. Las fotos nuevas del admin van a Cloudinary.

## Convenciones

- `<script setup lang="ts">` siempre; orden script → template → style; `<style scoped lang="scss">`.
- Sin punto y coma, comillas simples, 2 espacios (Prettier).
- Componentes PascalCase; singletons de layout con prefijo `The`; vistas con sufijo `View`.
- BEM en clases: `.header__nav`, `.btn--primary`.
- Comentarios y copy en español; explican el porqué, no el qué.
