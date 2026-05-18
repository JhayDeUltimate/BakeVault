/**
 * scripts/generate-sitemap.mjs
 *
 * Fetches all available product slugs from Supabase and writes
 * public/sitemap.xml at build time.
 *
 * Usage (called automatically by `npm run build`):
 *   node --env-file=.env.local scripts/generate-sitemap.mjs
 *
 * Env vars required:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * If either env var is missing the script exits with a warning and
 * writes the static-only sitemap so the build isn't blocked.
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH  = resolve(__dirname, '../public/sitemap.xml')
const SITE_URL  = 'https://bakevault.com.ng'

// ── Static routes ─────────────────────────────────────────────────────────────
const STATIC_URLS = [
  { loc: '/',            changefreq: 'weekly',  priority: '1.0' },
  { loc: '/catalog',     changefreq: 'daily',   priority: '0.9' },
  { loc: '/about',       changefreq: 'monthly', priority: '0.7' },
  { loc: '/faq',         changefreq: 'monthly', priority: '0.7' },
  { loc: '/how-to-order',changefreq: 'monthly', priority: '0.7' },
  { loc: '/delivery',    changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact',     changefreq: 'monthly', priority: '0.6' },
  { loc: '/terms',       changefreq: 'yearly',  priority: '0.3' },
  { loc: '/privacy',     changefreq: 'yearly',  priority: '0.3' },
  // SEO landing pages
  { loc: '/yogurt-starter-lagos', changefreq: 'monthly', priority: '0.9' },
  { loc: '/kefir-starter-lagos',  changefreq: 'monthly', priority: '0.9' },
  { loc: '/bread-improver-lagos', changefreq: 'monthly', priority: '0.9' },
]

// ── Fetch product slugs from Supabase ─────────────────────────────────────────
async function fetchProductSlugs(supabaseUrl, supabaseKey) {
  const PAGE = 1000
  let from  = 0
  let slugs = []

  while (true) {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?select=slug,updated_at&is_available=eq.true&order=slug.asc&limit=${PAGE}&offset=${from}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
      }
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Supabase error ${res.status}: ${body}`)
    }

    const page = await res.json()
    slugs.push(...page)
    if (page.length < PAGE) break
    from += PAGE
  }

  return slugs
}

// ── Build XML ─────────────────────────────────────────────────────────────────
function toXml(staticUrls, productRows) {
  const today = new Date().toISOString().split('T')[0]

  const staticEntries = staticUrls.map(({ loc, changefreq, priority }) => `
  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')

  const productEntries = productRows.map(({ slug, updated_at }) => {
    const lastmod = updated_at ? updated_at.split('T')[0] : today
    return `
  <url>
    <loc>${SITE_URL}/products/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${productEntries}
</urlset>
`
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  let productRows = []

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[sitemap] WARNING: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set.\n' +
      '          Writing static-only sitemap. Product pages will be missing.'
    )
  } else {
    try {
      productRows = await fetchProductSlugs(supabaseUrl, supabaseKey)
      console.log(`[sitemap] Fetched ${productRows.length} product slug(s).`)
    } catch (err) {
      console.error('[sitemap] Failed to fetch products — writing static-only sitemap.\n', err.message)
    }
  }

  const xml = toXml(STATIC_URLS, productRows)
  writeFileSync(OUT_PATH, xml, 'utf8')

  const total = STATIC_URLS.length + productRows.length
  console.log(`[sitemap] Written ${total} URL(s) → ${OUT_PATH}`)
}

main().catch(err => {
  console.error('[sitemap] Fatal error:', err)
  process.exit(1)
})
