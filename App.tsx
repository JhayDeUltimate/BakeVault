import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Cart from './components/Cart';
import CategoryMenu from './components/CategoryMenu';
import Header from './components/Header';
import Footer from './components/sections/Footer';
import AboutPage from './pages/AboutPage';
import CatalogPage from './pages/CatalogPage';
import HomePage from './pages/HomePage';
import { CartItem, Category, Product } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCategorySelect = (category: Category | 'All') => {
    setSelectedCategory(category);
    setSearchQuery('');
    navigate('/catalog');
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream selection:bg-brand-orange/20 selection:text-brand-brown font-sans">
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCategories={() => setIsCategoryMenuOpen(true)}
      />

      <Routes>
        <Route path="/" element={<HomePage onAddToCart={addToCart} onSelectCategory={handleCategorySelect} />} />
        <Route
          path="/catalog"
          element={
            <CatalogPage
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSelectCategory={handleCategorySelect}
              onClearFilters={clearFilters}
              onAddToCart={addToCart}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />

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
