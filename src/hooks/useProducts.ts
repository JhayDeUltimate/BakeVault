// src/hooks/useProducts.ts 
import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../lib/api'
import { CACHE_TTL, getOrSetClientCache, stableSerialize } from '@/lib/client-cache'
import { fuzzyMatch } from '@/lib/fuzzy-search'
import type { DBProductWithCategory } from '../lib/database.types'

interface Options {
  categoryId?: string | null
  search?: string
  featuredOnly?: boolean
  includeUnavailable?: boolean
  limit?: number
  refetchOnFocus?: boolean
  includeDescription?: boolean
}

type NormalizedOptions = Required<Pick<Options, 'featuredOnly' | 'includeUnavailable'>> & {
  categoryId: string | null
  search: string
  limit: number | undefined
  refetchOnFocus: boolean
  includeDescription: boolean
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
    includeDescription: options.includeDescription ?? options.featuredOnly === true,
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
      const { refetchOnFocus: _refetchOnFocus, search: _search, ...cacheableOptions } = optionsRef.current
      const data = await getOrSetClientCache(
        `products:${stableSerialize(cacheableOptions)}`,
        () => getProducts({ ...optionsRef.current, search: undefined }),
        {
          ttlMs: CACHE_TTL.products,
          storage: 'localStorage',
          force,
        },
      )
      if (id === fetchIdRef.current) {
        const search = optionsRef.current.search
        if (search) {
          // Client-side fuzzy matching against name + category name
          const targets = data.map(p => ({
            id: p.id,
            text: [p.name, p.categories?.name].filter(Boolean).join(' '),
          }))
          const matched = fuzzyMatch(search, targets)
          const matchedIds = new Set(matched.map(m => m.id))
          const idToScore = new Map(matched.map(m => [m.id, m.score]))
          const filtered = data
            .filter(p => matchedIds.has(p.id))
            .sort((a, b) => (idToScore.get(b.id) ?? 0) - (idToScore.get(a.id) ?? 0))
          setProducts(filtered)
        } else {
          setProducts(data)
        }
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
    normalizedOptions.includeDescription,
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
