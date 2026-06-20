import React from 'react'
import { Link } from 'react-router-dom'
import { logger } from '@/lib/logger'

interface Props {
  children: React.ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
}

export default class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Route boundary caught error', error, {
      componentStack: info.componentStack,
      routeName: this.props.routeName,
    })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl font-extrabold text-brand-orange/20 font-display">Oops</p>
        <h2 className="mt-4 text-xl font-extrabold text-brand-darkGray font-display">
          This page failed to load
        </h2>
        <p className="mt-2 text-sm text-brand-darkGray/60">
          Something went wrong loading {this.props.routeName ?? 'this page'}.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-brand-orange text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-brown transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="border border-orange-100 text-brand-darkGray font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }
}
