import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Prevent admin emails from being baked into the production bundle.
  // The admins table in Supabase is the correct authorisation mechanism.
  if (mode === 'production' && process.env.VITE_ADMIN_EMAILS) {
    throw new Error(
      '[BakeVault] VITE_ADMIN_EMAILS must NOT be set in production builds. ' +
      'This variable exposes admin emails in the client bundle. ' +
      'Use the admins table in Supabase instead. Remove VITE_ADMIN_EMAILS from your environment.'
    )
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})