import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { mapDBProduct } from '@/lib/utils'
import { getProductImages, optimizeImageUrl, FALLBACK_IMAGE, IMG } from '@/lib/image'
import { useCart } from '@/lib/cart-context'
import { trackEvent } from '@/lib/analytics'
import { Helmet } from 'react-helmet-async'
import ProductAssistant from '@/components/ProductAssistant'
import type { DBProductWithCategory } from '@/lib/database.types'

export default function ProductPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const [product, setProduct] = useState<DBProductWithCategory | null>(null)
    const [loading, setLoading] = useState(true)
    const [slide, setSlide] = useState(0)

    useEffect(() => {
        if (!slug) return
        const slugStr = slug

        async function fetchProduct() {
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(*)')
                .eq('slug', slugStr)
                .eq('is_available', true)
                .single()

            if (error || !data) {
                navigate('/catalog', { replace: true })
            } else {
                setProduct(data as DBProductWithCategory)
                trackEvent('product_view', { product_id: data.id, product_name: data.name, category: (data as DBProductWithCategory).categories?.name ?? '' })
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

    // Prefer the first product image for social cards; fall back to a safe image
    const firstImg = images[0] ?? null
    const ogImageRaw = optimizeImageUrl(firstImg, IMG.hero)
    const ogImage = ogImageRaw && /^https?:\/\//i.test(ogImageRaw)
      ? ogImageRaw
      : (typeof window !== 'undefined' ? `${window.location.origin}${ogImageRaw}` : ogImageRaw)

    const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shortDescription = (product.description ?? `Buy ${product.name} from BakeVault Lagos.`).replace(/\s+/g, ' ').substring(0, 197)

        const productJsonLd = {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: (ogImage ? [ogImage] : [FALLBACK_IMAGE]),
            description: shortDescription,
            sku: product.id,
            url: pageUrl || undefined,
            brand: { '@type': 'Brand', name: 'BakeVault' },
            offers: {
                '@type': 'Offer',
                availability: product.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                url: pageUrl || undefined,
            },
        }

        const breadcrumbJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: (typeof window !== 'undefined' ? window.location.origin : 'https://bakevault.com.ng') },
                { '@type': 'ListItem', position: 2, name: 'Catalog', item: (typeof window !== 'undefined' ? `${window.location.origin}/catalog` : '/catalog') },
                ...(product.categories?.name ? [{ '@type': 'ListItem', position: 3, name: product.categories.name, item: (typeof window !== 'undefined' ? `${window.location.origin}/catalog?cat=${encodeURIComponent(product.categories.name)}` : undefined) }] : []),
                { '@type': 'ListItem', position: product.categories?.name ? 4 : 3, name: product.name, item: pageUrl || undefined },
            ].filter(Boolean),
        }

    return (
        <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <Helmet>
                <title>{product.name} | BakeVault Lagos</title>
                <meta name="description" content={shortDescription} />

                {/* Open Graph / Social meta */}
                <meta property="og:title" content={`${product.name} | BakeVault Lagos`} />
                <meta property="og:description" content={shortDescription} />
                <meta property="og:type" content="product" />
                {ogImage && <meta property="og:image" content={ogImage} />}
                {pageUrl && <meta property="og:url" content={pageUrl} />}

                {/* Twitter card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${product.name} | BakeVault Lagos`} />
                <meta name="twitter:description" content={shortDescription} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}
                <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
            </Helmet>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-brand-darkGray/40 font-bold uppercase tracking-wider mb-8">
                <button onClick={() => navigate('/catalog')} className="hover:text-brand-orange transition-colors">Catalog</button>
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
                                <button onClick={() => setSlide(s => (s - 1 + images.length) % images.length)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={() => setSlide(s => (s + 1) % images.length)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img: string, i: number) => (
                                <button key={i} onClick={() => setSlide(i)}
                                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === slide ? 'border-brand-orange' : 'border-transparent'}`}>
                                    <img src={optimizeImageUrl(img, IMG.adminThumb)} alt="" className="w-full h-full object-cover"
                                        loading="lazy" decoding="async"
                                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-5">
                    <div>
                        <span className="text-[10px] font-bold text-brand-brown uppercase tracking-widest">
                            {product.categories?.name ?? 'Baking Supply'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-darkGray font-display mt-1 leading-tight">
                            {product.name}
                        </h1>
                        <span className="inline-block mt-2 text-[10px] font-bold text-brand-brown bg-brand-brown/5 px-2 py-1 rounded-md border border-brand-brown/10 uppercase tracking-wide">
                            {product.price_type === 'retail' ? 'Retail pricing available'
                                : product.price_type === 'contact' ? 'Enquire for pricing'
                                    : 'Wholesale pricing available'}
                        </span>
                    </div>

                    {product.description && (
                        <p className="text-sm text-brand-darkGray/70 leading-relaxed whitespace-pre-line">
                            {product.description}
                        </p>
                    )}

                    <button
                        onClick={() => {
                            addToCart(mapped)
                            trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, category: product.categories?.name ?? '' })
                        }}
                        className="w-full bg-brand-orange hover:bg-brand-brown text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg text-sm font-display uppercase tracking-wide"
                    >
                        Add to Order
                    </button>

                    <ProductAssistant productName={product.name} productDescription={product.description ?? ''} />
                </div>
            </div>
        </main>
    )
}