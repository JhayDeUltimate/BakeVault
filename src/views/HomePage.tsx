import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard         from '@/components/ProductCard'
import AboutSection        from '@/components/sections/AboutSection'
import HeroSection         from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import SectionHeading      from '@/components/ui/SectionHeading'
import { CATEGORIES, TESTIMONIALS } from '@/constants'
import { useCart }         from '@/lib/cart-context'
import { useProducts }     from '@/hooks'

export default function HomePage() {
  const { addToCart } = useCart()
  const navigate      = useNavigate()

  const { products: featuredFromDB } = useProducts({ featuredOnly: true })

  const heroProducts     = useMemo(() => featuredFromDB.filter(p => p.description).slice(0, 4), [featuredFromDB])
  const featuredProducts = useMemo(() => featuredFromDB.slice(0, 4), [featuredFromDB])

  return (
    <>
      <HeroSection products={featuredProducts} onAddToCart={addToCart} />
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