import React, { createContext, useContext, useEffect, useState } from 'react'
import type { CartItem, Product } from './types'

const CART_STORAGE_KEY = 'bakevault:cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as CartItem[]
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage may be unavailable in private browsing; fail silently
  }
}

interface CartContextType {
  items:             CartItem[]
  isCartOpen:        boolean
  isCategoriesOpen:  boolean
  openCart:          () => void
  closeCart:         () => void
  openCategories:    () => void
  closeCategories:   () => void
  addToCart:         (product: Product) => void
  removeFromCart:    (id: string) => void
  updateQuantity:    (id: string, delta: number) => void
  clearCart:         () => void
  cartCount:         number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,            setItems]            = useState<CartItem[]>(loadCart)
  const [isCartOpen,       setIsCartOpen]       = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(items)
  }, [items])

  function addToCart(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
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
      isCartOpen,       isCategoriesOpen,
      openCart:         () => setIsCartOpen(true),
      closeCart:        () => setIsCartOpen(false),
      openCategories:   () => setIsCategoriesOpen(true),
      closeCategories:  () => setIsCategoriesOpen(false),
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