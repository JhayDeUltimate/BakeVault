import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../src/lib/api'
import type { DBProductWithCategory } from '../src/lib/database.types'
 
interface UseProductsOptions {
  categoryId?: string | null
  search?: string
  featuredOnly?: boolean
  includeUnavailable?: boolean
}
 
interface UseProductsResult {
  products: DBProductWithCategory[]
  loading: boolean
  error: string | null
  refetch: () => void
}
 
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts]   = useState<DBProductWithCategory[]>([])
  const [loading,  setLoading]    = useState(true)
  const [error,    setError]      = useState<string | null>(null)
 
  // Stable ref so the callback doesn't recreate on every render
  const optionsRef = useRef(options)
  optionsRef.current = options
 
  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts(optionsRef.current)
      setProducts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
 
  // Re-fetch when filter values change
  useEffect(() => { fetch() }, [
    fetch,
    options.categoryId,
    options.search,
    options.featuredOnly,
    options.includeUnavailable,
  ])
 
  return { products, loading, error, refetch: fetch }
}
