import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Where the API lives during development. */
const BACKEND_ORIGIN = process.env.VITE_DEV_BACKEND || 'http://localhost:5000'

/**
 * The origin the backend's CORS allowlist accepts — its own `FRONTEND_URL`.
 *
 * The dev server may be on any assigned port, which would never match, so the
 * proxy presents this instead. `changeOrigin` only rewrites `Host`; the CORS
 * check reads `Origin`, so that header has to be set explicitly.
 */
const ALLOWED_ORIGIN = process.env.VITE_DEV_ALLOWED_ORIGIN || 'http://localhost:3000'

const withAllowedOrigin = (proxy) => {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.setHeader('origin', ALLOWED_ORIGIN)
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Honour a PORT assigned by the environment; fall back to Vite's default.
    // Without this, a port picked for us is ignored and startup collides with
    // whatever already holds 5173.
    port: Number(process.env.PORT) || 5173,

    // Proxy the API and socket through the dev server so requests are
    // same-origin from the browser's point of view.
    proxy: {
      '/api': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        configure: withAllowedOrigin,
      },
      '/socket.io': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        ws: true,
        configure: withAllowedOrigin,
      },
    },
  },
})
