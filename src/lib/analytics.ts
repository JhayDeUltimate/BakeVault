import { supabase } from './supabase'

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
  | 'search'

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
 * Failures are silent — analytics must never break the app.
 */
export function trackEvent(type: AnalyticsEventType, data: EventData = {}): void {
  const page = window.location.pathname

  // Fire-and-forget
  supabase
    .from('analytics_events')
    .insert({
      event_type: type,
      event_data: { ...data, user_agent: navigator.userAgent },
      session_id: SESSION_ID,
      page,
    })
    .then(({ error }) => {
      if (error) console.debug('[analytics] insert failed (non-critical):', error.message)
    })
    .catch(() => { /* silently ignore network errors */ })
}