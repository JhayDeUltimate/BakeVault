import React from 'react'
import useConsent from '../../hooks/useConsent'

export default function ConsentBanner() {
  const { consent, accept, decline } = useConsent()

  // Show banner only when the user hasn't made a choice yet
  if (consent !== null) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-orange-100 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-4 max-w-3xl">
      <div className="text-sm text-brand-darkGray">
        We use localStorage and analytics to improve your experience. By clicking “Accept” you consent to this processing under Nigeria's NDPR. See our <a href="/privacy" className="text-brand-orange underline">Privacy Policy</a>.
      </div>
      <div className="flex items-center gap-2">
        <button onClick={accept} className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg">Accept</button>
        <button onClick={decline} className="text-sm text-brand-darkGray px-3 py-2 rounded-lg border border-gray-200">Decline</button>
      </div>
    </div>
  )
}
