import { describe, expect, it } from 'vitest'
import { optimizeImageUrl } from '@/lib/image'

const source = 'https://cdn.example.com/products/muffin-tray.png?campaign=autumn'

describe('optimizeImageUrl', () => {
  it('keeps cover as the default proxy fit for existing resized callers', () => {
    const proxied = new URL(optimizeImageUrl(source, { width: 360, height: 270 }))

    expect(proxied.hostname).toBe('images.weserv.nl')
    expect(proxied.searchParams.get('fit')).toBe('cover')
    expect(proxied.searchParams.get('url')).toBe(source)
  })

  it('passes through an explicitly non-cropping proxy fit', () => {
    const proxied = new URL(optimizeImageUrl(source, { width: 1200, height: 700, fit: 'inside' }))

    expect(proxied.searchParams.get('fit')).toBe('inside')
  })
})
