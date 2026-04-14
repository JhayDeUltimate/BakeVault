'use client'

import React, { useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import AboutSection from '../components/sections/AboutSection';
import HeroSection from '../components/sections/HeroSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import SectionHeading from '../components/ui/SectionHeading';
import { CATEGORIES, PRODUCTS, TESTIMONIALS } from '../constants';
import { Category, Product } from '../types';

interface HomePageProps {
  onAddToCart?: (product: Product) => void;
  onSelectCategory?: (category: Category | 'All') => void;
}

const noop = () => {};

const HomePage: React.FC<HomePageProps> = ({ onAddToCart = noop, onSelectCategory = noop }) => {
  const heroProducts = useMemo(() => PRODUCTS.filter((product) => product.description && product.id.length < 5).slice(0, 4), []);
  const featuredProducts = useMemo(() => PRODUCTS.slice(0, 4), []);

  return (
    <>
      <HeroSection products={heroProducts} onAddToCart={onAddToCart} />
      <AboutSection />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="space-y-16 sm:space-y-24">
          <section className="hidden lg:block">
            <SectionHeading
              eyebrow="Browse Fast"
              title="Find ingredients by category"
              description="Jump into the part of the vault you need most and head straight to the full catalog view."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className="group relative bg-white border border-orange-100 rounded-[24px] p-6 text-center hover:bg-brand-brown hover:border-brand-brown transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10 text-xs sm:text-sm font-extrabold text-brand-darkGray group-hover:text-white font-display uppercase tracking-wider transition-colors">
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
                <p className="text-brand-darkGray/50 text-xs sm:text-sm font-medium mt-2">A quick look at the best-selling staples bakers keep reordering.</p>
              </div>
              <Link href="/catalog" className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors whitespace-nowrap">
                Full Catalog
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <TestimonialsSection testimonials={TESTIMONIALS} />
    </>
  );
};

export default HomePage;

