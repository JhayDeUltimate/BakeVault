import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

const ADMIN_EMAILS = parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase() ?? ''
    if (!email) return false
    // If no allowlist configured, default to false (secure-by-default)
    if (ADMIN_EMAILS.size === 0) return false
    return ADMIN_EMAILS.has(email)
  }, [user])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signIn, signOut, isAdmin }
}