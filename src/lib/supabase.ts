import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let _supabase: any
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[BakeVault] Missing Supabase env vars. Copy .env.local.example → .env.local and fill in your values.'
  )
  const thrower = () => { throw new Error('Supabase is not configured.') }
  _supabase = new Proxy({}, { get: () => thrower })
} else {
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Bypass the Navigator Lock (Web Locks API).
      // The default lock causes NavigatorLockAcquireTimeoutError in two scenarios:
      //   1. React StrictMode double-invoking effects in development
      //   2. Tab visibility changes triggering concurrent token refreshes
      // Single-tab apps don't need cross-tab lock coordination.
      lock: async (_name, _acquireTimeout, fn) => fn(),
    },
  })
}

export const supabase = _supabase as ReturnType<typeof createClient<Database>>