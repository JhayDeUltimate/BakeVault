/**
 * Image utilities for BakeVault
 *
 * NOTE: Supabase image transformation (/render/image/) is a Pro-plan feature.
 * On the free tier it returns 404, which broke all product images.
 * Supabase URLs are rendered directly when no resizing is requested. Other
 * remote URLs are routed through images.weserv.nl so the browser image CSP can
 * stay narrow.
 *
 * If you upgrade to Supabase Pro, you can re-enable the transform by uncommenting
 * the optimizeSupabaseUrl function below and calling it from optimizeImageUrl.
 */

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800'

const DIRECT_IMAGE_HOSTS = new Set([
  'hmcggmpetetyjeznhaos.supabase.co',
  'images.unsplash.com',
  'images.weserv.nl',
])

function proxiedImageUrl(
  parsed: URL,
  opts: { width?: number; height?: number; quality: number; fit?: 'cover' | 'inside' | 'contain' },
): string {
  const remote = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`
  const params = new URLSearchParams({ url: remote })

  if (opts.width) params.set('w', String(opts.width))
  if (opts.height) params.set('h', String(opts.height))
  if (opts.width || opts.height) params.set('fit', opts.fit ?? 'cover')
  params.set('q', String(opts.quality))

  return `https://images.weserv.nl/?${params.toString()}`
}

/**
 * Returns the image URL suitable for display.
 * - Supabase Storage and trusted external image hosts are returned as-is when no resizing is requested
 * - resized or untrusted remote images are loaded through images.weserv.nl
 * - proxied URLs preserve the source protocol and querystring
 * - null/undefined falls back to FALLBACK_IMAGE
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  _opts?: { width?: number; height?: number; quality?: number; fit?: 'cover' | 'inside' | 'contain' },
): string {
  const source = url?.trim()
  if (!source) return FALLBACK_IMAGE

  const opts = _opts ?? {}
  const { width, height, quality = 75, fit } = opts

  if (/^(blob|data):/i.test(source) || source.startsWith('/')) return source

  try {
    const parsed = new URL(source)

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return source

    if (!width && !height && DIRECT_IMAGE_HOSTS.has(parsed.hostname)) return source
    if (parsed.hostname === 'images.weserv.nl') return source
    return proxiedImageUrl(parsed, { width, height, quality, fit })
  } catch (e) {
    return source
  }
}

/*
 * ── Pro-plan transform (uncomment if you upgrade to Supabase Pro) ─────────
 *
 * export function optimizeImageUrl(
 *   url: string | null | undefined,
 *   opts: { width: number; height: number; quality?: number } = { width: 400, height: 400 },
 * ): string {
 *   if (!url) return FALLBACK_IMAGE
 *   const { width, height, quality = 75 } = opts
 *   if (url.includes('/storage/v1/object/public/')) {
 *     const renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
 *     const base = renderUrl.split('?')[0]
 *     return `${base}?width=${width}&height=${height}&resize=cover&quality=${quality}`
 *   }
 *   return url
 * }
 */

/**
 * Returns a deduplicated, ordered list of image URLs for a product.
 *
 * Priority: image_urls array (if non-empty) → image_url alone.
 * Deduplication via Set preserves insertion order.
 * Fixes M4: prevents the same image appearing twice in the modal carousel.
 */
export function getProductImages(p: { image_url?: string | null; image_urls?: string[] | null }): string[] {
  const extras = p.image_urls?.filter(u => u.length > 0) ?? []

  const candidates = extras.length > 0
    ? extras
    : p.image_url
      ? [p.image_url]
      : []

  return [...new Set(candidates)]
}

/** Thumbnail size presets — kept for API compatibility, values unused on free plan */
export const IMG = {
  card: { width: 360, height: 270 },
  hero: { width: 1200, height: 700 },
  modal: { width: 800, height: 600 },
  adminThumb: { width: 80, height: 80 },
  cartThumb: { width: 200, height: 200 },
} as const
