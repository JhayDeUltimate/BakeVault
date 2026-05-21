import { supabase } from './supabase'
import { hasConsent } from './consent'

// One session ID per page-load (memory only — no localStorage required)
export const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'cart_checkout'
  | 'cart_cleared'
  | 'product_request_submitted'
  | 'review_submitted'
  | 'search'
  | 'whatsapp_click'

interface EventData {
  product_id?:   string
  product_name?: string
  category?:     string
  page?:         string
  query?:        string
  item_count?:   number
  [key: string]: unknown
}

/**
 * Track a user-visible event.
 * Failures are always silent — analytics must never break the app.
 *
 * Uses void + an async IIFE to avoid the PromiseLike.catch() TS error that
 * occurs when chaining .catch() directly onto a Supabase insert (which returns
 * PromiseLike<void>, not Promise<void>).
 */
export function trackEvent(type: AnalyticsEventType, data: EventData = {}): void {
  // Respect user consent: do not send analytics without explicit acceptance
  if (!hasConsent()) return

  const page = typeof window !== 'undefined' ? window.location.pathname : ''
  if (page.startsWith('/admin')) return

  // Fire-and-forget using an async IIFE so we get a real Promise with .catch()
  void (async () => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: type,
          event_data: { ...data, user_agent: navigator.userAgent },
          session_id: SESSION_ID,
          page,
        })
      if (error) {
        // Log at debug level only — analytics errors should never be noisy
        console.debug('[analytics] insert failed (non-critical):', error.message)
      }
    } catch {
      // Silently ignore network errors — analytics is best-effort
    }
  })()
}
