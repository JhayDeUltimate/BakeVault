import React, { useState } from 'react'
import type { CartItem } from '@/lib/types'
import { logEnquiry } from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { useCart } from '../lib/cart-context'
import { logger } from '../lib/logger'
import { WHATSAPP_NUMBER } from '../constants'

interface CartProps {
  isOpen:           boolean
  onClose:          () => void
  items:            CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemove:         (id: string) => void
}

type PricePref = 'piece' | 'carton'

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
  const { clearCart } = useCart()
  const [pricePrefs, setPricePrefs] = useState<Record<string, PricePref>>({})
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  if (!isOpen) return null

  if (!WHATSAPP_NUMBER) {
    logger.warn('VITE_WHATSAPP_NUMBER is not set', { event: 'config_missing' })
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  function getPref(id: string): PricePref {
    return pricePrefs[id] ?? 'piece'
  }

  function setPref(id: string, pref: PricePref) {
    setPricePrefs(prev => ({ ...prev, [id]: pref }))
  }

  const prefs = items.map(item => getPref(item.id))
  const hasMixedPricing = prefs.includes('piece') && prefs.includes('carton')

  async function handleCheckout() {
    if (!WHATSAPP_NUMBER || isCheckingOut) return

    setIsCheckingOut(true)
    setCheckoutSuccess(false)

    try {
      const orderText = items
        .map(item => {
          const pref = getPref(item.id)
          const prefLabel = pref === 'piece' ? 'Single unit pricing' : 'Wholesale carton pricing'
          return `\u2022 ${item.name} (Qty: ${item.quantity}) \u2014 Pricing requested: ${prefLabel}`
        })
        .join('\n')

      const message = `Hello Bakevault! I'd like to get a price quotation for:\n\n${orderText}\n\nPlease confirm availability and total price.`
      const encoded = encodeURIComponent(message)
      const waUrl   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`

      // Attempt DB insert first; admin needs this record to fulfil the order.
      const enquiryItems = items.map(i => ({
        product_id:   i.id,
        product_name: i.name,
        category:     i.category,
        quantity:     i.quantity,
      }))

      try {
        await Promise.race([
          logEnquiry(enquiryItems, message),
          // Don't block the WA open for more than 3 seconds if Supabase is slow.
          new Promise<void>(resolve => setTimeout(resolve, 3000)),
        ])
      } catch {
        logger.warn('Enquiry insert failed - order may not appear in admin panel', {
          event: 'enquiry.insert_failed_checkout',
        })
      }

      trackEvent('cart_checkout', { item_count: totalItems })
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      setCheckoutSuccess(true)
    } finally {
      setIsCheckingOut(false)
    }
  }

  function handleClearAll() {
    if (!window.confirm('Remove all items from your bag?')) return
    trackEvent('cart_cleared', { item_count: totalItems })
    clearCart()
    setPricePrefs({})
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-brand-darkGray/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-full max-w-md">
          <div className="h-full flex flex-col bg-white shadow-2xl">

            {/* Header */}
            <div className="flex-1 py-5 overflow-y-auto px-4 sm:py-8 sm:px-8">
              <div className="flex items-start justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-brand-darkGray font-display uppercase tracking-tight">
                  Your Order Bag
                </h2>
                <button onClick={onClose} aria-label="Close cart"
                  className="ml-3 p-2 text-brand-darkGray/40 hover:text-brand-orange transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="mt-6 sm:mt-10">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-brand-cream w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="h-10 w-10 text-brand-brown/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-brand-darkGray/60 font-medium italic mb-6">
                      Nothing added yet. Browse the vault and add what you need.
                    </p>
                    <button
                      onClick={() => {
                        onClose()
                        window.location.href = '/catalog'
                      }}
                      className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-brown text-white font-extrabold px-6 py-3 rounded-2xl transition-all text-sm uppercase tracking-wide"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Browse the Vault
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-orange-50">
                    {items.map(item => (
                      <li key={item.id} className="py-4 sm:py-6 flex flex-col gap-3 group">
                        {/* Product row */}
                        <div className="flex gap-3 sm:gap-4">
                          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-brand-cream border border-orange-50 rounded-xl sm:rounded-2xl overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200' }}
                            />
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex justify-between text-[13px] sm:text-sm leading-tight font-bold text-brand-darkGray font-display">
                              <h3 className="truncate pr-2">{item.name}</h3>
                            </div>
                            <p className="mt-1 text-[11px] sm:text-xs font-bold text-brand-brown tracking-wide">{item.category}</p>

                            <div className="mt-2 rounded-xl sm:rounded-2xl border border-orange-200 bg-orange-50/70 p-2 sm:p-3">
                              <span className="block text-[10px] sm:text-xs font-bold text-brand-darkGray/60 uppercase tracking-wider mb-1.5 sm:mb-2">
                                Pricing type - affects your quote:
                              </span>
                              <div className="flex rounded-lg overflow-hidden border border-orange-200 bg-white">
                                {(['piece', 'carton'] as const).map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setPref(item.id, type)}
                                    aria-pressed={getPref(item.id) === type}
                                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-colors ${
                                      getPref(item.id) === type
                                        ? 'bg-brand-orange text-white'
                                        : 'text-brand-darkGray/50 hover:text-brand-darkGray'
                                    }`}
                                  >
                                    {type === 'piece' ? 'Per piece' : 'Per carton'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex-1 flex items-end justify-between text-sm mt-2">
                              <div className="flex items-center gap-2 sm:gap-4 bg-brand-cream rounded-xl p-1 border border-orange-100/50">
                                <button onClick={() => onUpdateQuantity(item.id, -1)} aria-label="Decrease quantity"
                                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-white rounded-lg transition-all text-brand-darkGray font-bold shadow-sm">
                                  -
                                </button>
                                <span className="font-extrabold w-5 sm:w-6 text-sm sm:text-base text-center text-brand-darkGray">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} aria-label="Increase quantity"
                                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-white rounded-lg transition-all text-brand-darkGray font-bold shadow-sm">
                                  +
                                </button>
                              </div>
                              <button type="button" onClick={() => onRemove(item.id)}
                                className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-brand-cream/30 border-t border-orange-100 py-4 px-4 sm:py-6 sm:px-8">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {[
                  { icon: '/transport.png', text: 'Same-day Lagos delivery' },
                  { icon: '/shield.png', text: 'Verified authentic products' },
                  { icon: '/whatsapp.png', text: 'WhatsApp response in 1hr' },
                ].map(({ icon, text }) => (
                  <span
                    key={text}
                    className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-brand-darkGray/60 bg-brand-cream/60 border border-orange-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1"
                  >
                    <img src={icon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5 object-contain" />
                    {text}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center gap-3 text-[15px] sm:text-lg font-extrabold text-brand-darkGray font-display">
                <p>Your Request Summary</p>
                <p>{totalItems} Items</p>
              </div>
              <p className="mt-2 text-[11px] sm:text-xs text-brand-darkGray/50 leading-relaxed font-medium">
                Prices and delivery costs are confirmed by our team via WhatsApp. Orders above &#8358;50,000 qualify for wholesale discounts.
              </p>
              {hasMixedPricing && (
                <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-3 text-xs text-yellow-800">
                  <p className="font-extrabold uppercase tracking-wide text-yellow-900">Mixed pricing preferences</p>
                  <p className="mt-1 leading-relaxed">
                    Your quote includes both per-piece and per-carton requests. Please review each product before sending.
                  </p>
                </div>
              )}

              <div className="mt-4 sm:mt-5 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !WHATSAPP_NUMBER || isCheckingOut}
                  className="w-full flex justify-center items-center px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed gap-2 sm:gap-3 uppercase"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparing your quote...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-1.071 3.914 4.024-1.056c.915.541 1.983.853 3.12.853 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767z" />
                      </svg>
                      Request a Quote on WhatsApp
                    </>
                  )}
                </button>

                {checkoutSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-green-700">&#10003; WhatsApp opened! Your order details have been sent.</p>
                    <button type="button" onClick={() => { clearCart(); setPricePrefs({}); setCheckoutSuccess(false) }}
                      className="mt-2 text-xs font-bold text-green-600 hover:text-green-800 underline transition-colors">
                      Clear bag &amp; close
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button type="button" onClick={onClose}
                    className="text-brand-brown font-extrabold hover:text-brand-orange transition-colors underline decoration-2 underline-offset-4 text-xs sm:text-sm">
                    Continue Browsing
                  </button>
                  {items.length > 0 && (
                    <button type="button" onClick={handleClearAll}
                      className="text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors">
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
