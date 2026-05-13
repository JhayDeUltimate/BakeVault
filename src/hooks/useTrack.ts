import { useCallback } from 'react'
import { usePostHog } from '@posthog/react'

export const useTrack = () => {
  const posthog = usePostHog()

  return useCallback((event: string, properties?: Record<string, any>) => {
    if (!posthog?.capture) return
    try {
      posthog.capture(event, properties)
    } catch {
      // ignore
    }
  }, [posthog])
}
