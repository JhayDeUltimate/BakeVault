import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { DBProductWithCategory } from '../../lib/database.types'
import { optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'

interface HeroSectionProps {
  products:    DBProductWithCategory[]
  onAddToCart: (product: DBProductWithCategory) => void
}

const SLIDE_INTERVAL_MS = 10_000

const HeroSection: React.FC<HeroSectionProps> = ({ products, onAddToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<number | null>(null)
  const activeSlide = products.length > 0 ? Math.min(currentSlide, products.length - 1) : 0

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
    <section className="relative flex h-[300px] w-full items-center justify-center overflow-hidden bg-brand-darkGray animate-pulse sm:h-[400px] lg:min-h-[580px] lg:bg-brand-cream">
      <div className="text-white/20 lg:text-brand-darkGray/20">
        <svg className="w-16 h-16 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </section>
  )

  return (
    <section className="relative w-full overflow-hidden bg-brand-darkGray shadow-sm lg:bg-brand-cream">
      <div className="relative h-[300px] overflow-hidden sm:h-[400px] lg:h-auto lg:min-h-[580px]">
        {products.map((product, index) => {
          const mobileSrc = optimizeImageUrl(product.image_url, IMG.hero)
          const desktopSrc = optimizeImageUrl(product.image_url)
          const isActive = index === activeSlide

          return (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}
            >
              <div className="absolute inset-0 bg-brand-darkGray lg:hidden">
                <img
                  src={mobileSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-3xl"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                />
                <img
                  src={mobileSrc}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="relative flex h-full flex-col items-start justify-center px-4 text-white pointer-events-none sm:px-8 lg:hidden">
                <div className="w-full bg-white/10 backdrop-blur-md p-4 rounded-[32px] border border-white/20 shadow-2xl animate-fadeInUp pointer-events-auto sm:max-w-lg sm:p-8 sm:rounded-3xl">
                  {product.categories?.name ? (
                    <div className="mb-1.5 sm:mb-3">
                      <span className="inline-flex items-center rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white sm:text-xs">
                        {product.categories.name}
                      </span>
                    </div>
                  ) : null}
                  <h1 className="mb-1.5 font-display text-lg font-extrabold leading-tight sm:mb-3 sm:text-3xl">
                    {product.name}
                  </h1>
                  <p className="mb-3 line-clamp-2 text-xs font-medium leading-relaxed text-white/90 sm:mb-5 sm:text-sm">
                    {product.description?.split('\n')[0]}
                  </p>
                  <div className="flex animate-fadeInUp delay-200">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full rounded-xl bg-brand-orange px-6 py-3 text-center font-display text-xs font-extrabold text-white shadow-2xl transition-all hover:bg-white hover:text-brand-darkGray active:scale-95 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-3.5 sm:text-sm"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 hidden bg-brand-cream lg:block">
                <img
                  src={desktopSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-10 blur-2xl"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,248,231,0.98)_0%,rgba(255,248,231,0.92)_42%,rgba(255,255,255,0.78)_100%)]" />
              </div>

              <div className="relative mx-auto hidden h-full min-h-[580px] max-w-[90rem] items-center gap-10 px-8 py-12 lg:grid lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
                <div className={`text-left transition-all duration-1000 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {product.categories?.name ? (
                    <div className="mb-4">
                      <span className="inline-block text-[13px] font-extrabold uppercase tracking-[0.22em] text-brand-orange">
                        {product.categories.name}
                      </span>
                    </div>
                  ) : null}

                  <h1 className="mb-4 max-w-2xl text-balance font-display text-6xl font-extrabold leading-[1.04] text-brand-darkGray">
                    {product.name}
                  </h1>

                  <p className="mb-7 line-clamp-3 max-w-lg text-lg font-medium leading-relaxed text-brand-darkGray/70">
                    {product.description?.split('\n')[0]}
                  </p>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-brand-orange px-9 py-4 text-base font-bold text-white shadow-xl shadow-brand-orange/20 transition-all duration-300 hover:bg-brand-brown active:scale-95"
                  >
                    <span>Add to Bag</span>
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </button>
                </div>

                <div className={`flex min-h-[480px] items-center justify-center transition-all duration-1000 ease-out delay-100 ${isActive ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}>
                  <img
                    src={desktopSrc}
                    alt={product.name}
                    className="h-auto max-h-[520px] w-full max-w-[min(100%,46rem)] object-contain drop-shadow-2xl"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 justify-center sm:bottom-6 lg:bottom-8">
          <div className="flex gap-3 lg:gap-2.5">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1 rounded-full transition-all duration-300 sm:h-2 lg:transition-all lg:duration-500 lg:ease-out ${index === activeSlide ? 'w-6 bg-brand-orange sm:w-12 lg:bg-brand-orange' : 'w-1.5 bg-white/40 sm:w-2 lg:bg-brand-orange/20 lg:hover:bg-brand-orange/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
