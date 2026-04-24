import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../lib/api'
import type { DBProductWithCategory } from '../lib/database.types'

interface Options {
  categoryId?:         string | null
  search?:             string
  featuredOnly?:       boolean
  includeUnavailable?: boolean
  /**
   * Re-fetch when the browser window regains focus.
   * Default: false — prevents admin pages from reloading on every tab-switch.
   */
  refetchOnFocus?: boolean
}

export function useProducts(options: Options = {}) {
  const [products, setProducts] = useState<DBProductWithCategory[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  // Keep a ref so the fetch callback never goes stale without re-creating itself
  const optionsRef = useRef(options)
  optionsRef.current = options

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      setProducts(await getProducts(optionsRef.current))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch whenever any filter option changes
  useEffect(() => {
    fetch()
  }, [
    fetch,
    options.categoryId,
    options.search,
    options.featuredOnly,
    options.includeUnavailable,
  ])

  // Attach/detach the focus listener whenever refetchOnFocus changes.
  // This effect is correctly gated on refetchOnFocus so toggling it at
  // runtime works without leaving orphaned listeners.
  const { refetchOnFocus } = options
  useEffect(() => {
    if (!refetchOnFocus) return
    window.addEventListener('focus', fetch)
    return () => window.removeEventListener('focus', fetch)
  }, [fetch, refetchOnFocus])

  return { products, loading, error, refetch: fetch }
}