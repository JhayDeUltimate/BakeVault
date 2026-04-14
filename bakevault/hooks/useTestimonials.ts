import { useEffect, useState } from 'react'
import { getTestimonials } from '../src/lib/api'
import type { DBTestimonial } from '../src/lib/database.types'
 
export function useTestimonials(visibleOnly = true) {
  const [testimonials, setTestimonials] = useState<DBTestimonial[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
 
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTestimonials(visibleOnly)
      .then(data  => { if (!cancelled) setTestimonials(data) })
      .catch(e    => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [visibleOnly])
 
  return { testimonials, loading, error }
}
