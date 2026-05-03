import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard          from '@/components/ProductCard'
import ProductModal         from '@/components/ProductModal'
import ProductRequestModal  from '@/components/ProductRequestModal'
import SectionHeading       from '@/components/ui/SectionHeading'
import ScrollToTopButton    from '@/components/ui/ScrollToTopButton'
import { useCart }          from '@/lib/cart-context'
import { useProducts, useCategories, useDebounce } from '@/hooks'
import { mapDBProduct }     from '@/lib/utils'
import { trackEvent }       from '@/lib/analytics'
import type { DBProductWithCategory, DBCategory } from '@/lib/database.types'

export default function CatalogPage() {
  const { addToCart }   = useCart()
  const [searchParams, setSearchParams] = useSearchParams()

  // Category can come from:
  // 1. ?cat=CATEGORY_NAME  (from mobile menu)
  // 2. Local state via the category grid buttons
  const [categoryId,  setCategoryId]  = useState<string | null>(null)
  const [searchInput,  setSearchInput]  = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [selectedRaw, setSelectedRaw] = useState<DBProductWithCategory | null>(null)
  const [showRequest, setShowRequest] = useState(false)
  const [catExpanded, setCatExpanded] = useState(true)

  const productsRef = useRef<HTMLDivElement>(null)

  const { products: rawProducts, loading: productsLoading } = useProducts({ categoryId, search: debouncedSearch })
  const { categories, loading: categoriesLoading }          = useCategories()

  const products   = useMemo(() => rawProducts.map(mapDBProduct), [rawProducts])
  const rawByIdMap = useMemo(() => new Map(rawProducts.map(p => [p.id, p])), [rawProducts])
  const loading    = productsLoading || categoriesLoading

  // ── Resolve ?cat=NAME → categoryId once categories are loaded ──────────────
  useEffect(() => {
    const catName = searchParams.get('cat')
    if (!catName || categories.length === 0) return

    const match = (categories as DBCategory[]).find(
      c => c.name.toLowerCase() === catName.toLowerCase()
    )
    if (match) {
      setCategoryId(match.id)
      setCatExpanded(false)
      // Clean the URL param so the page doesn't re-trigger on re-renders
      setSearchParams({}, { replace: true })
      // Scroll to products
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
  }, [categories, searchParams, setSearchParams])

  // Track page view once
  useEffect(() => { trackEvent('page_view', { page: '/catalog' }) }, [])

  function selectCategory(id: string | null) {
    setCategoryId(id)
    if (id !== null) {
      setCatExpanded(false)
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } else {
      setCatExpanded(true)
    }
  }

  function clearFilters() {
    setCategoryId(null)
    setSearchInput('')
    setCatExpanded(true)
  }

  const handleCloseModal = useCallback(() => setSelectedRaw(null), [])

  function openDetails(p: ReturnType<typeof mapDBProduct>) {
    const raw = rawByIdMap.get(p.id) ?? null
    setSelectedRaw(raw)
    if (raw) trackEvent('product_view', { product_id: raw.id, product_name: raw.name, category: raw.categories?.name ?? '' })
  }

  const activeCategoryName = categoryId
    ? (categories as DBCategory[]).find(c => c.id === categoryId)?.name ?? ''
    : ''

  const isFiltering = categoryId !== null || searchInput.trim() !== ''

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
      <SectionHeading eyebrow="The Vault" title="Everything We Stock"
        description="Search by name or filter by category. Prices on request via WhatsApp — DM us any time." />

      {/* Search */}
      <div className="max-w-2xl mx-auto mt-10 sm:mt-16 relative">
        <input type="text" placeholder="Search by product name or brand..."
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); if (e.target.value) setCatExpanded(false) }}
          className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 pl-14 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm font-medium h-12 sm:h-14" />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-5 w-5 text-brand-darkGray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchInput && (
          <button onClick={() => { setSearchInput(''); setCatExpanded(true) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-darkGray/40 hover:text-brand-orange transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Categories */}
      <section className="mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">
            Shop by Category
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Active category badge */}
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 bg-brand-brown text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {activeCategoryName}
                <button onClick={clearFilters} aria-label="Clear filter"
                  className="hover:opacity-70 transition-opacity">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {isFiltering && !categoryId && (
              <button onClick={clearFilters}
                className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors">
                Clear Filters
              </button>
            )}
            {/* Expand / collapse categories toggle */}
            <button onClick={() => setCatExpanded(e => !e)}
              className="flex items-center gap-1 text-xs text-brand-darkGray/50 hover:text-brand-orange transition-colors font-bold"
              aria-label={catExpanded ? 'Collapse categories' : 'Expand categories'}>
              <svg className={`w-4 h-4 transition-transform ${catExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {catExpanded ? 'Collapse' : 'Show all'}
            </button>
          </div>
        </div>

        {catExpanded && (
          categoriesLoading ? (
            <div className="flex gap-3 flex-wrap">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 w-32 rounded-2xl bg-orange-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <button onClick={() => selectCategory(null)}
                className={`border rounded-2xl px-4 py-4 text-center transition-all duration-200 shadow-sm hover:shadow-md ${
                  !categoryId ? 'bg-brand-brown border-brand-brown text-white' : 'bg-white border-orange-100 text-brand-darkGray hover:bg-brand-brown hover:border-brand-brown hover:text-white'
                }`}>
                <span className="text-xs font-extrabold font-display uppercase tracking-wider">Show Everything</span>
              </button>
              {(categories as DBCategory[]).map(cat => (
                <button key={cat.id} onClick={() => selectCategory(cat.id)}
                  className={`border rounded-2xl px-4 py-4 text-center transition-all duration-200 shadow-sm hover:shadow-md ${
                    categoryId === cat.id ? 'bg-brand-brown border-brand-brown text-white' : 'bg-white border-orange-100 text-brand-darkGray hover:bg-brand-brown hover:border-brand-brown hover:text-white'
                  }`}>
                  <span className="text-xs font-extrabold font-display uppercase tracking-wider">{cat.name}</span>
                </button>
              ))}
            </div>
          )
        )}
      </section>

      {/* Products */}
      <section className="mt-10 sm:mt-14" ref={productsRef}>
        <div className="flex items-center justify-between mb-6 border-b-2 border-orange-50 pb-4 gap-4">
          <div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">
              {searchInput ? `Results for "${searchInput}"` : categoryId ? activeCategoryName : 'All Products'}
            </h3>
            {!loading && (
              <p className="text-brand-darkGray/50 text-xs sm:text-sm font-medium mt-1">
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
              <ProductCard key={product.id} product={product}
                onAddToCart={p => {
                  addToCart(p)
                  trackEvent('add_to_cart', { product_id: p.id, product_name: p.name, category: p.category })
                }}
                onViewDetails={openDetails} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-orange-100 rounded-[32px] px-6 py-12 text-center shadow-sm">
            <p className="text-brand-darkGray text-lg font-bold font-display">Nothing came up for that search.</p>
            <p className="text-brand-darkGray/60 text-sm font-medium mt-3">
              Try a brand name, ingredient type, or clear the filter and browse by category.
            </p>
          </div>
        )}
      </section>

      {/* Product request */}
      <section className="mt-16 sm:mt-20">
        <div className="bg-white border border-orange-100 rounded-[32px] px-6 sm:px-10 py-8 text-center shadow-sm">
          <h3 className="text-lg sm:text-xl font-extrabold text-brand-darkGray font-display mb-2">
            Don't see what you need?
          </h3>
          <p className="text-sm text-brand-darkGray/60 mb-5">
            Submit a request and we'll track it down. We source on request for both retail and bulk quantities.
          </p>
          <button onClick={() => setShowRequest(true)}
            className="inline-flex items-center gap-2 bg-brand-darkGray hover:bg-brand-orange text-white font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Request a Product
          </button>
        </div>
      </section>

      {/* Modals */}
      {selectedRaw && (
        <ProductModal
          product={selectedRaw}
          onClose={handleCloseModal}
          onAddToCart={p => {
            addToCart(p)
            trackEvent('add_to_cart', { product_id: p.id, product_name: p.name, category: p.category })
            handleCloseModal()
          }}
          onViewProduct={p => {
            setSelectedRaw(p)
            trackEvent('product_view', { product_id: p.id, product_name: p.name, category: p.categories?.name ?? '' })
          }}
        />
      )}
      {showRequest && <ProductRequestModal onClose={() => setShowRequest(false)} />}
      <ScrollToTopButton />
    </main>
  )
}