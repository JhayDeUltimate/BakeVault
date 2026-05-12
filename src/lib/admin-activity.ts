import { supabase } from './supabase'
import { logger } from './logger'
import { SESSION_ID } from './analytics'
import type { Json } from './database.types'

export interface AdminActivityOptions {
  action: string
  resource_type?: string | null
  resource_id?: string | null
  details?: Json
}

/**
 * Write an admin activity row to `admin_activity_logs`.
 * Falls back to `analytics_events` when the dedicated table isn't present.
 * This is best-effort and never throws.
 */
export async function logAdminActivity(opts: AdminActivityOptions): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const admin_id = user?.id ?? null
    const admin_email = (user as any)?.email ?? null
    const page = typeof window !== 'undefined' ? window.location.pathname : null

    const payload = {
      admin_id,
      admin_email,
      action: opts.action,
      resource_type: opts.resource_type ?? null,
      resource_id: opts.resource_id ?? null,
      details: opts.details ?? null,
      session_id: typeof window !== 'undefined' ? SESSION_ID : null,
      page,
    }

    const { error } = await supabase.from('admin_activity_logs').insert(payload)
    if (error) {
      logger.warn('Failed to insert admin activity log (admin_activity_logs)', {
        event: 'admin_activity.insert_failed',
        reason: error.message,
        action: opts.action,
      })

      // Best-effort fallback to analytics_events so records exist somewhere
      try {
        const { error: ae } = await supabase.from('analytics_events').insert({
          event_type: 'admin.activity',
          event_data: payload as Json,
          session_id: payload.session_id,
          page: payload.page,
        })
        if (ae) logger.warn('Fallback analytics insert failed for admin activity', { event: 'admin_activity.analytics_fallback_failed', reason: ae.message })
      } catch (e) {
        // swallow silently — logging must never break the app
      }
    } else {
      logger.info('Admin activity logged', { event: 'admin_activity.logged', action: opts.action, admin_id })
    }
  } catch (e) {
    logger.error('Admin activity logging failed', e as Error, { event: 'admin_activity.exception', action: opts.action })
  }
}
