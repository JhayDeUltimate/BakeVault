/**
 * Stable anonymous visitor identity — localStorage-backed, per device.
 *
 * Limitations:
 *  - Clears if the user wipes browser storage
 *  - Does NOT follow users across devices
 *  - Safari ITP may expire it after 7 days on first visit without return
 *  - Incognito sessions start fresh every time
 */

const VISITOR_KEY = 'bakevault:visitor_id'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Returns a stable anonymous visitor ID for this device.
 * Creates and persists a UUID on first call. Never throws.
 */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = generateUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}
