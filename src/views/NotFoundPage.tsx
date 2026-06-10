import React from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP_URL } from '@/constants'

export default function NotFoundPage() {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-brand-orange/20 font-display leading-none mb-4">
          404
        </p>
        <h1 className="text-2xl font-extrabold text-brand-darkGray font-display mb-3">
          Page not found
        </h1>
        <p className="text-sm text-brand-darkGray/60 leading-relaxed mb-8">
          We couldn't find that page — it may have moved or been removed. If you followed
          a link from somewhere, it may be outdated.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/catalog"
            className="w-full sm:w-auto text-center bg-brand-orange hover:bg-brand-brown text-white font-extrabold px-8 py-3 rounded-2xl transition-all active:scale-95 text-sm font-display uppercase tracking-wide"
          >
            Browse the Vault
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto text-center bg-white hover:bg-orange-50 text-brand-darkGray border border-orange-100 font-extrabold px-8 py-3 rounded-2xl transition-all text-sm font-display uppercase tracking-wide"
          >
            Go Home
          </Link>
        </div>
        {WHATSAPP_URL && (
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-6 text-xs text-brand-brown font-bold hover:text-brand-orange transition-colors"
          >
            Need help? Chat with us on WhatsApp →
          </a>
        )}
      </div>
    </main>
  )
}