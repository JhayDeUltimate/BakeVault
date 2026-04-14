import React, { useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/ui/SectionHeading';
import { CATEGORIES, PRODUCTS } from '../constants';
import { Category, Product } from '../bakevault/src/lib/types';

interface CatalogPageProps {
  selectedCategory: Category | 'All';
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSelectCategory: (category: Category | 'All') => void;
  onClearFilters: () => void;
  onAddToCart: (product: Product) => void;
}

const CatalogPage: React.FC<CatalogPageProps> = ({
  selectedCategory,
  searchQuery,
  onSearchQueryChange,
  onSelectCategory,
  onClearFilters,
  onAddToCart
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isFiltering = selectedCategory !== 'All' || normalizedQuery !== '';

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        normalizedQuery === '' ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [normalizedQuery, selectedCategory]);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full" id="products">
      <SectionHeading
        eyebrow="Catalog"
        title="Browse the ingredient vault"
        description="Search by product or jump between categories to find the right baking essentials faster."
      />

      <div className="max-w-2xl mx-auto mt-10 sm:mt-16">
        <div className="relative">
          <input
            type="text"
            placeholder="Search ingredient vault..."
            className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 pl-14 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm font-medium h-12 sm:h-14"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-5 w-5 text-brand-darkGray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <section className="mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">Browse Categories</h3>
          {isFiltering ? (
            <button onClick={onClearFilters} className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors">
              Clear Filters
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <button
            onClick={() => onSelectCategory('All')}
            className={`group relative border rounded-[24px] p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
              selectedCategory === 'All' ? 'bg-brand-brown border-brand-brown' : 'bg-white border-orange-100 hover:bg-brand-brown hover:border-brand-brown'
            }`}
          >
            <span className={`relative z-10 text-xs sm:text-sm font-extrabold font-display uppercase tracking-wider transition-colors ${selectedCategory === 'All' ? 'text-white' : 'text-brand-darkGray group-hover:text-white'}`}>
              All Products
            </span>
          </button>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`group relative border rounded-[24px] p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                  isSelected ? 'bg-brand-brown border-brand-brown' : 'bg-white border-orange-100 hover:bg-brand-brown hover:border-brand-brown'
                }`}
              >
                <span className={`relative z-10 text-xs sm:text-sm font-extrabold font-display uppercase tracking-wider transition-colors ${isSelected ? 'text-white' : 'text-brand-darkGray group-hover:text-white'}`}>
                  {category}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="flex items-center justify-between mb-8 sm:mb-10 border-b-2 border-orange-50 pb-6 gap-4">
          <div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory === 'All' ? 'Full Catalog' : selectedCategory}
            </h3>
            <p className="text-brand-darkGray/50 text-xs sm:text-sm font-medium mt-2">
              {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
            </p>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-orange-100 rounded-[32px] px-6 py-12 text-center shadow-sm">
            <p className="text-brand-darkGray text-lg font-bold font-display">No products matched that search.</p>
            <p className="text-brand-darkGray/60 text-sm font-medium mt-3">Try another product name or clear the current filters.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default CatalogPage;
