import React from 'react'
import { Outlet } from 'react-router'
import Header          from './Header'
import Cart            from './Cart'
import CategoryMenu    from './CategoryMenu'
import Footer          from './sections/Footer'
import WhatsAppButton  from './WhatsAppButton'
import Toast           from './ui/Toast'
import ConsentBanner   from './ui/ConsentBanner'
import SettingsContext from '@/lib/settings-context'
import { getSettings } from '@/lib/api'
import { CACHE_TTL, getOrSetClientCache } from '@/lib/client-cache'
import { useEffect, useState } from 'react'
import { useCart }     from '@/lib/cart-context'
import { usePageTracking } from '@/hooks'

export default function PublicLayout() {
  usePageTracking()
  const {
    items, isCartOpen, isCategoriesOpen,
    openCart, closeCart, openCategories, closeCategories,
    removeFromCart, updateQuantity, cartCount,
  } = useCart()

  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getOrSetClientCache('settings:public', getSettings, {
      ttlMs: CACHE_TTL.settings,
      storage: 'localStorage',
    })
      .then(raw => { if (!cancelled) setSettingsMap(raw) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSettingsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <SettingsContext.Provider value={{ settings: settingsMap, loading: settingsLoading }}>
    <div className="min-h-dvh flex flex-col overflow-x-hidden bg-brand-cream">
      <Header
        cartCount={cartCount}
        onOpenCart={openCart}
        onOpenCategories={openCategories}
      />
      <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden pt-16 sm:pt-20">
        <Outlet />
        <Footer />
      </div>
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
      <Toast />
      <ConsentBanner />
      <WhatsAppButton />
    </div>
    </SettingsContext.Provider>
  )
}
