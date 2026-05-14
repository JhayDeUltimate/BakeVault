import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { logger } from './logger'
import { logAdminActivity } from './admin-activity'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

// ── Admin email helpers ───────────────────────────────────────────────────────
function parseAdminEmails(raw: string | undefined): Set<string> {
  if (import.meta.env.PROD && raw) {
    logger.warn(
      '[BakeVault] VITE_ADMIN_EMAILS is set in a production build. ' +
      'This exposes admin emails in the client bundle. Use the admins table instead.',
    )
  }
  return new Set(
    (raw ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  )
}
const ADMIN_EMAILS = parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS)

/**
 * Checks the `admins` table for an admin role.
 * - Returns true if a row exists for the user's id
 * - Returns false on any error (fail-closed)
 * - 4-second timeout prevents long waits if Supabase is slow
 */
async function fetchIsAdmin(uid: string): Promise<boolean> {
  try {
    const timeout = new Promise<false>(resolve => setTimeout(() => resolve(false), 4000))
    const query = supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data, error }: { data: { user_id: string } | null; error: unknown }) => {
        if (error || !data) return false
        return true
      })
    return await Promise.race([query, timeout])
  } catch {
    return false
  }
}

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  /** Resolves admin status: admins table first, env-var fallback second */
  async function resolveAdmin(u: User): Promise<boolean> {
    const isAdmin = await fetchIsAdmin(u.id)
    if (isAdmin) {
      logger.debug('resolveAdmin: admins table check passed', { user_id: u.id })
      return true
    }

    let emailMatch = false
    if (ADMIN_EMAILS.size > 0 && u.email) {
      emailMatch = ADMIN_EMAILS.has(u.email.toLowerCase())
      if (emailMatch) logger.debug('resolveAdmin: env fallback passed', { user_email: u.email })
      return emailMatch
    }

    logger.debug('resolveAdmin: no admin match', { user_id: u.id, user_email: u.email ?? null })
    return false
  }

  useEffect(() => {
    let cancelled = false
    let initialized = false

    // init() reads the existing session so the UI doesn't flash "logged out"
    // on page refresh before onAuthStateChange fires.
    async function init() {
      logger.debug('Auth init start', { event: 'auth_init' })
      try {
        const { data: { session } } = await supabase.auth.getSession()
        logger.debug('Auth init session', {
          event: 'auth_init',
          hasSession: !!session,
          user_id: session?.user?.id ?? null,
          user_email: session?.user?.email ?? null,
          expires_at: (session as any)?.expires_at ?? null,
        })
        if (cancelled) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const admin = await resolveAdmin(currentUser)
          if (!cancelled) setIsAdmin(admin)
        }
      } catch (err) {
        logger.error('Auth init failed', err, { event: 'auth_init' })
      } finally {
        if (!cancelled) {
          setLoading(false)
          initialized = true
        }
      }
    }

    init()

    // onAuthStateChange handles sign-in, sign-out, and token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (cancelled) return
        logger.debug('onAuthStateChange', {
          event: _event,
          initialized,
          hasSession: !!session,
          user_id: session?.user?.id ?? null,
          user_email: session?.user?.email ?? null,
        })

        const currentUser = session?.user ?? null

        if (currentUser) {
          if (!initialized) setLoading(true)
          setUser(currentUser)
          const admin = await resolveAdmin(currentUser)
          if (!cancelled) {
            setIsAdmin(admin)
            if (!initialized) {
              setLoading(false)
              initialized = true
            }
            logger.info('User authenticated', {
              event: 'auth_sign_in',
              user_id: currentUser.id,
            })
            void (async () => { try { await logAdminActivity({ action: 'auth.sign_in', resource_type: 'auth', resource_id: currentUser.id, details: { email: currentUser.email } }) } catch {} })()
          }
        } else {
          // If we haven't finished initialising, ignore transient null sessions
          if (!initialized) {
            logger.debug('onAuthStateChange ignored', { event: _event, reason: 'not-initialized' })
            return
          }

          setUser(null)
          setIsAdmin(false)
          setLoading(false)
          logger.info('User signed out', { event: 'auth_sign_out' })
          void (async () => { try { await logAdminActivity({ action: 'auth.sign_out', resource_type: 'auth' }) } catch {} })()
        }
      },
    )

    return () => {
      cancelled = true
      logger.debug('Unsubscribing auth listener')
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      logger.warn('Sign-in failed', { event: 'auth_sign_in_fail', page: '/admin/login' })
      throw new Error(error.message)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      logger.warn('Sign-up failed', { event: 'auth_sign_up_fail' })
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
