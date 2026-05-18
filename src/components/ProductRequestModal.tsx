import React, { useState } from 'react'
import { createProductRequest } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'

const SIZES = ['100g', '200ml', '250g', '500g', '500ml', '1kg', '1ltr', '2kg', '5kg', '5ltr', '10kg', '25kg', '50kg', 'Other']

interface Props { onClose: () => void }

export default function ProductRequestModal({ onClose }: Props) {
  const [form, setForm] = useState({
    product_name: '',
    product_size: '',
    quantity:     '',
    notes:        '',
    contact_info: '',   // ← phone, email or WhatsApp number
  })
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  function set(key: keyof typeof form, val: string) {
    setForm(p => ({ ...p, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name.trim()) { setError('Product name is required.'); return }
    try {
      setSaving(true); setError(null)
      await createProductRequest({
        product_name: form.product_name.trim(),
        product_size: form.product_size  || undefined,
        quantity:     form.quantity      ? Number(form.quantity) : undefined,
        notes:        form.notes         || undefined,
        contact_info: form.contact_info  || undefined,
      })
      trackEvent('product_request_submitted', { product_name: form.product_name })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-brand-cream/30'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-brand-darkGray/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-brand-darkGray font-display mb-2">Got it.</h2>
            <p className="text-sm text-brand-darkGray/60 mb-6">
              We'll look into it and get back to you at the contact you provided. If you didn't leave contact info, you can always follow up with us on WhatsApp.
            </p>
            <button onClick={onClose}
              className="w-full bg-brand-orange text-white font-bold py-3 rounded-2xl hover:bg-brand-brown transition-all">
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-brand-darkGray font-display mb-1">Can't find it? Request it.</h2>
            <p className="text-xs text-brand-darkGray/50 mb-6">
              Tell us what you're looking for and we'll see if we can source it, retail or bulk. Add your contact info and we'll update you directly.
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-1.5">
                  Product Name *
                </label>
                <input value={form.product_name} onChange={e => set('product_name', e.target.value)}
                  placeholder="e.g. Yogourmet Freeze-Dried Yogurt Starter" className={inputCls} required />
              </div>

              {/* Size + Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-1.5">
                    Size / Weight
                  </label>
                  <select value={form.product_size} onChange={e => set('product_size', e.target.value)} className={inputCls}>
                    <option value="">Select size</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-1.5">
                    Quantity
                  </label>
                  <input type="number" min={1} value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                    placeholder="e.g. 10" className={inputCls} />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-1.5">
                  Additional Notes
                </label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                  placeholder="Brand preference, urgency, or other details…"
                  className={inputCls + ' resize-none'} />
              </div>

              {/* Contact Info — so BakeVault can follow up */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-1.5">
                  Your Contact (Phone / WhatsApp / Email)
                </label>
                <input value={form.contact_info} onChange={e => set('contact_info', e.target.value)}
                  placeholder="e.g. +2348012345678 or you@email.com"
                  className={inputCls} />
                <p className="mt-1 text-[10px] text-brand-darkGray/40">
                  Optional, so we can update you when the product is available.
                </p>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-brand-darkGray hover:bg-brand-orange text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}