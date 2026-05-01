// src/hooks/useProducts.ts 
import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../lib/api'
import type { DBProductWithCategory } from '../lib/database.types'

interface Options {
  categoryId?: string | null
  search?: string
  featuredOnly?: boolean
  includeUnavailable?: boolean
  limit?: number
  refetchOnFocus?: boolean
}

export function useProducts(options: Options = {}) {
  const [products, setProducts] = useState<DBProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const optionsRef = useRef(options)
  optionsRef.current = options

  // Monotonically-increasing fetch ID. Only the most recent fetch may update state.
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts(optionsRef.current)
      if (id === fetchIdRef.current) {
        setProducts(data)
      }
    } catch (e) {
      if (id === fetchIdRef.current) {
        setError(e instanceof Error ? e.message : 'Failed to load products')
      }
    } finally {
      if (id === fetchIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [
    fetch,
    options.categoryId,
    options.search,
    options.featuredOnly,
    options.includeUnavailable,
  ])

  const { refetchOnFocus } = options
  useEffect(() => {
    if (!refetchOnFocus) return
    window.addEventListener('focus', fetch)
    return () => window.removeEventListener('focus', fetch)
  }, [fetch, refetchOnFocus])

  return { products, loading, error, refetch: fetch }
}