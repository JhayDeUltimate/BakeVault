import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/types'
import { describe, it, expect } from 'vitest'

const CART_KEY = 'bakevault:cart'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Test Flour',
    category: 'Baking Ingredients',
    price: 'Wholesale',
    image: '',
    ...overrides,
  }
}

describe('CartProvider', () => {
  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.cartCount).toBe(0)
  })

  it('persists cart to localStorage on add', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(makeProduct()))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.cartCount).toBe(1)

    const stored = JSON.parse(localStorage.getItem(CART_KEY)!)
    expect(stored.items).toHaveLength(1)
    expect(stored.items[0].name).toBe('Test Flour')
    expect(typeof stored.ts).toBe('number')
  })

  it('clears expired cart on load', () => {
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000)
    const old = { items: [{ id: '1', name: 'Old', category: 'Baking Ingredients', price: 'Wholesale', image: '', quantity: 2 }], ts: eightDaysAgo }
    localStorage.setItem(CART_KEY, JSON.stringify(old))

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    expect(result.current.items).toHaveLength(0)
  })

  it('preserves cart within the 7-day expiry window', () => {
    const sixDaysAgo = Date.now() - (6 * 24 * 60 * 60 * 1000)
    const recent = { items: [{ id: '1', name: 'Fresh', category: 'Baking Ingredients', price: 'Wholesale', image: '', quantity: 1 }], ts: sixDaysAgo }
    localStorage.setItem(CART_KEY, JSON.stringify(recent))

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('Fresh')
  })

  it('increments quantity when adding an existing product', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    const product = makeProduct()

    act(() => result.current.addToCart(product))
    act(() => result.current.addToCart(product))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.cartCount).toBe(2)
  })

  it('removes a product from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(makeProduct({ id: 'a' })))
    act(() => result.current.addToCart(makeProduct({ id: 'b', name: 'Other' })))

    act(() => result.current.removeFromCart('a'))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('b')
  })

  it('removes item when quantity reaches zero via updateQuantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(makeProduct()))

    act(() => result.current.updateQuantity('1', -1))

    expect(result.current.items).toHaveLength(0)
  })

  it('clears the entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider })
    act(() => result.current.addToCart(makeProduct({ id: 'a' })))
    act(() => result.current.addToCart(makeProduct({ id: 'b' })))

    act(() => result.current.clearCart())

    expect(result.current.items).toHaveLength(0)
    const stored = JSON.parse(localStorage.getItem(CART_KEY)!)
    expect(stored.items).toHaveLength(0)
  })
})
