import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Versión del build: el commit desplegado (Vercel lo expone) o el HEAD local.
 * La app la compara contra /version.json para avisar "hay una versión nueva".
 */
function resolveVersion(): string {
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA
  if (fromVercel) return fromVercel.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return String(Date.now())
  }
}

const appVersion = resolveVersion()

/** Publica /version.json con la versión del build (y lo sirve igual en dev). */
function versionFile(): Plugin {
  const body = JSON.stringify({ version: appVersion })
  return {
    name: 'pantuflas-version-file',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: body })
    },
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(body)
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  server: {
    port: 5173,
    // Hosts desde los que se sirve el dev server a través de túneles (cloudflared).
    allowedHosts: ['.bakano.ec', '.trycloudflare.com'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Solo tokens, funciones y mixins: este archivo se antepone a CADA bloque
        // <style lang="scss">, así que nada que emita CSS puede vivir ahí.
        // El reset y las custom properties están en global.scss, que se importa
        // una sola vez desde main.ts.
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
})
