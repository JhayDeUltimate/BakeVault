import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '../lib/api'
import type { DBCategory } from '../lib/database.types'

export function useCategories() {
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  const fetch = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      setLoading(true); setError(null)
      const data = await getCategories()
      if (!signal?.cancelled) setCategories(data)
    } catch (e) {
      if (!signal?.cancelled) setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      if (!signal?.cancelled) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const signal = { cancelled: false }
    fetch(signal)
    return () => { signal.cancelled = true }
  }, [fetch])

  return { categories, loading, error, refetch: fetch }
}