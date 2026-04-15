import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard         from '@/components/ProductCard'
import AboutSection        from '@/components/sections/AboutSection'
import HeroSection         from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import SectionHeading      from '@/components/ui/SectionHeading'
import { TESTIMONIALS }    from '@/constants'
import { useCart }         from '@/lib/cart-context'
import { useProducts }     from '@/hooks'
import { mapDBProduct }    from '@/lib/utils'

export default function HomePage() {
  const { addToCart } = useCart()
  const navigate      = useNavigate()

  const { products: featuredFromDB } = useProducts({ featuredOnly: true })

  // Slides for HeroSection — needs DBProductWithCategory for image_url + description
  const heroSlides = useMemo(
    () => featuredFromDB.slice(0, 4),
    [featuredFromDB]
  )

  // Cards for ProductCard grid — mapped to the storefront Product shape
  const featuredProducts = useMemo(
    () => featuredFromDB.map(mapDBProduct).slice(0, 4),
    [featuredFromDB]
  )

  return (
    <>
      {/*
        FIX: HeroSection's onAddToCart receives DBProductWithCategory.
        Map it to Product before calling addToCart so cart items always
        have `image` and `category` fields (not `image_url` / `categories`).
      */}
      <HeroSection
        products={heroSlides}
        onAddToCart={p => addToCart(mapDBProduct(p))}
      />
      <AboutSection />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="space-y-16 sm:space-y-24">

          <section className="hidden lg:block">
            <SectionHeading
              eyebrow="Browse Fast"
              title="Find ingredients by category"
              description="Jump into the part of the vault you need most and head straight to the full catalog."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {['Yogurt & Dairy Starters','Milk Flavorings & Essences','Preservatives & Additives',
                'Syrups & Toppings','Milk Flavouring Powders (Bulk)','Margarine & Spreads',
                'Baking Ingredients','Food Coloring','Other Products'].map(category => (
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

          <section>
            <div className="flex items-center justify-between mb-8 sm:mb-10 border-b-2 border-orange-50 pb-6 gap-4">
              <div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">Featured Essentials</h3>
                <p className="text-brand-darkGray/50 text-xs sm:text-sm font-medium mt-2">The best-selling staples bakers keep reordering.</p>
              </div>
              <Link to="/catalog" className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors whitespace-nowrap">
                Full Catalog →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {/* FIX: featuredProducts is now Product[] (mapped) so ProductCard
                  and addToCart both receive the correct shape with `image` and
                  `category` fields populated. */}
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </section>

        </div>
      </main>

      <TestimonialsSection testimonials={TESTIMONIALS} />
    </>
  )
}