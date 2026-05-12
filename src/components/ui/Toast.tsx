import React, { useEffect, useState } from 'react'
import type { Product } from '@/lib/types'

type ToastItem = { id: number; text: string }

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    function handle(e: Event) {
      const ce = e as CustomEvent<{ product?: Product }>
      const name = ce?.detail?.product?.name ?? 'Item'
      const id = Date.now() + Math.floor(Math.random() * 1000)
      const text = `${name} added to order`
      setToasts(prev => [...prev, { id, text }])
      // auto-dismiss
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
    }

    window.addEventListener('bakevault:add-to-cart', handle as EventListener)
    return () => window.removeEventListener('bakevault:add-to-cart', handle as EventListener)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div aria-live="polite" role="status" className="fixed left-1/2 -translate-x-1/2 bottom-6 sm:bottom-12 z-50 flex flex-col items-center gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto max-w-[90vw] sm:max-w-md bg-white border border-orange-50 text-brand-darkGray px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 transition-all transform">
          <svg className="w-5 h-5 text-brand-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div className="text-sm font-medium truncate">{t.text}</div>
          <button onClick={() => setToasts(prev => prev.filter(i => i.id !== t.id))} aria-label="Dismiss" className="ml-2 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
