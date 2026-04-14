
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import CategoryMenu from './components/CategoryMenu';
import { PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, Category } from './types';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    { id: 1, name: 'Amaka O.', role: 'Lagos Pastries', quote: 'BakeVault is my go-to for Havana Active. Always fresh.', initials: 'AO' },
    { id: 2, name: 'Tunde W.', role: 'Mainline Breads', quote: 'Wholesale prices saved our bakery 15%. Fast delivery!', initials: 'TW' },
    { id: 3, name: 'Mrs. Adeyemi', role: 'The Cake Studio', quote: 'Finally a supplier that understands Lagos urgency!', initials: 'MA' }
  ];

  // Featured products with descriptions for the hero
  const heroProducts = useMemo(() => PRODUCTS.filter(p => p.description && p.id.length < 5).slice(0, 4), []);

  // Hero Slider Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (heroProducts.length || 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  // Testimonial Slider Effect - 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const isFiltering = selectedCategory !== 'All' || searchQuery !== '';

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Reverted to original 4 items for featured display
  const displayProducts = isFiltering ? filteredProducts : PRODUCTS.slice(0, 4);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCategorySelect = (category: Category | 'All') => {
    setSelectedCategory(category);
    setSearchQuery('');
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream selection:bg-brand-orange/20 selection:text-brand-brown font-sans">
      <Header 
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenCategories={() => setIsCategoryMenuOpen(true)}
      />

      {/* Hero Slider Section - Reduced mobile height to 400px */}
      <section className="relative h-[400px] sm:h-[700px] overflow-hidden bg-brand-darkGray">
        {heroProducts.map((product, index) => (
          <div 
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-brand-darkGray/35"></div>
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
                <div className="flex animate-fadeInUp delay-200">
                  <button 
                    onClick={() => addToCart(product)}
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
          {heroProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 sm:w-12 bg-brand-orange' : 'w-1.5 sm:w-2 bg-white/40'}`}
            ></button>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h3 className="text-brand-brown text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-4">Lagos' Trusted Partner</h3>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-darkGray font-display mb-6 tracking-tighter">Empowering Nigeria's Finest Bakers</h2>
              <p className="text-brand-darkGray/70 leading-relaxed text-sm sm:text-base font-medium mb-2">
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

      {/* Main Catalog Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full" id="products">
        <div className="max-w-2xl mx-auto mb-10 sm:mb-16">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ingredient vault..."
              className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 pl-14 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm font-medium h-12 sm:h-14"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <section className="hidden lg:block">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-extrabold text-brand-darkGray font-display tracking-tight mb-2">Browse Categories</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="group relative bg-white border border-orange-100 rounded-[24px] p-6 text-center hover:bg-brand-brown hover:border-brand-brown transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10 text-xs sm:text-sm font-extrabold text-brand-darkGray group-hover:text-white font-display uppercase tracking-wider transition-colors">
                      {cat}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 sm:mb-10 border-b-2 border-orange-50 pb-6">
                <h3 className="text-lg sm:text-2xl font-extrabold text-brand-darkGray font-display tracking-tight uppercase">Featured Essentials</h3>
                <button 
                  onClick={() => handleCategorySelect('All')}
                  className="text-brand-brown font-bold text-xs sm:text-sm hover:text-brand-orange transition-colors flex items-center gap-2"
                >
                  Full Catalog
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {displayProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            </section>
          </div>
        )}

        {isFiltering && (
          <div>
            <div className="mb-10 flex items-center gap-4">
              <button 
                onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                className="bg-white p-2.5 rounded-xl border border-orange-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h3 className="text-xl sm:text-3xl font-extrabold text-brand-darkGray font-display tracking-tight">
                {searchQuery ? `Results for "${searchQuery}"` : selectedCategory}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream border-t border-orange-100">
        <div className="max-w-lg mx-auto overflow-hidden">
          <h3 className="text-center text-sm sm:text-lg font-black text-brand-darkGray/40 font-display mb-6 uppercase tracking-[0.2em]">The Bakers' Circle</h3>
          
          <div className="relative h-[180px] sm:h-[220px]">
            {testimonials.map((t, index) => (
              <div 
                key={t.id} 
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  index === currentTestimonial 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}
              >
                <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-orange-100 shadow-sm h-full flex flex-col justify-center text-center">
                  <div className="flex justify-center gap-0.5 text-brand-orange mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-2.5 h-2.5 sm:w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <p className="text-brand-darkGray/80 text-xs sm:text-base font-medium italic mb-4 leading-relaxed line-clamp-2">"{t.quote}"</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-[10px]">
                      {t.initials}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs font-bold text-brand-darkGray uppercase tracking-widest leading-none mb-1">{t.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-brand-brown font-bold uppercase">{t.role}</p>
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
              ></button>
            ))}
          </div>
        </div>
      </section>
      
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
            <a href="https://instagram.com/bakevaultlagos" target="_blank" className="text-white/60 hover:text-white transition-colors font-medium text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @bakevaultlagos
            </a>
            <a href="https://wa.me/2349064652679" target="_blank" className="text-white/60 hover:text-white transition-colors font-medium text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-1.071 3.914 4.024-1.056c.915.541 1.983.853 3.12.853 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.344 8.205c-.15.422-.766.782-1.056.818-.289.035-.555.051-1.636-.369-1.393-.541-2.288-1.956-2.358-2.05-.071-.094-.576-.766-.576-1.459 0-.692.361-1.034.489-1.176.128-.142.279-.177.373-.177h.262c.085 0 .197-.033.303.224l.432 1.052c.036.088.058.188.001.298-.057.11-.086.182-.172.282l-.258.303c-.085.1-.176.208-.078.376.098.168.435.719.932 1.162.641.571 1.179.749 1.347.834.168.085.267.071.366-.042.1-.113.424-.492.538-.661.114-.168.228-.141.385-.084.157.057.994.469 1.165.555.172.085.286.128.329.201.042.073.042.422-.108.844z"/>
              </svg>
              +2349064652679
            </a>
          </div>
          <div className="hidden md:block text-right">
             <h5 className="font-display font-bold text-lg text-brand-orange uppercase tracking-widest mb-4">Inquiries</h5>
             <p className="text-brand-orange font-bold font-display text-lg">sales@bakevault.com.ng</p>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
      />

      <CategoryMenu 
        isOpen={isCategoryMenuOpen}
        onClose={() => setIsCategoryMenuOpen(false)}
        onSelectCategory={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default App;
