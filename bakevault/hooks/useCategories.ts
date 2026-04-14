import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '../src/lib/api'
import type { DBCategory } from '../src/lib/database.types'
 
interface UseCategoriesResult {
  categories: DBCategory[]
  loading: boolean
  error: string | null
  refetch: () => void
}
 
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
 
  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
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
