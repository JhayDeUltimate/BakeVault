import React, { useState, useMemo, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Store components (unchanged from original)
import Header       from './components/Header'
import ProductCard  from './components/ProductCard'
import Cart         from './components/Cart'
import CategoryMenu from './components/CategoryMenu'

// Admin pages
import AdminLogin        from './pages/admin/AdminLogin'
import AdminLayout       from './pages/admin/AdminLayout'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminProducts     from './pages/admin/AdminProducts'
import AdminCategories   from './pages/admin/AdminCategories'
import AdminEnquiries    from './pages/admin/AdminEnquiries'
import AdminTestimonials from './pages/admin/AdminTestimonials'
import AdminSettings     from './pages/admin/AdminSettings'
import ProtectedRoute    from './components/admin/ProtectedRoute'

// Data hooks
import { useProducts, useCategories, useTestimonials } from './hooks/index'

import type { CartItem } from './bakevault/src/lib/types'
import type { DBProductWithCategory } from './lib/database.types'

// ─── The actual store page (was previously all of App.tsx) ───────────────────
function StorePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchQuery,        setSearchQuery]         = useState('')
  const [cartItems,          setCartItems]           = useState<CartItem[]>([])
  const [isCartOpen,         setIsCartOpen]          = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen]  = useState(false)
  const [currentSlide,       setCurrentSlide]        = useState(0)
  const [currentTestimonial, setCurrentTestimonial]  = useState(0)

  const { categories }   = useCategories()
  const { testimonials } = useTestimonials()

  // Hero: featured products only, no search/category filter
  const { products: featuredProducts } = useProducts({ featuredOnly: true })

  // Main catalog: all products filtered by current selection
  const isFiltering = !!selectedCategoryId || !!searchQuery
  const { products: filteredProducts, loading: catalogLoading } = useProducts({
    categoryId: selectedCategoryId,
    search:     searchQuery,
  })
  const { products: featuredFour } = useProducts({ featuredOnly: false })

  const displayProducts = isFiltering ? filteredProducts : featuredFour.slice(0, 4)

  // ── Auto-advance hero slider ───────────────────────────────────────────────
  const heroProducts = useMemo(
    () => featuredProducts.filter(p => p.description),
    [featuredProducts]
  )

  useEffect(() => {
    if (!heroProducts.length) return
    const t = setInterval(
      () => setCurrentSlide(prev => (prev + 1) % heroProducts.length),
      5000
    )
    return () => clearInterval(t)
  }, [heroProducts.length])

  // ── Testimonial slider ────────────────────────────────────────────────────
  useEffect(() => {
    if (!testimonials.length) return
    const t = setInterval(
      () => setCurrentTestimonial(prev => (prev + 1) % testimonials.length),
      3500
    )
    return () => clearInterval(t)
  }, [testimonials.length])

  // ── Cart helpers ──────────────────────────────────────────────────────────
  function addToCart(product: DBProductWithCategory) {
    const cartItem: CartItem = {
      id:       product.id,
      name:     product.name,
      category: product.categories?.name ?? '',
      image:    product.image_url ?? 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
      price:    product.price_type,
      quantity: 1,
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, cartItem]
    })
    setIsCartOpen(true)
  }

  function updateCartQuantity(id: string, delta: number) {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    )
  }

  function removeFromCart(id: string) {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  function handleCategorySelect(categoryId: string | null) {
    setSelectedCategoryId(categoryId)
    setSearchQuery('')
    setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream selection:bg-brand-orange/20 selection:text-brand-brown font-sans">
      <Header
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCategories={() => setIsCategoryMenuOpen(true)}
      />

      {/* ── Hero Slider ─────────────────────────────────────────────────── */}
      <section className="relative h-[400px] sm:h-[700px] overflow-hidden bg-brand-darkGray">
        {heroProducts.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-brand-orange rounded-full animate-spin" />
          </div>
        ) : (
          heroProducts.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="absolute inset-0">
                <img src={product.image_url ?? ''} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-brand-darkGray/35" />
              </div>
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-white">
                <div className="max-w-2xl bg-white/5 backdrop-blur-md p-5 sm:p-12 rounded-[32px] sm:rounded-[40px] border border-white/10 shadow-2xl animate-fadeInUp">
                  <div className="mb-2 sm:mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-orange text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">
                      Featured Product
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-5xl lg:text-6xl font-extrabold mb-2 sm:mb-6 leading-tight font-display">
                    {product.name}
                  </h2>
                  <p className="text-white/90 text-[10px] sm:text-lg mb-4 sm:mb-10 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                    {product.description}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full sm:w-auto text-center bg-brand-orange text-white font-extrabold px-6 py-3 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl hover:bg-white hover:text-brand-darkGray transition-all shadow-2xl active:scale-95 font-display text-xs sm:text-lg whitespace-nowrap"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 sm:w-12 bg-brand-orange' : 'w-1.5 sm:w-2 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* ── About Us ────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h3 className="text-brand-brown text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-4">Lagos' Trusted Partner</h3>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-darkGray font-display mb-6 tracking-tighter">Empowering Nigeria's Finest Bakers</h2>
              <p className="text-brand-darkGray/70 leading-relaxed text-sm sm:text-base font-medium">
                Based in the heart of Lagos, BakeVault is more than just a supplier. We are a community-driven hub dedicated to sourcing the world's most reliable ingredients.
              </p>
            </div>
            <div className="lg:w-1/2 relative hidden sm:block">
              <div className="aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl rotate-2">
                <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Bakery Supply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Catalog ─────────────────────────────────────────────────── */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full" id="products">
        <div className="max-w-2xl mx-auto mb-10 sm:mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ingredient vault..."
              className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 pl-14 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm font-medium h-12 sm:h-14"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-5 w-5 text-brand-darkGray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {!isFiltering && (
          <div className="space-y-16 sm:space-y-24">
            {/* Category grid — desktop only */}
            <section className="hidden lg:block">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-extrabold text-brand-darkGray font-display tracking-tight mb-2">Browse Categories</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="group bg-white border border-orange-100 rounded-[24px] p-6 text-center hover:bg-brand-brown hover:border-brand-brown transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-brand-darkGray group-hover:text-white font-display uppercase tracking-wider transition-colors">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 sm:mb-10 border-b-2 border-orange-50 pb-6">
                <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">Featured Essentials</h3>
                <button onClick={() => handleCategorySelect(null)} className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors">
                  Full Catalog
                </button>
              </div>
              {catalogLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[20px] h-64 animate-pulse border border-orange-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {displayProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {isFiltering && (
          <div>
            <div className="mb-10 flex items-center gap-4">
              <button
                onClick={() => { setSelectedCategoryId(null); setSearchQuery('') }}
                className="bg-white p-2.5 rounded-xl border border-orange-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h3 className="text-xl sm:text-3xl font-extrabold text-brand-darkGray font-display tracking-tight">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : categories.find(c => c.id === selectedCategoryId)?.name ?? 'Products'}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
            {!catalogLoading && displayProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-orange-100">
                <p className="text-brand-darkGray/40 font-bold italic">No products found.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream border-t border-orange-100">
        <div className="max-w-lg mx-auto overflow-hidden">
          <h3 className="text-center text-sm sm:text-lg font-black text-brand-darkGray/40 font-display mb-6 uppercase tracking-[0.2em]">The Bakers' Circle</h3>
          {testimonials.length > 0 && (
            <>
              <div className="relative h-[180px] sm:h-[220px]">
                {testimonials.map((t, index) => (
                  <div
                    key={t.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                      index === currentTestimonial ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-orange-100 shadow-sm h-full flex flex-col justify-center text-center">
                      <div className="flex justify-center gap-0.5 text-brand-orange mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-brand-darkGray/80 text-xs sm:text-base font-medium italic mb-4 leading-relaxed line-clamp-2">"{t.quote}"</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-[10px]">
                          {t.initials ?? t.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] sm:text-xs font-bold text-brand-darkGray uppercase tracking-widest leading-none mb-1">{t.customer_name}</p>
                          <p className="text-[8px] sm:text-[10px] text-brand-brown font-bold uppercase">{t.business_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'w-6 bg-brand-orange' : 'w-2 bg-brand-orange/20'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-brand-darkGray text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="bg-brand-brown text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-extrabold text-2xl tracking-tighter font-display text-white">BakeVault</span>
            </div>
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-widest">© {new Date().getFullYear()} BakeVault Lagos.</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <h5 className="font-display font-bold text-lg text-brand-orange uppercase tracking-widest mb-1">Connect</h5>
            <a href="https://instagram.com/bakevaultlagos" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors font-medium text-sm flex items-center gap-2">
              @bakevaultlagos
            </a>
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? '2349064652679'}`} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors font-medium text-sm flex items-center gap-2">
              +{import.meta.env.VITE_WHATSAPP_NUMBER ?? '2349064652679'}
            </a>
          </div>
          <div className="hidden md:block text-right">
            <h5 className="font-display font-bold text-lg text-brand-orange uppercase tracking-widest mb-4">Inquiries</h5>
            <p className="text-brand-orange font-bold font-display text-lg">{import.meta.env.VITE_CONTACT_EMAIL ?? 'sales@bakevault.com.ng'}</p>
          </div>
        </div>
      </footer>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} />
      <CategoryMenu
        isOpen={isCategoryMenuOpen}
        onClose={() => setIsCategoryMenuOpen(false)}
        onSelectCategoryId={handleCategorySelect}
        selectedCategoryId={selectedCategoryId}
        categories={categories}
      />
    </div>
  )
}

// ─── Root App with Router ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public store */}
        <Route path="/"    element={<StorePage />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin pages */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="products"      element={<AdminProducts />} />
          <Route path="categories"    element={<AdminCategories />} />
          <Route path="enquiries"     element={<AdminEnquiries />} />
          <Route path="testimonials"  element={<AdminTestimonials />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>

        {/* Catch-all → store */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}