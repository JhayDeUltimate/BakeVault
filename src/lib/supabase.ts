import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let _supabase: any
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[BakeVault] Missing Supabase env vars. Copy .env.local.example → .env.local and fill in your values.'
  )

  const thrower = () => { throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local') }
  _supabase = new Proxy({}, { get: () => thrower })
} else {
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = _supabase as any