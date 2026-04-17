import React, { useEffect, useState } from 'react'
import type { DBTestimonial } from '../../lib/database.types'

interface Props { testimonials: DBTestimonial[] }

export default function TestimonialsSection({ testimonials }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const t = window.setInterval(() => setCurrent(p => (p + 1) % testimonials.length), 3500)
    return () => clearInterval(t)
  }, [testimonials.length])

  if (testimonials.length === 0) return null

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream border-t border-orange-100">
      <div className="max-w-lg mx-auto overflow-hidden">
        <h3 className="text-center text-sm sm:text-lg font-black text-brand-darkGray/40 font-display mb-6 uppercase tracking-[0.2em]">
          The Bakers' Circle
        </h3>
        <div className="relative h-[180px] sm:h-[220px]">
          {testimonials.map((t, idx) => (
            <div key={t.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                idx === current ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
              }`}>
              <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-orange-100 shadow-sm h-full flex flex-col justify-center text-center">
                <div className="flex justify-center gap-0.5 text-brand-orange mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-brand-darkGray/80 text-xs sm:text-base font-medium italic mb-4 leading-relaxed line-clamp-2">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-[10px]">
                    {t.initials ?? t.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] sm:text-xs font-bold text-brand-darkGray uppercase tracking-widest leading-none mb-1">{t.customer_name}</p>
                    {t.business_name && <p className="text-[8px] sm:text-[10px] text-brand-brown font-bold uppercase">{t.business_name}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((t, idx) => (
            <button key={t.id} onClick={() => setCurrent(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-brand-orange' : 'w-2 bg-brand-orange/20'}`}
              aria-label={`Show testimonial ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}