import { useEffect, useState } from 'react'
import { getTestimonials } from '../lib/api'
import { CACHE_TTL, getOrSetClientCache } from '@/lib/client-cache'
import type { DBTestimonial } from '../lib/database.types'

export function useTestimonials(visibleOnly = true) {
  const [testimonials, setTestimonials] = useState<DBTestimonial[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOrSetClientCache(`testimonials:${visibleOnly}`, () => getTestimonials(visibleOnly), {
      ttlMs: CACHE_TTL.testimonials,
      storage: 'localStorage',
    })
      .then(data  => { if (!cancelled) setTestimonials(data) })
      .catch(e    => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [visibleOnly])

  return { testimonials, loading, error }
}
