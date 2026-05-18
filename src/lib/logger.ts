import * as Sentry from '@sentry/react'

// LogLevel is declared for future extensibility (e.g. filtering, log shipping).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  user_id?: string
  session_id?: string
  page?: string
  event?: string
  duration_ms?: number
  status_code?: number
  [key: string]: unknown
}

const isProd = import.meta.env.PROD

/**
 * The one logger for all of BakeVault's frontend.
 *
 * In development  → pretty console output with colour and context
 * In production   → structured JSON to console + ships to Sentry
 *
 * Usage:
 *   logger.info('Product viewed', { event: 'product_view', page: '/catalog' })
 *   logger.error('Checkout failed', err, { user_id: user.id })
 *
 * ⚠️  Never call console.log/warn/error directly for business logic.
 *     Use this module exclusively.
 */
export const logger = {
  debug(message: string, context: LogContext = {}) {
    if (isProd) return // never emit DEBUG in production
    console.debug(
      `%c[DEBUG] ${message}`,
      'color: #888',
      context,
    )
  },

  info(message: string, context: LogContext = {}) {
    if (isProd) {
      // In production, add a breadcrumb so Sentry traces the path to any error
      Sentry.addBreadcrumb({
        category: context.event ?? 'app',
        message,
        level: 'info',
        data: sanitize(context),
      })
    } else {
      console.info(`%c[INFO]  ${message}`, 'color: #2196f3', context)
    }
  },

  warn(message: string, context: LogContext = {}) {
    const clean = sanitize(context)
    if (isProd) {
      Sentry.addBreadcrumb({ category: 'warn', message, level: 'warning', data: clean })
      // Also write to console so it shows in Supabase edge function output
      console.warn(JSON.stringify({ level: 'WARN', message, ...clean }))
    } else {
      console.warn(`%c[WARN]  ${message}`, 'color: #ff9800', context)
    }
  },

  error(message: string, error?: unknown, context: LogContext = {}) {
    const clean = sanitize(context)

    if (isProd) {
      // Capture to Sentry with full context
      Sentry.withScope(scope => {
        Object.entries(clean).forEach(([k, v]) => scope.setExtra(k, v))
        if (error instanceof Error) {
          scope.setExtra('message_override', message)
          Sentry.captureException(error)
        } else {
          Sentry.captureMessage(message, 'error')
        }
      })
    } else {
      console.error(`%c[ERROR] ${message}`, 'color: #f44336; font-weight: bold', error, context)
    }
  },
}

/**
 * Strips any fields that should never appear in logs.
 * Blocklist approach: known-sensitive keys are filtered out.
 */
function sanitize(ctx: LogContext): LogContext {
  const BLOCKED = new Set([
    'password', 'token', 'access_token', 'refresh_token',
    'api_key', 'secret', 'credit_card', 'card_number',
    'authorization', 'cookie', 'session_token',
  ])

  return Object.fromEntries(
    Object.entries(ctx).filter(([key]) => !BLOCKED.has(key.toLowerCase()))
  )
}
