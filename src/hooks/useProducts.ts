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

type NormalizedOptions = Required<Pick<Options, 'featuredOnly' | 'includeUnavailable'>> & {
  categoryId: string | null
  search: string
  limit: number | undefined
  refetchOnFocus: boolean
}

function normalizeOptions(options: Options): NormalizedOptions {
  const search = options.search?.trim() ?? ''
  const limit = typeof options.limit === 'number' && options.limit > 0 ? options.limit : undefined

  return {
    categoryId: options.categoryId || null,
    search,
    featuredOnly: options.featuredOnly === true,
    includeUnavailable: options.includeUnavailable === true,
    limit,
    refetchOnFocus: options.refetchOnFocus === true,
  }
}

export function useProducts(options: Options = {}) {
  const [products, setProducts] = useState<DBProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const normalizedOptions = normalizeOptions(options)

  const optionsRef = useRef(normalizedOptions)
  optionsRef.current = normalizedOptions

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
    normalizedOptions.categoryId,
    normalizedOptions.search,
    normalizedOptions.featuredOnly,
    normalizedOptions.includeUnavailable,
    normalizedOptions.limit,
  ])

  const { refetchOnFocus } = normalizedOptions
  useEffect(() => {
    if (!refetchOnFocus) return
    window.addEventListener('focus', fetch)
    return () => window.removeEventListener('focus', fetch)
  }, [fetch, refetchOnFocus])

  return { products, loading, error, refetch: fetch }
}
