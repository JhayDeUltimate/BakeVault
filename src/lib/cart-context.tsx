import React, { createContext, useContext, useEffect, useState } from 'react'
import type { CartItem, Product } from './types'
import { lockBodyScroll, unlockBodyScroll } from './scroll-lock'

const CART_STORAGE_KEY = 'bakevault:cart'
// Expire carts after 7 days by default. Adjust this value if needed.
const CART_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7

interface StoredCart {
  items: CartItem[]
  ts?: number
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown

    // Backwards-compatible: previous versions stored a raw array of items.
    // Keep it once, but immediately migrate to the timestamped shape so normal
    // cart expiry applies from this load onward.
    if (Array.isArray(parsed)) {
      const items = parsed as CartItem[]
      saveCart(items)
      return items
    }

    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as StoredCart).items)) {
      const stored = parsed as StoredCart
      if (typeof stored.ts === 'number') {
        if (Date.now() - stored.ts > CART_EXPIRY_MS) {
          try { localStorage.removeItem(CART_STORAGE_KEY) } catch { }
          return []
        }
      }
      if (typeof stored.ts !== 'number') {
        saveCart(stored.items)
      }
      return stored.items
    }

    return []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  try {
    const payload: StoredCart = { items, ts: Date.now() }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage may be unavailable in private browsing; fail silently
  }
}

interface CartContextType {
  items: CartItem[]
  isCartOpen: boolean
  isCategoriesOpen: boolean
  openCart: () => void
  closeCart: () => void
  openCategories: () => void
  closeCategories: () => void
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  cartCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(items)
  }, [items])

  // Lock body scroll when any drawer is open (ref-counted to avoid conflicts with ProductModal)
  const prevLockedRef = React.useRef(false)
  useEffect(() => {
    const shouldLock = isCartOpen || isCategoriesOpen
    if (shouldLock && !prevLockedRef.current) {
      lockBodyScroll()
      prevLockedRef.current = true
    } else if (!shouldLock && prevLockedRef.current) {
      unlockBodyScroll()
      prevLockedRef.current = false
    }
    return () => {
      if (prevLockedRef.current) {
        unlockBodyScroll()
        prevLockedRef.current = false
      }
    }
  }, [isCartOpen, isCategoriesOpen])

  function addToCart(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
    // Notify UI listeners (toasts, micro-interactions) about the add-to-cart action
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bakevault:add-to-cart', { detail: { product } }))
      }
    } catch { }
  }

  function removeFromCart(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateQuantity(id: string, delta: number) {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    )
  }

  function clearCart() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen, isCategoriesOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      openCategories: () => setIsCategoriesOpen(true),
      closeCategories: () => setIsCategoriesOpen(false),
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount: items.reduce((sum, i) => sum + i.quantity, 0),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
