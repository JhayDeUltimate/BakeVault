import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '../lib/api'
import type { DBCategory } from '../lib/database.types'

export function useCategories() {
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      setCategories(await getCategories())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { categories, loading, error, refetch: fetch }
}