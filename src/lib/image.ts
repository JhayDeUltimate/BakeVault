/**
 * Image utilities for BakeVault
 *
 * NOTE: Supabase image transformation (/render/image/) is a Pro-plan feature.
 * On the free tier it returns 404, which broke all product images.
 * This file now returns original URLs unchanged and relies on browser-native
 * lazy loading for performance instead.
 *
 * If you upgrade to Supabase Pro, you can re-enable the transform by uncommenting
 * the optimizeSupabaseUrl function below and calling it from optimizeImageUrl.
 */

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800'

/**
 * Returns the image URL suitable for display.
 * - Supabase Storage URLs are returned as-is (transform requires Pro plan)
 * - Unsplash URLs keep their existing optimization params unchanged
 * - null/undefined falls back to FALLBACK_IMAGE
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  _opts?: { width?: number; height?: number; quality?: number },
): string {
  if (!url) return FALLBACK_IMAGE
  return url
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
export function getProductImages(p: { image_url?: string | null; image_urls?: unknown }): string[] {
  const extras = Array.isArray(p.image_urls)
    ? (p.image_urls as unknown[]).filter((u): u is string => typeof u === 'string' && u.length > 0)
    : []

  const candidates = extras.length > 0
    ? extras
    : p.image_url
      ? [p.image_url]
      : []

  return [...new Set(candidates)]
}

/** Thumbnail size presets — kept for API compatibility, values unused on free plan */
export const IMG = {
  card:       { width: 400,  height: 400  },
  hero:       { width: 1200, height: 700  },
  modal:      { width: 800,  height: 600  },
  adminThumb: { width: 80,   height: 80   },
  cartThumb:  { width: 200,  height: 200  },
} as const