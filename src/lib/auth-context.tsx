import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { logger } from './logger'
import { logAdminActivity } from './admin-activity'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

const adminCheckInFlight = new Map<string, Promise<boolean>>()
let initialSessionPromise: Promise<Session | null> | null = null

function getInitialSession(): Promise<Session | null> {
  if (!initialSessionPromise) {
    initialSessionPromise = supabase.auth
      .getSession()
      .then(({ data: { session } }) => session)
      .catch((error) => {
        initialSessionPromise = null
        throw error
      })
  }

  return initialSessionPromise
}

/**
 * Checks the `admins` table for an admin role.
 * - Returns true if a row exists for the user's id
 * - Returns false on any error (fail-closed)
 * - 4-second timeout prevents long waits if Supabase is slow
 */
async function fetchIsAdmin(uid: string): Promise<boolean> {
  const existing = adminCheckInFlight.get(uid)
  if (existing) return existing

  const check = (async () => {
    try {
      const timeout = new Promise<false>(resolve => setTimeout(() => {
        logger.warn('fetchIsAdmin timed out after 10s', { event: 'admin_check_timeout', user_id: uid })
        resolve(false)
      }, 10_000))
      const query = supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', uid)
        .maybeSingle()
        .then(({ data, error }: { data: { user_id: string } | null; error: unknown }) => {
          if (error) {
            logger.warn('fetchIsAdmin query error', { event: 'admin_check_error', user_id: uid, error: String(error), errorObj: JSON.stringify(error) })
            return false
          }
          if (!data) {
            logger.warn('fetchIsAdmin: no row found', { event: 'admin_check_no_row', user_id: uid })
            return false
          }
          logger.info('fetchIsAdmin: admin confirmed', { event: 'admin_check_pass', user_id: uid })
          return true
        })
      return await Promise.race([query, timeout])
    } catch (err) {
      logger.error('fetchIsAdmin caught exception', err as Error, { event: 'admin_check_exception', user_id: uid })
      return false
    } finally {
      adminCheckInFlight.delete(uid)
    }
  })()

  adminCheckInFlight.set(uid, check)
  return check
}


// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isAdminChecking: boolean
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
  const [isAdminChecking, setIsAdminChecking] = useState(false)

  const confirmedAdminRef = React.useRef<string | null>(null)
  const adminCheckCountRef = React.useRef(0)

  function beginAdminCheck() {
    adminCheckCountRef.current += 1
    setIsAdminChecking(true)
  }

  function endAdminCheck() {
    adminCheckCountRef.current = Math.max(0, adminCheckCountRef.current - 1)
    if (adminCheckCountRef.current === 0) setIsAdminChecking(false)
  }

  /** Resolves admin status from the admins table. */
  async function resolveAdmin(u: User): Promise<boolean> {
    if (confirmedAdminRef.current === u.id) {
      logger.debug('resolveAdmin: using cached result', { user_id: u.id })
      return true
    }

    const admin = await fetchIsAdmin(u.id)
    if (admin) {
      confirmedAdminRef.current = u.id
      logger.debug('resolveAdmin: admins table check passed', { user_id: u.id })
      return true
    }

    confirmedAdminRef.current = null
    logger.debug('resolveAdmin: no admin match', { user_id: u.id })
    return false
  }

  useEffect(() => {
    let cancelled = false
    let initialized = false
    let authRunId = 0

    // init() reads the existing session so the UI doesn't flash "logged out"
    // on page refresh before onAuthStateChange fires.
    async function init() {
      logger.debug('Auth init start', { event: 'auth_init' })
      try {
        const session = await getInitialSession()
        logger.debug('Auth init session', {
          event: 'auth_init',
          hasSession: !!session,
          user_id: session?.user?.id ?? undefined,
          user_email: session?.user?.email ?? undefined,
          expires_at: (session as any)?.expires_at ?? undefined,
        })
        if (cancelled) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          beginAdminCheck()
          try {
            const admin = await resolveAdmin(currentUser)
            if (!cancelled) setIsAdmin(admin)
          } finally {
            if (!cancelled) endAdminCheck()
          }
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

    async function processAuthSession(_event: AuthChangeEvent, session: Session | null) {
      if (cancelled) return

      const currentUser = session?.user ?? null

      if (!currentUser) {
        // If we haven't finished initialising, ignore transient null sessions
        if (!initialized) {
          logger.debug('onAuthStateChange ignored', { event: _event, reason: 'not-initialized' })
          return
        }

        confirmedAdminRef.current = null
        setUser(null)
        setIsAdmin(false)
        setIsAdminChecking(false)
        setLoading(false)
        logger.info('User signed out', { event: 'auth_sign_out' })
        // Do NOT log admin activity here; the session is already null
        // so any authenticated insert will fail with 401.
        return
      }

      const runId = ++authRunId
      setUser(currentUser)

      // Token refreshes and user updates should not produce duplicate sign-in logs,
      // but they can refresh the user object and reuse the cached admin result.
      if (_event !== 'SIGNED_IN' && confirmedAdminRef.current === currentUser.id) {
        setIsAdmin(true)
        return
      }

      if (!initialized) setLoading(true)
      if (confirmedAdminRef.current !== currentUser.id) {
        confirmedAdminRef.current = null
      }
      beginAdminCheck()
      try {
        const admin = await resolveAdmin(currentUser)
        if (!cancelled && runId === authRunId) {
          setIsAdmin(admin)
          if (!initialized) {
            setLoading(false)
            initialized = true
          }
          if (_event === 'SIGNED_IN') {
            logger.info('User authenticated', {
              event: 'auth_sign_in',
              user_id: currentUser.id,
            })
          }
        }
      } finally {
        if (!cancelled) {
          endAdminCheck()
        }
      }
    }

    // onAuthStateChange handles sign-in, sign-out, and token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (cancelled) return
        logger.debug('onAuthStateChange', {
          event: _event,
          initialized,
          hasSession: !!session,
          user_id: session?.user?.id ?? undefined,
          user_email: session?.user?.email ?? undefined,
        })

        // The explicit getInitialSession() call above owns initial load handling.
        // Ignoring this event prevents duplicate admin checks during React StrictMode remounts.
        if (_event === 'INITIAL_SESSION') {
          return
        }

        window.setTimeout(() => {
          void processAuthSession(_event, session)
        }, 0)
      },
    )

    return () => {
      cancelled = true
      logger.debug('Unsubscribing auth listener')
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      logger.warn('Sign-in failed', { event: 'auth_sign_in_fail', page: '/admin/login' })
      throw new Error(error.message)
    }
    if (data.user) {
      void logAdminActivity({
        action: 'auth.sign_in',
        resource_type: 'auth',
        resource_id: data.user.id,
        details: { email: data.user.email },
        actor: data.user,
      })
    }
  }

  async function signOut() {
    // Log BEFORE clearing session; JWT must still be valid for RLS.
    try { await logAdminActivity({ action: 'auth.sign_out', resource_type: 'auth', actor: user }) } catch { /* best-effort */ }
    await supabase.auth.signOut()
    setIsAdmin(false)
    setIsAdminChecking(false)
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      logger.warn('Sign-up failed', { event: 'auth_sign_up_fail' })
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isAdminChecking, signIn, signOut, signUp }}>
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
