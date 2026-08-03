import React from 'react'
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

      {/* Scrollable strip */}
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-scroll overscroll-x-contain px-4 pb-3 scrollbar-hide sm:-mx-1 sm:px-1"
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
    </section>
  )
}
