import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

/**
 * SECURITY NOTE: VITE_ADMIN_EMAILS is a development fallback ONLY.
 * These emails are visible in the client bundle. Remove this env var
 * and use the profiles table (migration 002_admin_rls.sql) in production.
 */
function parseAdminEmails(raw: string | undefined): Set<string> {
  if (import.meta.env.PROD && raw) {
    console.warn(
      '[BakeVault] VITE_ADMIN_EMAILS is set in a production build. ' +
      'This exposes admin emails in the client bundle. Use the profiles table instead.'
    )
  }
  return new Set(
    (raw ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  )
}
const ADMIN_EMAILS = parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS)

// ── Profiles table role check ─────────────────────────────────────────────────
/**
 * Checks the `profiles` table for an admin role.
 * - Returns true if role = 'admin'
 * - Returns false on any error (fail closed — never accidentally grants access)
 * - Has a 4-second timeout to prevent the admin page from spinning forever
 *   if Supabase is slow or the table doesn't exist yet.
 */
async function fetchIsAdmin(uid: string): Promise<boolean> {
  try {
    const timeout = new Promise<false>(resolve => setTimeout(() => resolve(false), 4000))
    const query = supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return false
        // Type assertion needed: profiles isn't in generated types yet
        return (data as { role: string }).role === 'admin'
      })

    return await Promise.race([query, timeout])
  } catch {
    return false
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  /** Determines admin status using profiles table with env-var fallback */
  async function resolveAdmin(u: User): Promise<boolean> {
    // 1. Try profiles table (secure server-side check)
    const profileAdmin = await fetchIsAdmin(u.id)
    if (profileAdmin) return true

    // 2. Fall back to VITE_ADMIN_EMAILS (works before migration is applied)
    if (ADMIN_EMAILS.size > 0 && u.email) {
      return ADMIN_EMAILS.has(u.email.toLowerCase())
    }

    return false
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const admin = await resolveAdmin(currentUser)
          if (!cancelled) setIsAdmin(admin)
        }
      } catch {
        // On any unexpected error, fail safely — don't leave loading = true
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const admin = await resolveAdmin(currentUser)
        if (!cancelled) setIsAdmin(admin)
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  }

  return { user, loading, signIn, signUp, signOut, isAdmin }
}