import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { mapDBProduct } from '@/lib/utils'
import { getProductImages, optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'
import { useCart } from '@/lib/cart-context'
import { trackEvent } from '@/lib/analytics'
import { Helmet } from 'react-helmet-async'
import ProductAssistant from '@/components/ProductAssistant'
import RecentlyViewedStrip from '@/components/RecentlyViewedStrip'
import { useRecentlyViewed } from '@/hooks'
import type { DBProductWithCategory } from '@/lib/database.types'

const SITE_URL = 'https://bakevault.com.ng'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { addRecentlyViewed, items: recentItems } = useRecentlyViewed()
  const [product, setProduct] = useState<DBProductWithCategory | null>(null)
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
  }, [slug, navigate])

  if (loading) return (
    <div className="flex-grow flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-brand-orange rounded-full animate-spin" />
    </div>
  )

  if (!product) return null

  const images = getProductImages(product)
  const mapped = mapDBProduct(product)

  // Build meta values
  const metaTitle = `${product.name} | BakeVault Lagos`
  const metaDescription = product.description
    ? product.description.split('\n')[0].slice(0, 160)
    : `Buy ${product.name} from BakeVault Lagos. Premium baking supplies delivered same-day in Lagos.`
  const metaImage = images[0] ?? `${SITE_URL}/og-image.jpg`
  const metaUrl = `${SITE_URL}/products/${product.slug}`
  const categoryName = product.categories?.name ?? 'Baking Supply'

  function scrollToAssistant() {
    assistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={metaUrl} />

        {/* Open Graph */}
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

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />

        {/* Product structured data */}
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

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-darkGray/40 font-bold uppercase tracking-wider mb-8">
        <button onClick={() => navigate('/catalog')} className="hover:text-brand-orange transition-colors">
          Catalog
        </button>
        {product.categories?.name && (
          <>
            <span>/</span>
            <span className="text-brand-darkGray/40">{product.categories.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-brand-darkGray/70">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-brand-cream rounded-3xl overflow-hidden border border-orange-100">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSlide(s => (s + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
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
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === slide ? 'border-brand-orange' : 'border-transparent'
                    }`}
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

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-bold text-brand-brown uppercase tracking-widest">
              {categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-darkGray font-display mt-1 leading-tight">
              {product.name}
            </h1>
            <span className="inline-block mt-2 text-[10px] font-bold text-brand-brown bg-brand-brown/5 px-2 py-1 rounded-md border border-brand-brown/10 uppercase tracking-wide">
              {product.price_type === 'retail'
                ? 'Retail pricing available'
                : product.price_type === 'contact'
                  ? 'Enquire for pricing'
                  : 'Wholesale pricing available'}
            </span>
            <button
              type="button"
              onClick={scrollToAssistant}
              className="ml-3 mt-2 inline-flex text-[10px] font-bold text-brand-orange hover:text-brand-brown underline underline-offset-4 uppercase tracking-wide"
            >
              Ask a question
            </button>
          </div>

          <div id="product-assistant" ref={assistantRef} className="scroll-mt-24">
            <ProductAssistant
              productName={product.name}
              productDescription={product.description ?? ''}
            />
          </div>

          <button
            onClick={() => {
              addToCart(mapped)
              trackEvent('add_to_cart', {
                product_id: product.id,
                product_name: product.name,
                category: product.categories?.name ?? '',
              })
            }}
            className="w-full bg-brand-orange hover:bg-brand-brown text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg text-sm font-display uppercase tracking-wide"
          >
            Add to Order
          </button>

          {product.description && (
            <section>
              <h2 className="text-xs font-black text-brand-darkGray/40 uppercase tracking-widest mb-2">
                About this product
              </h2>
              <p className="text-sm text-brand-darkGray/70 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Other products they've looked at — current product excluded */}
      <RecentlyViewedStrip
        items={recentItems.filter(i => i.id !== product.id)}
        title="Also Viewed"
        subtitle="Other products you've been exploring"
      />
    </main>
  )
}
