import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { DBProductWithCategory } from '../../lib/database.types'
import { optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'

interface HeroSectionProps {
  products:    DBProductWithCategory[]
  onAddToCart: (product: DBProductWithCategory) => void
}

const SLIDE_INTERVAL_MS = 5000

const HeroSection: React.FC<HeroSectionProps> = ({ products, onAddToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<number | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (products.length <= 1) return
    timerRef.current = window.setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % products.length)
    }, SLIDE_INTERVAL_MS)
  }, [products.length])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  useEffect(() => { setCurrentSlide(0) }, [products])

  function goToSlide(index: number) {
    setCurrentSlide(index)
    startTimer()   // reset timer on manual navigation
  }

  if (products.length === 0) return (
    <section className="relative h-[340px] sm:h-[520px] overflow-hidden bg-brand-darkGray animate-pulse flex items-center justify-center">
      <div className="text-white/20">
        <svg className="w-16 h-16 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </section>
  )

  return (
    <section className="bg-brand-darkGray">
      <div className="w-full">
        <div className="relative h-[300px] sm:h-[450px] overflow-hidden">
          {products.map((product, index) => {
            const src = optimizeImageUrl(product.image_url, IMG.hero)

            return (
              <div
                key={product.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              >
                <div className="absolute inset-0">
                  <img
                    src={src}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    /* Hero images are above the fold — load eagerly for LCP */
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                  />
                  <div className="absolute inset-0 bg-brand-darkGray/35" />
                </div>

                <div className="relative h-full flex flex-col justify-center items-start text-white px-4 sm:px-8 lg:px-12">
                  <div className="w-full sm:max-w-lg bg-white/5 backdrop-blur-md p-4 sm:p-8 rounded-[32px] sm:rounded-3xl border border-white/10 shadow-2xl animate-fadeInUp">
                    <div className="mb-1.5 sm:mb-3">
                      {product.categories?.name ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-orange text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase">
                          {product.categories.name}
                        </span>
                      ) : null}
                    </div>
                    <h1 className="text-lg sm:text-3xl lg:text-4xl font-extrabold mb-1.5 sm:mb-3 leading-tight font-display">
                      {product.name}
                    </h1>
                    <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-5 leading-relaxed font-medium line-clamp-2">
                      {product.description?.split('\n')[0]}
                    </p>
                    <div className="flex animate-fadeInUp delay-200">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-white hover:text-brand-darkGray transition-all shadow-2xl active:scale-95 font-display text-xs sm:text-sm"
                      >
                        <span className="sm:hidden">Add to Bag</span>
                        <span className="hidden sm:inline">Add to Bag, Get a Quote via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 sm:w-12 bg-brand-orange' : 'w-1.5 sm:w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection