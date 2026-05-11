import React from 'react'
import * as Sentry from '@sentry/react'

interface Props {
  children:  React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError:   boolean
  eventId:    string | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, eventId: null }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    })
    this.setState({ eventId })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4">
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-extrabold text-brand-darkGray font-display mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-brand-darkGray/60 mb-6">
            The page hit an unexpected error. Our team has been notified automatically.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-brand-orange hover:bg-brand-brown text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Reload Page
            </button>
            <a href="/"
              className="w-full text-center text-sm font-bold text-brand-darkGray/60 hover:text-brand-orange transition-colors"
            >
              Go to Homepage
            </a>
          </div>
          {this.state.eventId && (
            <p className="text-xs text-brand-darkGray/30 mt-4 font-mono">
              Error ID: {this.state.eventId}
            </p>
          )}
        </div>
      </div>
    )
  }
}
