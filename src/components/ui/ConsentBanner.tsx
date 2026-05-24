import React from 'react'
import useConsent from '../../hooks/useConsent'

export default function ConsentBanner() {
  const { consent, accept, decline } = useConsent()

  if (consent !== null) return null

  return (
    // Pinned below the 64px header on mobile (top-[64px], z-30) so it doesn't
    // overlap navigation. On sm+ screens it centres at the bottom as before.
    <div className="fixed top-[64px] left-0 right-0 z-30 sm:top-auto sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:z-50 bg-white border-b sm:border border-orange-100 px-5 py-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:w-auto sm:max-w-3xl sm:rounded-2xl">
      <div className="text-sm text-brand-darkGray flex-1 leading-relaxed">
        We use localStorage and analytics to improve your experience. By clicking "Accept" you consent to this processing under Nigeria's NDPR. See our{' '}
        <a href="/privacy" className="text-brand-orange underline font-semibold">Privacy Policy</a>.
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button onClick={accept} className="flex-1 sm:flex-none bg-brand-orange text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
          Accept
        </button>
        <button onClick={decline} className="flex-1 sm:flex-none text-sm text-brand-darkGray font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          Decline
        </button>
      </div>
    </div>
  )
}