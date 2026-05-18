import { useState, useCallback, useEffect } from 'react'
import type { DBProductWithCategory } from '@/lib/database.types'
import { getProductImages } from '@/lib/image'

const STORAGE_KEY = 'bakevault:recently_viewed'
const MAX_ITEMS   = 10

export interface RecentlyViewedItem {
  id:        string
  name:      string
  slug:      string
  image_url: string | null
  category:  string | null
  viewedAt:  number   // Unix ms timestamp
}

function readStorage(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(items: RecentlyViewedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or blocked in some browsers — fail silently
  }
}

/**
 * localStorage-backed recently viewed product list.
 *
 * - Max 10 items, most-recent first
 * - Deduplicates by product ID (re-view bumps to front)
 * - Syncs across tabs via the `storage` event
 * - Never throws; safe to call inside any component
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>(readStorage)

  // Keep in sync if another tab adds a viewed product
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setItems(readStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addRecentlyViewed = useCallback((product: DBProductWithCategory) => {
    const images = getProductImages(product)
    const entry: RecentlyViewedItem = {
      id:        product.id,
      name:      product.name,
      slug:      product.slug,
      image_url: images[0] ?? product.image_url ?? null,
      category:  product.categories?.name ?? null,
      viewedAt:  Date.now(),
    }

    setItems(prev => {
      const filtered = prev.filter(p => p.id !== entry.id)     // remove stale entry
      const next     = [entry, ...filtered].slice(0, MAX_ITEMS) // insert at front, cap
      writeStorage(next)
      return next
    })
  }, [])

  const clearRecentlyViewed = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { items, addRecentlyViewed, clearRecentlyViewed }
}
