import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { RecentlyViewedItem } from '@/hooks/useRecentlyViewed'
import { FALLBACK_IMAGE, optimizeImageUrl } from '@/lib/image'

interface Props {
  items:    RecentlyViewedItem[]
  title?:   string
  subtitle?: string
}

/**
 * Horizontal scrollable strip of recently-viewed product thumbnails.
 * Renders nothing when there are no items (safe to mount unconditionally).
 * Clicking any card navigates to the product page.
 */
export default function RecentlyViewedStrip({
  items,
  title    = 'Recently Viewed',
  subtitle,
}: Props) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    // 4px tolerance to avoid flicker from sub-pixel rounding at the true edges
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [items, updateScrollState])

  function scrollByCard(direction: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    const firstCard = el.querySelector('button')
    // card width + gap-4 (1rem = 16px)
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: direction * cardWidth, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <section className="mt-16 sm:mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b-2 border-orange-50 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-brand-darkGray/50 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-xs text-brand-darkGray/30 font-medium hidden sm:block">
          {items.length} product{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Scrollable strip wrapper — carries the full-bleed negative
          margin so the edge-fade gradients and arrow buttons align
          with the strip's true visual edges, not the padded page
          container. See implementation notes for why this moved here
          from the inner scroll container. */}
      <div className="relative -mx-4 sm:-mx-1">

        {/* Edge-fade gradients — primary affordance on mobile */}
        {canScrollLeft && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 sm:w-10 bg-gradient-to-r from-brand-cream to-transparent"
          />
        )}
        {canScrollRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 sm:w-10 bg-gradient-to-l from-brand-cream to-transparent"
          />
        )}

        {/* Desktop scroll arrows — hidden on mobile, touch swipe is primary there */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 rounded-full items-center justify-center shadow hover:bg-white transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 rounded-full items-center justify-center shadow hover:bg-white transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-scroll overscroll-x-contain px-4 pb-3 scrollbar-hide sm:px-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map(item => {
            const imageSrc = optimizeImageUrl(item.image_url, { width: 320, height: 320, quality: 72 })

            return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/products/${item.slug}`)}
              className="group w-36 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-orange-100 bg-white text-left transition-all hover:border-brand-orange hover:shadow-md sm:w-44"
              aria-label={`View ${item.name}`}
            >
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden bg-brand-cream">
                <img
                  src={imageSrc}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                />
              </div>

              {/* Info */}
              <div className="p-2.5">
                {item.category && (
                  <p className="text-[10px] font-bold text-brand-brown uppercase tracking-widest mb-0.5 truncate">
                    {item.category}
                  </p>
                )}
                <p className="text-xs font-bold text-brand-darkGray line-clamp-2 leading-tight">
                  {item.name}
                </p>
                <p className="text-[10px] text-brand-orange font-bold mt-1 uppercase tracking-wide">
                  View →
                </p>
              </div>
            </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
