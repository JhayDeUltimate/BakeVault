import React, { useState } from 'react'
import type { CartItem } from '../types'
import { logEnquiry } from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { useCart } from '../lib/cart-context'
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

  if (!isOpen) return null

  if (!WHATSAPP_NUMBER) {
    console.warn('[BakeVault] VITE_WHATSAPP_NUMBER is not set. WhatsApp checkout will not work.')
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  function getPref(id: string): PricePref {
    return pricePrefs[id] ?? 'piece'
  }

  function setPref(id: string, pref: PricePref) {
    setPricePrefs(prev => ({ ...prev, [id]: pref }))
  }

  function handleCheckout() {
    if (!WHATSAPP_NUMBER) {
      alert('WhatsApp checkout is not configured. Please contact the store directly.')
      return
    }

    const orderText = items
      .map(item => {
        const pref = getPref(item.id)
        const prefLabel = pref === 'piece' ? 'Per Piece' : 'Per Carton'
        return `• ${item.name} (Qty: ${item.quantity}) — Pricing needed: ${prefLabel}`
      })
      .join('\n')

    const message = `Hello Bakevault! I'd like to get a price quotation for:\n\n${orderText}\n\nPlease confirm availability and total price.`
    const encoded = encodeURIComponent(message)

    // Fire-and-forget DB logging — must never block WhatsApp
    logEnquiry(
      items.map(i => ({ product_id: i.id, product_name: i.name, category: i.category, quantity: i.quantity })),
      message
    )
    trackEvent('cart_checkout', { item_count: totalItems })

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer')
    setCheckoutSuccess(true)
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
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-2xl">

            {/* Header */}
            <div className="flex-1 py-8 overflow-y-auto px-6 sm:px-8">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-extrabold text-brand-darkGray font-display uppercase tracking-tight">
                  Your Order
                </h2>
                <button onClick={onClose} aria-label="Close cart"
                  className="ml-3 p-2 text-brand-darkGray/40 hover:text-brand-orange transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="mt-10">
                {items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="bg-brand-cream w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="h-10 w-10 text-brand-brown/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-brand-darkGray/60 font-medium italic">Nothing added yet. Browse the vault and add what you need.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-orange-50">
                    {items.map(item => (
                      <li key={item.id} className="py-6 flex flex-col gap-3 group">
                        {/* Product row */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-24 h-24 bg-brand-cream border border-orange-50 rounded-2xl overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200' }}
                            />
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex justify-between text-sm font-bold text-brand-darkGray font-display">
                              <h3 className="truncate pr-2">{item.name}</h3>
                            </div>
                            <p className="mt-1 text-xs font-bold text-brand-brown tracking-wide">{item.category}</p>

                            <div className="flex-1 flex items-end justify-between text-sm mt-2">
                              <div className="flex items-center gap-4 bg-brand-cream rounded-xl p-1.5 border border-orange-100/50">
                                <button onClick={() => onUpdateQuantity(item.id, -1)} aria-label="Decrease quantity"
                                  className="w-11 h-11 flex items-center justify-center hover:bg-white rounded-lg transition-all text-brand-darkGray font-bold shadow-sm">
                                  -
                                </button>
                                <span className="font-extrabold w-6 text-center text-brand-darkGray">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} aria-label="Increase quantity"
                                  className="w-11 h-11 flex items-center justify-center hover:bg-white rounded-lg transition-all text-brand-darkGray font-bold shadow-sm">
                                  +
                                </button>
                              </div>
                              <button type="button" onClick={() => onRemove(item.id)}
                                className="font-bold text-xs uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price preference toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-darkGray/50 uppercase tracking-wider">
                            I want pricing for:
                          </span>
                          <div className="flex rounded-lg overflow-hidden border border-orange-200 bg-brand-cream">
                            {(['piece', 'carton'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setPref(item.id, type)}
                                className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider transition-colors ${
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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-brand-cream/30 border-t border-orange-100 py-6 px-6 sm:px-8">
              <div className="flex justify-between items-center text-lg font-extrabold text-brand-darkGray font-display">
                <p>Your Request Summary</p>
                <p>{totalItems} Items</p>
              </div>
              <p className="mt-2 text-xs text-brand-darkGray/50 leading-relaxed font-medium">
                Prices and delivery costs are confirmed by our team via WhatsApp. Orders above ₦50,000 qualify for wholesale discounts.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !WHATSAPP_NUMBER}
                  className="w-full flex justify-center items-center px-8 py-4 rounded-2xl shadow-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed gap-3 uppercase"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-1.071 3.914 4.024-1.056c.915.541 1.983.853 3.12.853 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767z" />
                  </svg>
                  Request a Quote on WhatsApp
                </button>

                {checkoutSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-green-700">✓ WhatsApp opened! Your order details have been sent.</p>
                    <button type="button" onClick={() => { clearCart(); setPricePrefs({}); setCheckoutSuccess(false) }}
                      className="mt-2 text-xs font-bold text-green-600 hover:text-green-800 underline transition-colors">
                      Clear cart &amp; close
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button type="button" onClick={onClose}
                    className="text-brand-brown font-extrabold hover:text-brand-orange transition-colors underline decoration-2 underline-offset-4 text-sm">
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