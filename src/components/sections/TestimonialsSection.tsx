import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DBTestimonial } from '../../lib/database.types'

interface Props { testimonials: DBTestimonial[] }

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

  useEffect(() => {
    setItems(testimonials)
    setCurrent(0)
  }, [testimonials])

  useEffect(() => {
    if (items.length <= 1) return
    const t = window.setInterval(() => setCurrent(p => (p + 1) % items.length), 10_000)
    return () => clearInterval(t)
  }, [items.length])

  return (
    <section className="bg-brand-cream border-t border-orange-100 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto w-full overflow-hidden">
          <h3 className="mb-6 text-center font-display text-sm font-black uppercase tracking-[0.2em] text-brand-darkGray/40 sm:text-lg">
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

              <div className="mt-4 flex justify-center gap-2">
                {items.map((t, idx) => (
                  <button key={t.id} onClick={() => setCurrent(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-brand-orange' : 'w-2 bg-brand-orange/20'}`}
                    aria-label={`Show testimonial ${idx + 1}`} />
                ))}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              to="/leave-review"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-darkGray px-6 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-brand-orange sm:w-auto"
            >
              Leave a review
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
