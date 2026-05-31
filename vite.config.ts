import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Prevent admin emails from being baked into any non-development bundle.
  // The admins table in Supabase is the correct authorisation mechanism.
  if (process.env.VITE_ADMIN_EMAILS && mode !== 'development') {
    throw new Error(
      '[BakeVault] VITE_ADMIN_EMAILS is only allowed in development mode. ' +
      'It exposes admin emails in the client bundle. ' +
      'Use the admins table in Supabase instead.'
    )
  }

  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html
            .replace('__WHATSAPP_NUMBER__', process.env.VITE_WHATSAPP_NUMBER ?? '+2349064652679')
            .replace('__CONTACT_EMAIL__', process.env.VITE_CONTACT_EMAIL ?? 'sales@bakevault.com.ng')
        }
      }
    ],
    server: {
      port: 3000,
      host: 'localhost',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-helmet-async')) {
              return 'react-vendor'
            }
            if (id.includes('@supabase')) return 'supabase-vendor'
            if (id.includes('posthog-js') || id.includes('@posthog')) return 'analytics-vendor'
            if (id.includes('@sentry')) return 'sentry-vendor'
            if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor'
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
