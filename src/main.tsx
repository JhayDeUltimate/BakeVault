import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import { PostHogProvider } from '@posthog/react'

// ── Initialise Sentry before anything else renders ───────────────────────────
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION ?? 'bakevault@0.1.0',

    // Only trace 10% of normal sessions — enough for performance insights
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Replay every session that errored; sample only a subset of sessions
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.05 : 0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        block: ['[type="password"]', '[autocomplete="cc-number"]'],
      }),
    ],

    // Strip sensitive data before it leaves the browser
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies
      if (event.request?.headers?.Authorization) {
        delete event.request.headers.Authorization
      }
      return event
    },
  })

  // Catch unhandled promise rejections only when Sentry is active
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason, {
      extra: { type: 'unhandledrejection' },
    })
  })
}

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
} as const

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN} options={posthogOptions}>
            <App />
          </PostHogProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)