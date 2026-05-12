import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '@/lib/analytics'

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    const title = typeof document !== 'undefined' ? document.title : ''
    // Fire a page_view for every navigation (path + query)
    trackEvent('page_view', { title, path: location.pathname + location.search })
  }, [location.pathname, location.search])
}
