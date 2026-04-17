import { useCallback, useEffect, useState } from 'react'
import { getProductRequests } from '../lib/api'
import type { DBProductRequest } from '../lib/database.types'

export function useProductRequests() {
  const [requests, setRequests] = useState<DBProductRequest[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      setRequests(await getProductRequests())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { requests, loading, error, refetch: fetch }
}