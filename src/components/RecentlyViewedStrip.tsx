import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecentlyViewedItem } from '@/hooks/useRecentlyViewed'
import { FALLBACK_IMAGE } from '@/lib/image'

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
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/products/${item.slug}`)}
            className="group flex-shrink-0 w-36 sm:w-44 bg-white border border-orange-100 rounded-2xl overflow-hidden hover:border-brand-orange hover:shadow-md transition-all text-left"
            aria-label={`View ${item.name}`}
          >
            {/* Thumbnail */}
            <div className="aspect-square overflow-hidden bg-brand-cream">
              <img
                src={item.image_url ?? FALLBACK_IMAGE}
                alt={item.name}
                loading="lazy"
                decoding="async"
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
        ))}
      </div>
    </section>
  )
}
