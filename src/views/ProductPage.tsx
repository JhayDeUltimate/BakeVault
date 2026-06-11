import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { mapDBProduct } from '@/lib/utils'
import { getProductImages, optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'
import { useCart } from '@/lib/cart-context'
import { trackEvent } from '@/lib/analytics'
import { Helmet } from 'react-helmet-async'
import ProductCard from '@/components/ProductCard'
import ProductAssistant from '@/components/ProductAssistant'
import RecentlyViewedStrip from '@/components/RecentlyViewedStrip'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton'
import { useRecentlyViewed } from '@/hooks'
import { parseProductDescription } from '@/lib/product-description'
import type { DBProductWithCategory } from '@/lib/database.types'

const SITE_URL = 'https://bakevault.com.ng'

function cleanLine(line: string): string {
  return line.replace(/^(?:\u2022|-|\u00e2\u20ac\u00a2)\s*/, '').trim()
}

function findSection(
  sections: ReturnType<typeof parseProductDescription>['sections'],
  headings: string[],
) {
  const keys = headings.map(heading => heading.toLowerCase())
  return sections.find(section => keys.includes(section.heading.toLowerCase()))
}

function splitDetailLine(line: string) {
  const cleaned = cleanLine(line)
  const [label, ...rest] = cleaned.split(':')
  if (rest.length === 0) return { label: cleaned, value: 'Available on request' }
  return { label: label.trim(), value: rest.join(':').trim() || 'Available on request' }
}

function priceTypeLabel(priceType: DBProductWithCategory['price_type']) {
  if (priceType === 'retail') return 'Retail pricing available'
  if (priceType === 'contact') return 'Enquire for pricing'
  return 'Wholesale pricing available'
}

function featureTitle(feature: string, index: number) {
  const cleaned = cleanLine(feature)
  const beforeBreak = cleaned.split(/\s+(?:for|with|to|and)\s+/i)[0]?.trim()
  if (beforeBreak && beforeBreak.split(/\s+/).length <= 5) return beforeBreak
  return ['Product fit', 'Baker-friendly use', 'Reliable supply'][index] ?? 'Key advantage'
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { addRecentlyViewed, items: recentItems } = useRecentlyViewed()
  const [product, setProduct] = useState<DBProductWithCategory | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<DBProductWithCategory[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(0)
  const assistantRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!slug) return

    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('slug', slug!)
        .eq('is_available', true)
        .single()

      if (error || !data) {
        navigate('/catalog', { replace: true })
      } else {
        const p = data as DBProductWithCategory
        setProduct(p)
        addRecentlyViewed(p)
        trackEvent('product_view', {
          product_id: data.id,
          product_name: data.name,
          category: (data as DBProductWithCategory).categories?.name ?? '',
        })
      }
      setLoading(false)
    }

    fetchProduct()
  }, [slug, navigate, addRecentlyViewed])

  useEffect(() => {
    if (!product?.category_id) {
      setRelatedProducts([])
      return
    }

    let cancelled = false
    async function fetchRelatedProducts() {
      setRelatedLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('category_id', product!.category_id!)
        .eq('is_available', true)
        .neq('id', product!.id)
        .order('display_order', { ascending: true })
        .limit(5)

      if (!cancelled) {
        setRelatedProducts(error ? [] : (data ?? []) as DBProductWithCategory[])
        setRelatedLoading(false)
      }
    }

    fetchRelatedProducts()
    return () => { cancelled = true }
  }, [product?.id, product?.category_id])

  useEffect(() => {
    if (!product?.id) return
    setSlide(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [product?.id])

  if (loading) return (
    <div className="flex-grow flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-brand-orange rounded-full animate-spin" />
    </div>
  )

  if (!product) return null

  const images = getProductImages(product)
  const mapped = mapDBProduct(product)
  const parsedDescription = parseProductDescription(product.description)
  const categoryName = product.categories?.name ?? 'Baking Supply'
  const priceLabel = priceTypeLabel(product.price_type)

  const productDescriptionSection = findSection(parsedDescription.sections, ['Product Description'])
  const productDetailsSection = findSection(parsedDescription.sections, ['Product Details'])
  const specificationsSection = findSection(parsedDescription.sections, ['Specifications'])
  const bestForSection = findSection(parsedDescription.sections, ['Best For', 'Who Should Buy?'])
  const usageSection = findSection(parsedDescription.sections, ['Usage Tips'])
  const storageSection = findSection(parsedDescription.sections, ['Storage Tips'])

  const productDetailBullets = productDetailsSection?.lines.length
    ? productDetailsSection.lines.map(cleanLine)
    : parsedDescription.features.slice(0, 6)

  const detailRows = specificationsSection?.lines.length
    ? specificationsSection.lines.map(splitDetailLine)
    : [
      { label: 'Category', value: categoryName },
      { label: 'Pricing', value: priceLabel },
      { label: 'Availability', value: product.is_available ? 'Available for quote' : 'Currently unavailable' },
      { label: 'Product Type', value: 'Baking ingredient or supply' },
      { label: 'Ordering', value: 'Quote and confirmation via WhatsApp' },
      { label: 'Images', value: `${Math.max(images.length, 1)} product photo${Math.max(images.length, 1) === 1 ? '' : 's'}` },
    ]

  const standOutFeatures = (parsedDescription.features.length > 0
    ? parsedDescription.features
    : [parsedDescription.summary || `${product.name} is available from BakeVault Lagos.`]
  ).slice(0, 3)

  const descriptionBody = productDescriptionSection?.lines.length
    ? productDescriptionSection.lines.map(cleanLine).join(' ')
    : parsedDescription.summary || product.description || ''

  const buyerSections: Array<{ title: string; lines: string[] }> = []
  if (bestForSection) buyerSections.push({ title: 'Best fit', lines: bestForSection.lines })
  if (usageSection) buyerSections.push({ title: 'Usage guidance', lines: usageSection.lines })
  if (storageSection) buyerSections.push({ title: 'Storage notes', lines: storageSection.lines })

  const metaTitle = `${product.name} | BakeVault Lagos`
  const metaDescription = product.description
    ? product.description.split('\n')[0].slice(0, 160)
    : `Buy ${product.name} from BakeVault Lagos. Premium baking supplies delivered same-day in Lagos.`
  const metaImage = images[0] ?? `${SITE_URL}/og-image.jpg`
  const metaUrl = `${SITE_URL}/products/${product.slug}`

  function addProductToCart() {
    if (!product) return
    addToCart(mapped)
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      category: product.categories?.name ?? '',
    })
  }

  function scrollToAssistant() {
    assistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openRelatedProduct(p: ReturnType<typeof mapDBProduct>) {
    const raw = relatedProducts.find(item => item.id === p.id)
    if (!raw) return
    trackEvent('product_view', { product_id: raw.id, product_name: raw.name, category: raw.categories?.name ?? '' })
    navigate(`/products/${raw.slug}`)
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={metaUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={metaUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta property="og:site_name" content="BakeVault Lagos" />
        <meta property="og:locale" content="en_NG" />
        <meta property="product:category" content={categoryName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: metaDescription,
          image: images,
          brand: { '@type': 'Brand', name: 'BakeVault Lagos' },
          category: categoryName,
          offers: {
            '@type': 'Offer',
            url: metaUrl,
            priceCurrency: 'NGN',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'BakeVault Lagos' },
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Catalog', item: `${SITE_URL}/catalog` },
              { '@type': 'ListItem', position: 3, name: product.name, item: metaUrl },
            ],
          },
        })}</script>
      </Helmet>

      <nav className="flex items-center gap-2 text-xs text-brand-darkGray/40 font-bold uppercase tracking-wider mb-8">
        <button onClick={() => navigate(-1)} className="hover:text-brand-orange transition-colors mr-1" aria-label="Go back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => navigate('/catalog')} className="hover:text-brand-orange transition-colors">
          Catalog
        </button>
        {product.categories?.name && (
          <>
            <span>/</span>
            <button onClick={() => navigate(`/catalog?cat=${encodeURIComponent(product.categories!.name)}`)} className="hover:text-brand-orange transition-colors">
              {product.categories.name}
            </button>
          </>
        )}
        <span>/</span>
        <span className="text-brand-darkGray/70">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_20rem] lg:items-start">
        <div className="space-y-3">
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
            <img
              src={optimizeImageUrl(images[slide] ?? null, IMG.modal)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSlide(s => (s - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSlide(s => (s + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setSlide(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === slide ? 'border-brand-orange' : 'border-orange-100'}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={optimizeImageUrl(img, IMG.adminThumb)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-bold text-brand-brown uppercase tracking-widest">
              {categoryName}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-darkGray font-display mt-1 leading-tight">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-brand-brown bg-brand-brown/5 px-2 py-1 rounded-md border border-brand-brown/10 uppercase tracking-wide">
                {priceLabel}
              </span>
              <button
                type="button"
                onClick={scrollToAssistant}
                className="text-[10px] font-bold text-brand-orange hover:text-brand-brown underline underline-offset-4 uppercase tracking-wide"
              >
                Ask a question
              </button>
            </div>
            {parsedDescription.summary && (
              <p className="mt-4 text-sm sm:text-base text-brand-darkGray/70 leading-relaxed font-medium">
                {parsedDescription.summary}
              </p>
            )}
          </div>

          {parsedDescription.features.length > 0 && (
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-black text-brand-darkGray/40 uppercase tracking-widest mb-2">
                Key Features
              </h2>
              <ul className="space-y-2">
                {parsedDescription.features.slice(0, 6).map(feature => (
                  <li key={feature} className="flex gap-2 text-sm text-brand-darkGray/70 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    <span>{cleanLine(feature)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black text-brand-darkGray/40 uppercase tracking-widest">
            Request Quote
          </p>
          <p className="mt-2 text-2xl font-extrabold text-brand-darkGray font-display">
            Price on WhatsApp
          </p>
          <p className="mt-2 text-sm leading-relaxed text-brand-darkGray/60">
            Add this product to your order bag, then send it to BakeVault for pricing, availability, and delivery confirmation.
          </p>
          <button
            onClick={addProductToCart}
            className="mt-5 w-full bg-brand-orange hover:bg-brand-brown text-white font-extrabold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg text-sm font-display uppercase tracking-wide"
          >
            Add to Bag
          </button>
          <button
            type="button"
            onClick={scrollToAssistant}
            className="mt-3 w-full border border-orange-100 bg-orange-50 hover:bg-orange-100 text-brand-brown font-extrabold py-3 rounded-xl transition-colors text-xs uppercase tracking-wide"
          >
            Ask AI Guide
          </button>
          <div className="mt-5 grid grid-cols-2 gap-2 text-center">
            {['Lagos delivery', 'Bulk orders', 'Verified supply', 'WhatsApp quote'].map(item => (
              <div key={item} className="rounded-lg bg-brand-cream/60 px-2 py-3">
                <p className="text-[10px] font-bold text-brand-darkGray/60 uppercase leading-tight">{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-12 sm:mt-16">
        <h2 className="text-lg font-extrabold text-brand-darkGray font-display">
          What Stands Out
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {standOutFeatures.map((feature, index) => (
            <article key={`${feature}-${index}`} className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-brand-orange">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-brand-darkGray font-display">
                {featureTitle(feature, index)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-darkGray/65">
                {cleanLine(feature)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="border-b border-orange-100 pb-3">
          <h2 className="text-2xl font-extrabold text-brand-darkGray font-display">
            Product Details
          </h2>
          <div className="mt-3 h-1 w-36 bg-brand-orange" />
        </div>

        {productDetailBullets.length > 0 && (
          <ul className="mt-6 space-y-5">
            {productDetailBullets.map((line, index) => (
              <li key={`${line}-${index}`} className="flex gap-4 text-sm sm:text-base leading-relaxed text-brand-darkGray/80">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-orange text-white">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 overflow-hidden border border-gray-300 bg-white">
          <div>
            {detailRows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className={`grid grid-cols-[minmax(8rem,0.5fr)_1fr] border-gray-300 text-sm ${index < detailRows.length - 1 ? 'border-b' : ''} ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="border-r border-gray-300 px-4 py-3 font-medium text-brand-darkGray/75">
                  {row.label}
                </div>
                <div className="px-4 py-3 text-brand-darkGray/75">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {buyerSections.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-brand-darkGray font-display">
            Who Should Buy?
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {buyerSections.map(section => (
              <article key={section.title} className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-brand-darkGray font-display">
                  {section.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {section.lines.map((line, index) => (
                    <li key={`${line}-${index}`} className="flex gap-2 text-sm leading-relaxed text-brand-darkGray/65">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                      <span>{cleanLine(line)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <article className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="grid md:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="bg-brand-cream">
              <img
                src={optimizeImageUrl(images[0] ?? null, IMG.modal)}
                alt={product.name}
                className="h-full min-h-64 w-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
              />
            </div>
            <div className="p-6">
              <span className="text-[10px] font-bold text-brand-brown uppercase tracking-widest">
                Product Description
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-brand-darkGray font-display">
                {product.name}
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-brand-darkGray/70 whitespace-pre-line">
                {descriptionBody}
              </p>
            </div>
          </div>
        </article>

        <div id="product-assistant" ref={assistantRef} className="scroll-mt-24">
          <ProductAssistant
            productName={product.name}
            productDescription={product.description ?? ''}
          />
        </div>
      </section>

      {(relatedLoading || relatedProducts.length > 0) && (
        <section className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between gap-4 border-b border-orange-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display">
                Related Products
              </h2>
              <p className="mt-1 text-sm text-brand-darkGray/50">
                More items from {categoryName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/catalog?cat=${encodeURIComponent(categoryName)}`)}
              className="text-xs sm:text-sm font-bold text-brand-brown hover:text-brand-orange transition-colors whitespace-nowrap"
            >
              View Category
            </button>
          </div>

          {relatedLoading ? (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-64 rounded-2xl bg-orange-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
              {relatedProducts.map(related => {
                const mappedRelated = mapDBProduct(related)
                return (
                  <ProductCard
                    key={related.id}
                    product={mappedRelated}
                    onAddToCart={p => {
                      addToCart(p)
                      trackEvent('add_to_cart', { product_id: p.id, product_name: p.name, category: p.category })
                    }}
                    onViewDetails={openRelatedProduct}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}

      <RecentlyViewedStrip
        items={recentItems.filter(i => i.id !== product.id)}
        title="Also Viewed"
        subtitle="Other products you've been exploring"
      />
      <ScrollToTopButton />
    </main>
  )
}
