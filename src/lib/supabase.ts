import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { SESSION_ID } from './session-id'
import { logger } from './logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let _supabase: ReturnType<typeof createClient<Database>>

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Missing Supabase env vars', { event: 'config_missing' })
  const thrower = () => { throw new Error('Supabase is not configured.') }
  _supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, { get: () => thrower })
} else {
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Keep Supabase Auth's default cross-tab locking behavior.
      // Development-only duplicate effect calls should be handled outside this client.
    },
    global: {
      headers: {
        'x-bakevault-session-id': SESSION_ID,
      },
    },
  })
}

export const supabase = _supabase
