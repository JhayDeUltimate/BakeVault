import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
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
