import React from 'react'
import { Outlet } from 'react-router-dom'
import Header          from './Header'
import Cart            from './Cart'
import CategoryMenu    from './CategoryMenu'
import Footer          from './sections/Footer'
import { useCart }     from '@/lib/cart-context'

export default function PublicLayout() {
  const {
    items, isCartOpen, isCategoriesOpen,
    openCart, closeCart, openCategories, closeCategories,
    removeFromCart, updateQuantity, cartCount,
  } = useCart()

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cartCount}
        onOpenCart={openCart}
        onOpenCategories={openCategories}
      />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
      <CategoryMenu
        isOpen={isCategoriesOpen}
        onClose={closeCategories}
      />
    </div>
  )
}