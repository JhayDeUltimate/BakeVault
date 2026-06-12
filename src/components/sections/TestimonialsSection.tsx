import React, { useEffect, useState } from 'react'
import { submitCustomerReview } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { storefrontSubmissionErrorMessage } from '@/lib/error-messages'
import type { DBTestimonial } from '../../lib/database.types'

interface Props { testimonials: DBTestimonial[] }

const EMPTY_FORM = {
  customer_name: '',
  business_name: '',
  quote: '',
  rating: 5,
  company_website: '',
}

function safeRating(value: unknown): number {
  return Math.max(1, Math.min(5, Number(value) || 5))
}

function RatingStars({ rating, sizeClass = 'w-3.5 h-3.5' }: { rating: number; sizeClass?: string }) {
  const safe = safeRating(rating)
  return (
    <div className="flex justify-center gap-0.5 text-brand-orange">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < safe ? 'fill-current' : 'fill-current text-brand-orange/20'}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection({ testimonials }: Props) {
  const [items, setItems] = useState(testimonials)
  const [current, setCurrent] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'customer_name' | 'quote', string>>>({})

  useEffect(() => {
    setItems(testimonials)
    setCurrent(0)
  }, [testimonials])

  useEffect(() => {
    if (items.length <= 1) return
    const t = window.setInterval(() => setCurrent(p => (p + 1) % items.length), 10_000)
    return () => clearInterval(t)
  }, [items.length])

  function set(key: keyof typeof form, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'customer_name' || key === 'quote') {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.company_website.trim()) {
      setDone(true)
      setForm(EMPTY_FORM)
      return
    }
    const nextErrors: Partial<Record<'customer_name' | 'quote', string>> = {}
    if (!form.customer_name.trim()) nextErrors.customer_name = 'Enter your name.'
    if (!form.quote.trim()) nextErrors.quote = 'Enter your review.'
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setError('Fix the highlighted fields before submitting your review.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setFieldErrors({})
      const submitted = await submitCustomerReview({
        customer_name: form.customer_name,
        business_name: form.business_name,
        quote: form.quote,
        rating: form.rating,
      })
      setForm(EMPTY_FORM)
      setDone(true)
      trackEvent('review_submitted', { rating: submitted.rating })
    } catch (err) {
      setError(storefrontSubmissionErrorMessage(
        err,
        'We could not submit your review right now. Please try again later.',
      ))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-brand-cream border-t border-orange-100 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
        <div className="mx-auto w-full max-w-lg overflow-hidden lg:mx-0">
          <h3 className="mb-6 text-center font-display text-sm font-black uppercase tracking-[0.2em] text-brand-darkGray/40 sm:text-lg lg:text-left">
            What Our Bakers Say
          </h3>

          {items.length === 0 ? (
            <div className="rounded-[24px] border border-orange-100 bg-white p-6 text-center text-sm font-medium text-brand-darkGray/50 shadow-sm sm:rounded-[32px]">
              No reviews yet. Be the first to tell us how BakeVault helped your bake.
            </div>
          ) : (
            <>
              <div className="relative min-h-[180px] sm:min-h-[220px]">
                {items.map((t, idx) => (
                  <div key={t.id}
                    className={`transition-all duration-700 ease-in-out transform ${
                      idx === current ? 'relative opacity-100 translate-y-0 scale-100' : 'absolute inset-0 opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}>
                    <div className="flex h-full flex-col justify-center rounded-[24px] border border-orange-100 bg-white p-5 text-center shadow-sm sm:rounded-[32px] sm:p-8">
                      <div className="mb-3">
                        <RatingStars rating={safeRating(t.rating)} sizeClass="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <p className="mb-4 line-clamp-4 text-xs font-medium italic leading-relaxed text-brand-darkGray/80 sm:text-base">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/10 text-xs font-black text-brand-orange">
                          {t.initials ?? t.customer_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="mb-1 text-xs font-bold uppercase leading-none tracking-widest text-brand-darkGray">{t.customer_name}</p>
                          {t.business_name && <p className="text-[11px] font-bold uppercase text-brand-brown-text sm:text-xs">{t.business_name}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center gap-2 lg:justify-start">
                {items.map((t, idx) => (
                  <button key={t.id} onClick={() => setCurrent(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-brand-orange' : 'w-2 bg-brand-orange/20'}`}
                    aria-label={`Show testimonial ${idx + 1}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <h3 className="font-display text-lg font-extrabold text-brand-darkGray">Leave a review</h3>
          <p className="mt-1 text-xs font-medium leading-relaxed text-brand-darkGray/50">
            Share your experience. Reviews appear here after admin approval.
          </p>

          {done && (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              Thank you. Your review has been submitted. It will appear here once approved by our team.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <input
              value={form.company_website}
              onChange={e => set('company_website', e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                Your Name *
              </label>
              <input
                value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)}
                maxLength={200}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${fieldErrors.customer_name ? 'border-red-300 bg-red-50/50 focus:ring-red-300' : 'border-gray-200 bg-brand-cream/30 focus:ring-brand-orange/30'}`}
                placeholder="e.g. Amaka O."
              />
              {fieldErrors.customer_name && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.customer_name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                Business Name
              </label>
              <input
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                maxLength={200}
                className="w-full rounded-xl border border-gray-200 bg-brand-cream/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('rating', value)}
                    className={`rounded-lg p-1 transition-colors ${value <= form.rating ? 'text-brand-orange' : 'text-brand-orange/20 hover:text-brand-orange/50'}`}
                    aria-label={`Rate ${value} out of 5`}
                  >
                    <svg className="h-7 w-7 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-brown">
                Review *
              </label>
              <textarea
                value={form.quote}
                onChange={e => set('quote', e.target.value.slice(0, 5000))}
                rows={4}
                maxLength={5000}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${fieldErrors.quote ? 'border-red-300 bg-red-50/50 focus:ring-red-300' : 'border-gray-200 bg-brand-cream/30 focus:ring-brand-orange/30'}`}
                placeholder="Tell other bakers what you liked..."
              />
              {fieldErrors.quote && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.quote}</p>}
              {form.quote.length > 4000 && (
                <p className="mt-1 text-right text-xs text-brand-darkGray/40">
                  {5000 - form.quote.length} characters remaining
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-brand-darkGray py-3.5 font-display text-sm font-extrabold text-white transition-all hover:bg-brand-orange active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
