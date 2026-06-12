import React, { useEffect, useState } from 'react'
import { createProductRequest } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { storefrontSubmissionErrorMessage } from '@/lib/error-messages'
import { logger } from '@/lib/logger'
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scroll-lock'

const SIZE_SUGGESTIONS = ['100g', '200ml', '250g', '500g', '500ml', '1kg', '1ltr', '2kg', '5kg', '5ltr', '10kg', '25kg', '50kg']

interface Props { onClose: () => void }

export default function ProductRequestModal({ onClose }: Props) {
  const [form, setForm] = useState({
    product_name: '',
    product_size: '',
    quantity: '',
    notes: '',
    contact_info: '',
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'product_name', string>>>({})

  useEffect(() => {
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [])

  function set(key: keyof typeof form, val: string) {
    setForm(p => ({ ...p, [key]: val }))
    if (key === 'product_name') setFieldErrors({})
  }

  async function submitRequest() {
    if (saving) return
    logger.info('Product request submit started', {
      event: 'product_request_submit_started',
      page: 'product_request_modal',
      has_product_name: Boolean(form.product_name.trim()),
      has_contact_info: Boolean(form.contact_info.trim()),
      is_online: typeof navigator === 'undefined' ? undefined : navigator.onLine,
      viewport_width: typeof window === 'undefined' ? undefined : window.innerWidth,
      viewport_height: typeof window === 'undefined' ? undefined : window.innerHeight,
    })
    if (!form.product_name.trim()) {
      setFieldErrors({ product_name: 'Enter the product name you want us to source.' })
      setError('Enter the product name before submitting.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setFieldErrors({})
      await createProductRequest({
        product_name: form.product_name.trim(),
        product_size: form.product_size || undefined,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        notes: form.notes || undefined,
        contact_info: form.contact_info || undefined,
      })
      trackEvent('product_request_submitted', { product_name: form.product_name })
      setDone(true)
    } catch (err) {
      const msg = storefrontSubmissionErrorMessage(
        err,
        'We could not submit your request right now. Please try again later or contact us on WhatsApp.',
      )
      logger.error('Product request submit failed', err, {
        event: 'product_request_submit_failed',
        page: 'product_request_modal',
        has_product_name: Boolean(form.product_name.trim()),
        has_product_size: Boolean(form.product_size.trim()),
        has_quantity: Boolean(form.quantity.trim()),
        has_notes: Boolean(form.notes.trim()),
        has_contact_info: Boolean(form.contact_info.trim()),
        is_online: typeof navigator === 'undefined' ? undefined : navigator.onLine,
        viewport_width: typeof window === 'undefined' ? undefined : window.innerWidth,
        viewport_height: typeof window === 'undefined' ? undefined : window.innerHeight,
      })
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitRequest()
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-brand-cream/30'
  const invalidCls = 'border-red-300 bg-red-50/50 focus:ring-red-300'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-brand-darkGray/50 backdrop-blur-sm" onClick={onClose} />
      <div
        onClick={e => e.stopPropagation()}
        className="relative flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl sm:max-w-md sm:rounded-[32px]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {done ? (
          <div className="overflow-y-auto px-6 pt-6 sm:px-8 sm:pt-8">
            <div className="py-4 pb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 font-display text-xl font-extrabold text-brand-darkGray">Got it.</h2>
              <p className="mb-6 text-sm text-brand-darkGray/60">
                We'll look into it and get back to you at the contact you provided. If you didn't leave contact info, you can always follow up with us on WhatsApp.
              </p>
              <button onClick={onClose}
                className="w-full rounded-2xl bg-brand-orange py-3 font-bold text-white transition-all hover:bg-brand-brown">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form id="product-request-form" onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div className="overflow-y-auto px-6 pt-6 sm:px-8 sm:pt-8">
              <h2 className="mb-1 pr-10 font-display text-xl font-extrabold text-brand-darkGray">Can't find it? Request it.</h2>
              <p className="mb-6 text-xs text-brand-darkGray/50">
                Tell us what you're looking for and we'll see if we can source it, retail or bulk. Add your contact info and we'll update you directly.
              </p>

              {error && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4 pb-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                    Product Name *
                  </label>
                  <input
                    value={form.product_name}
                    onChange={e => set('product_name', e.target.value)}
                    placeholder="e.g. Yogourmet Freeze-Dried Yogurt Starter"
                    className={`${inputCls} ${fieldErrors.product_name ? invalidCls : ''}`}
                    maxLength={500}
                  />
                  {fieldErrors.product_name && (
                    <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.product_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                      Size / Weight
                    </label>
                    <input
                      type="text"
                      list="size-suggestions"
                      value={form.product_size}
                      onChange={e => set('product_size', e.target.value)}
                      placeholder="e.g. 1kg"
                      className={inputCls}
                      maxLength={100}
                    />
                    <datalist id="size-suggestions">
                      {SIZE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.quantity}
                      onChange={e => set('quantity', e.target.value)}
                      placeholder="e.g. 10"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                    Additional Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={2}
                    placeholder="Brand preference, urgency, or other details..."
                    className={`${inputCls} resize-none`}
                    maxLength={2000}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                    Your Contact (Phone / WhatsApp / Email)
                  </label>
                  <input
                    value={form.contact_info}
                    onChange={e => set('contact_info', e.target.value)}
                    placeholder="e.g. +2348012345678 or you@email.com"
                    className={inputCls}
                    maxLength={500}
                  />
                  <p className="mt-1 text-[10px] text-brand-darkGray/40">
                    Optional, so we can update you when the product is available.
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-orange-100 bg-white px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-brand-darkGray py-4 font-extrabold text-white transition-all hover:bg-brand-orange active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
