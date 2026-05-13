type PostHogWindow = {
  capture?: (event: string, properties?: Record<string, any>) => void
  identify?: (id?: string, properties?: Record<string, any>) => void
  register?: (properties: Record<string, any>) => void
  people?: {
    set?: (properties: Record<string, any>) => void
  }
  reset?: () => void
}

declare global {
  interface Window {
    posthog?: PostHogWindow
  }
}

export const isPosthogAvailable = (): boolean =>
  typeof window !== 'undefined' && !!window.posthog

export const getPosthog = (): PostHogWindow | undefined =>
  typeof window !== 'undefined' ? window.posthog : undefined

export const capture = (event: string, properties?: Record<string, any>): void => {
  const ph = getPosthog()
  if (ph?.capture) ph.capture(event, properties)
}

export const identify = (id?: string, properties?: Record<string, any>): void => {
  const ph = getPosthog()
  if (ph?.identify) ph.identify(id, properties)
}

export const register = (properties: Record<string, any>): void => {
  const ph = getPosthog()
  if (ph?.register) ph.register(properties)
}

export const setPeopleProps = (properties: Record<string, any>): void => {
  const ph = getPosthog()
  if (ph?.people?.set) ph.people.set(properties)
  else if (ph?.register) ph.register(properties)
}

export const reset = (): void => {
  const ph = getPosthog()
  if (ph?.reset) ph.reset()
}
