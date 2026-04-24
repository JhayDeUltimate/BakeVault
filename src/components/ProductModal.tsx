import React, { useEffect, useState } from 'react'
import type { DBProductWithCategory } from '@/lib/database.types'
import { getProductImages, optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'
import { mapDBProduct } from '@/lib/utils'
import ProductAssistant from './ProductAssistant'

interface Props {
  product:     DBProductWithCategory
  onClose:     () => void
  onAddToCart: (p: ReturnType<typeof mapDBProduct>) => void
}

export default function ProductModal({ product, onClose, onAddToCart }: Props) {
  const images = getProductImages(product)
  const [slide, setSlide] = useState(0)
  const mapped = mapDBProduct(product)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setSlide(s => (s + 1) % Math.max(images.length, 1))
      if (e.key === 'ArrowLeft')  setSlide(s => (s - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-brand-darkGray/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col">

        {/* Close */}
        <button onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/10 hover:bg-black/20 text-white rounded-full flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image carousel */}
        <div className="relative w-full aspect-[4/3] bg-brand-cream flex-shrink-0 overflow-hidden rounded-t-[32px] sm:rounded-t-[32px]">
          {images.length === 0 ? (
            <div className="w-full h-full bg-orange-50 animate-pulse flex items-center justify-center">
              <svg className="w-16 h-16 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <>
              <img
                src={optimizeImageUrl(images[slide], IMG.modal)}
                alt={`${product.name} — photo ${slide + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setSlide(s => (s - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={() => setSlide(s => (s + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setSlide(i)}
                        className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-brand-brown uppercase tracking-widest">
              {product.categories?.name ?? 'Baking Supply'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-darkGray font-display mt-1">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-brand-brown bg-brand-brown/5 px-2 py-0.5 rounded-md border border-brand-brown/10 uppercase">
                {product.price_type === 'retail' ? 'Retail' : product.price_type === 'contact' ? 'Contact for price' : 'Wholesale'}
              </span>
            </div>
          </div>

          {product.description ? (
            <p className="text-sm text-brand-darkGray/70 leading-relaxed">{product.description}</p>
          ) : (
            <div className="space-y-2">
              <div className="h-3 bg-orange-50 rounded animate-pulse w-full" />
              <div className="h-3 bg-orange-50 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-orange-50 rounded animate-pulse w-4/6" />
            </div>
          )}

          <button
            onClick={() => { onAddToCart(mapped); onClose() }}
            className="w-full bg-brand-orange hover:bg-brand-brown text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
          >
            Add to Bag
          </button>

          <ProductAssistant productName={product.name} productDescription={product.description ?? ''} />
        </div>
      </div>
    </div>
  )
}