import React from 'react'
import type { Product } from '../types'
import { optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'

interface Props {
  product:        Product
  onAddToCart:    (p: Product) => void
  onViewDetails?: (p: Product) => void
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onViewDetails }) => {
  const isClickable   = !!onViewDetails
  const optimizedSrc  = optimizeImageUrl(product.image, IMG.card)

  return (
    <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-orange-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">

      {/* Image */}
      <div
        className={`relative aspect-[3/2] sm:aspect-square overflow-hidden bg-brand-cream/50 border-b border-orange-50 ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={isClickable ? () => onViewDetails!(product) : undefined}
      >
        <img
          src={optimizedSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          onError={e => {
            const img = e.target as HTMLImageElement
            if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE
          }}
        />
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <span className="bg-white/95 backdrop-blur-md text-[11px] sm:text-xs font-bold text-brand-brown-text px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-[0.1em] shadow-sm border border-orange-50">
            {product.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow text-center">
        <div className="mb-2 sm:mb-3">
          <h3
            className={`text-sm sm:text-base font-bold text-brand-darkGray mb-1 leading-tight min-h-[28px] sm:min-h-[44px] line-clamp-2 font-display ${isClickable ? 'cursor-pointer hover:text-brand-orange transition-colors' : ''}`}
            onClick={isClickable ? () => onViewDetails!(product) : undefined}
          >
            {product.name}
          </h3>
          {isClickable && (
            <button
              type="button"
              onClick={() => onViewDetails!(product)}
              aria-label={`Read description for ${product.name}`}
              className="text-xs text-brand-brown-text/70 hover:text-brand-orange transition-colors font-medium underline underline-offset-2"
            >
              See full details
            </button>
          )}
        </div>

        <div className="mt-auto pt-2 sm:pt-4 border-t border-orange-50 space-y-2 sm:space-y-3">
          <div className="hidden sm:flex justify-center gap-2">
            <span className="text-brand-brown-text/60 font-extrabold text-xs font-display tracking-tight uppercase">
              Price quoted via WhatsApp
            </span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to bag`}
            className="w-full bg-brand-orange hover:bg-brand-brown text-white py-3 sm:py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/5 active:scale-95"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-bold text-xs">Add to Order</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard