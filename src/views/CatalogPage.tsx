import React, { useMemo, useState } from 'react'
import ProductCard    from '@/components/ProductCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { useCart }    from '@/lib/cart-context'
import { useProducts, useCategories } from '@/hooks'
import { mapDBProduct } from '@/lib/utils'
import type { DBCategory } from '@/lib/database.types'

export default function CatalogPage() {
  const { addToCart } = useCart()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // FIX: pull live products from Supabase instead of the hardcoded constants
  // array — admin changes are now reflected immediately.
  const { products: rawProducts, loading: productsLoading } = useProducts({
    categoryId,
    search,
  })
  const { categories, loading: categoriesLoading } = useCategories()

  const products   = useMemo(() => rawProducts.map(mapDBProduct), [rawProducts])
  const isFiltering = categoryId !== null || search.trim() !== ''
  const loading     = productsLoading || categoriesLoading

  function clearFilters() {
    setCategoryId(null)
    setSearch('')
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
      <SectionHeading
        eyebrow="Catalog"
        title="Browse the ingredient vault"
        description="Search by product or jump between categories to find the right baking essentials faster."
      />

      {/* Search */}
      <div className="max-w-2xl mx-auto mt-10 sm:mt-16 relative">
        <input
          type="text"
          placeholder="Search ingredient vault..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 pl-14 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm font-medium h-12 sm:h-14"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-5 w-5 text-brand-darkGray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category filter */}
      <section className="mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">Browse Categories</h3>
          {isFiltering && (
            <button onClick={clearFilters} className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors">
              Clear Filters
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="flex gap-4 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 w-36 rounded-[24px] bg-orange-50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* All products tile */}
            <button
              onClick={() => setCategoryId(null)}
              className={`border rounded-[24px] p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                categoryId === null
                  ? 'bg-brand-brown border-brand-brown text-white'
                  : 'bg-white border-orange-100 text-brand-darkGray hover:bg-brand-brown hover:border-brand-brown hover:text-white'
              }`}
            >
              <span className="text-xs sm:text-sm font-extrabold font-display uppercase tracking-wider">
                All Products
              </span>
            </button>

            {(categories as DBCategory[]).map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`border rounded-[24px] p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                  categoryId === cat.id
                    ? 'bg-brand-brown border-brand-brown text-white'
                    : 'bg-white border-orange-100 text-brand-darkGray hover:bg-brand-brown hover:border-brand-brown hover:text-white'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold font-display uppercase tracking-wider">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Product grid */}
      <section className="mt-16 sm:mt-20">
        <div className="flex items-center justify-between mb-8 border-b-2 border-orange-50 pb-6 gap-4">
          <div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">
              {search
                ? `Results for "${search}"`
                : categoryId
                  ? (categories.find(c => c.id === categoryId)?.name ?? 'Products')
                  : 'Full Catalog'}
            </h3>
            {!loading && (
              <p className="text-brand-darkGray/50 text-xs sm:text-sm font-medium mt-2">
                {products.length} product{products.length === 1 ? '' : 's'} found
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[24px] border border-orange-100 overflow-hidden">
                <div className="aspect-square bg-orange-50 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-orange-50 rounded animate-pulse" />
                  <div className="h-8 bg-orange-50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
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
  )
}