// src/hooks/useProducts.ts 
import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../lib/api'
import { CACHE_TTL, getOrSetClientCache, stableSerialize } from '@/lib/client-cache'
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

  const fetch = useCallback(async (force = false) => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const { refetchOnFocus: _refetchOnFocus, ...cacheableOptions } = optionsRef.current
      const data = await getOrSetClientCache(
        `products:${stableSerialize(cacheableOptions)}`,
        () => getProducts(optionsRef.current),
        {
          ttlMs: CACHE_TTL.products,
          storage: 'localStorage',
          force,
        },
      )
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
    const onFocus = () => { void fetch() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetch, refetchOnFocus])

  return { products, loading, error, refetch: () => fetch(true) }
}
