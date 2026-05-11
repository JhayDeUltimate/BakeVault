import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard         from '@/components/ProductCard'
import ProductModal        from '@/components/ProductModal'
import AboutSection        from '@/components/sections/AboutSection'
import HeroSection         from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import SectionHeading      from '@/components/ui/SectionHeading'
import { CATEGORIES }      from '@/constants'
import { useCart }         from '@/lib/cart-context'
import { useProducts, useTestimonials } from '@/hooks'
import { mapDBProduct }    from '@/lib/utils'
import { trackEvent }      from '@/lib/analytics'
import { Helmet }          from 'react-helmet-async'
import type { DBProductWithCategory } from '@/lib/database.types'

export default function HomePage() {
  const { addToCart }                = useCart()
  const navigate                     = useNavigate()
  const { products: featuredFromDB } = useProducts({ featuredOnly: true })
  const { testimonials }             = useTestimonials(true)

  // Modal state for "Read description" on featured cards
  const [selectedRaw, setSelectedRaw] = useState<DBProductWithCategory | null>(null)

  // Hero and featured draw from the same list — hero shows up to 5 slides,
  // featured section mirrors those exact products in the same order.
  const heroSlides       = useMemo(() => featuredFromDB.slice(0, 5), [featuredFromDB])
  const featuredProducts = useMemo(() => featuredFromDB.map(mapDBProduct).slice(0, 5), [featuredFromDB])
  const rawByIdMap       = useMemo(() => new Map(featuredFromDB.map(p => [p.id, p])), [featuredFromDB])

  function openDetails(p: ReturnType<typeof mapDBProduct>) {
    const raw = rawByIdMap.get(p.id) ?? null
    setSelectedRaw(raw)
    if (raw) trackEvent('product_view', { product_id: raw.id, product_name: raw.name, category: raw.categories?.name ?? '' })
  }

  return (
    <>
      <Helmet>
        <title>BakeVault Lagos | Premium Baking Supplies & Ingredients</title>
        <meta name="description" content="Shop premium baking supplies, ingredients, and tools at wholesale prices in Lagos, Nigeria. Reliable delivery for your baking success." />
      </Helmet>
      <HeroSection products={heroSlides} onAddToCart={p => addToCart(mapDBProduct(p))} />
      <AboutSection />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="space-y-16 sm:space-y-24">

          {/* Category grid — desktop only */}
          <section className="hidden lg:block">
            <SectionHeading
              eyebrow="Start Here"
              title="Find what you need, fast"
              description="Pick a category and go straight to the products. Everything is in stock or marked clearly if not."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => navigate('/catalog')}
                  className="group bg-white border border-orange-100 rounded-[24px] p-6 text-center hover:bg-brand-brown hover:border-brand-brown transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-brand-darkGray group-hover:text-white font-display uppercase tracking-wider transition-colors">
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Featured products — mirrors hero slides exactly */}
          <section>
            <div className="flex items-center justify-between mb-8 sm:mb-10 border-b-2 border-orange-50 pb-6 gap-4">
              <div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">
                  What Bakers Keep Reordering
                </h3>
                <p className="text-brand-darkGray/50 text-xs sm:text-sm font-medium mt-2">
                  Tried, tested, and trusted by Lagos bakers.
                </p>
              </div>
              <Link
                to="/catalog"
                className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors whitespace-nowrap"
              >
                Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={p => {
                    addToCart(p)
                    trackEvent('add_to_cart', { product_id: p.id, product_name: p.name, category: p.category })
                  }}
                  onViewDetails={openDetails}
                />
              ))}
            </div>
          </section>

        </div>
      </main>

      <TestimonialsSection testimonials={testimonials} />

      {/* Product detail modal — opened from featured cards */}
      {selectedRaw && (
        <ProductModal
          product={selectedRaw}
          onClose={() => setSelectedRaw(null)}
          onAddToCart={p => {
            addToCart(p)
            trackEvent('add_to_cart', { product_id: p.id, product_name: p.name, category: p.category })
            setSelectedRaw(null)
          }}
          onViewProduct={p => {
            setSelectedRaw(p)
            trackEvent('product_view', { product_id: p.id, product_name: p.name, category: p.categories?.name ?? '' })
          }}
        />
      )}
    </>
  )
}