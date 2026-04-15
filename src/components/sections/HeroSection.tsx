'use client'

import React, { useEffect, useState } from 'react';
import type { DBProductWithCategory } from '../../lib/database.types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200';

interface HeroSectionProps {
  products:    DBProductWithCategory[];
  onAddToCart: (product: DBProductWithCategory) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ products, onAddToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [products.length]);

  // Reset to slide 0 if products change (e.g. after an image update)
  useEffect(() => {
    setCurrentSlide(0);
  }, [products]);

  if (products.length === 0) return null;

  return (
    <section className="relative h-[400px] sm:h-[700px] overflow-hidden bg-brand-darkGray">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0">
            <img
              src={product.image_url ?? FALLBACK_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
            />
            <div className="absolute inset-0 bg-brand-darkGray/35" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-white">
            <div className="max-w-2xl bg-white/5 backdrop-blur-md p-5 sm:p-12 rounded-[32px] sm:rounded-[40px] border border-white/10 shadow-2xl animate-fadeInUp">
              <div className="mb-2 sm:mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-orange text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">
                  Featured Product
                </span>
              </div>
              <h1 className="text-xl sm:text-5xl lg:text-6xl font-extrabold mb-2 sm:mb-6 leading-tight font-display">
                {product.name}
              </h1>
              <p className="text-white/90 text-[10px] sm:text-lg mb-4 sm:mb-10 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                {product.description}
              </p>
              <div className="flex animate-fadeInUp delay-200">
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-6 py-3 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl hover:bg-white hover:text-brand-darkGray transition-all shadow-2xl active:scale-95 font-display text-xs sm:text-lg whitespace-nowrap"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 sm:w-12 bg-brand-orange' : 'w-1.5 sm:w-2 bg-white/40'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;