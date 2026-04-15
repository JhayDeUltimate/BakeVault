import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../lib/api'
import type { DBProductWithCategory } from '../lib/database.types'

interface Options {
  categoryId?:         string | null
  search?:             string
  featuredOnly?:       boolean
  includeUnavailable?: boolean
}

export function useProducts(options: Options = {}) {
  const [products, setProducts] = useState<DBProductWithCategory[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

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

  useEffect(() => {
    fetch()
  }, [fetch, options.categoryId, options.search, options.featuredOnly, options.includeUnavailable])
  
  useEffect(() => {
    window.addEventListener('focus', fetch)
    return () => window.removeEventListener('focus', fetch)
  }, [fetch])

  return { products, loading, error, refetch: fetch }
}