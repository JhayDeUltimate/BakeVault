import React from 'react'
import type { Product } from '../types'

interface ProductCardProps {
  product:     Product
  onAddToCart: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-orange-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
      <div className="relative aspect-[3/2] sm:aspect-square overflow-hidden bg-brand-cream/50 border-b border-orange-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={e => {
            ;(e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400'
          }}
        />
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <span className="bg-white/95 backdrop-blur-md text-[7px] sm:text-[9px] font-bold text-brand-brown px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-[0.1em] shadow-sm border border-orange-50">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5 flex flex-col flex-grow text-center">
        <div className="mb-2 sm:mb-4">
          <h3 className="text-[11px] sm:text-base font-bold text-brand-darkGray mb-1 leading-tight min-h-[28px] sm:min-h-[44px] line-clamp-2 font-display">
            {product.name}
          </h3>
        </div>

        <div className="mt-auto pt-2 sm:pt-4 border-t border-orange-50 space-y-2 sm:space-y-4">
          <div className="hidden sm:flex flex-col items-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-brand-brown font-extrabold text-[9px] sm:text-[10px] font-display tracking-tight uppercase bg-brand-brown/5 px-1.5 py-0.5 rounded-md border border-brand-brown/10">
                Retail
              </span>
              <span className="text-brand-darkGray/20 text-[9px] sm:text-[10px]">|</span>
              <span className="text-brand-brown font-extrabold text-[9px] sm:text-[10px] font-display tracking-tight uppercase bg-brand-brown/5 px-1.5 py-0.5 rounded-md border border-brand-brown/10">
                Wholesale
              </span>
            </div>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-brand-orange hover:bg-brand-brown text-white py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/5 active:scale-95"
            aria-label={`Add ${product.name} to bag`}
          >
            {/* FIX: was `sm:w-4 h-4` — the unscopeable `h-4` overrode the base `h-3` on all viewports */}
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-bold text-[9px] sm:text-xs">Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard