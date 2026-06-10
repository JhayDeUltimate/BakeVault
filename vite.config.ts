import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html: string) {
          return html
            .replace('__WHATSAPP_NUMBER__', process.env.VITE_WHATSAPP_NUMBER ?? '+2349064652679')
            .replace('__CONTACT_EMAIL__', process.env.VITE_CONTACT_EMAIL ?? 'sales@bakevault.com.ng')
        }
      },
      // Only upload source maps in CI/production builds
      process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        release: { name: process.env.VITE_APP_VERSION ?? 'bakevault@0.1.0' },
        sourcemaps: { assets: './dist/**' },
        telemetry: false,
      }) : undefined,
    ].filter(Boolean),
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
      sourcemap: 'hidden', // Generated for Sentry upload but not served publicly
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
