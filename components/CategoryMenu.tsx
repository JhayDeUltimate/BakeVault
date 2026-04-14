import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category | 'All') => void;
  selectedCategory: Category | 'All';
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose, onSelectCategory, selectedCategory }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-brand-darkGray/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-xs">
          <div className="h-full flex flex-col bg-white shadow-2xl">
            <div className="flex-1 py-8 overflow-y-auto px-6">
              <div className="flex items-start justify-between mb-8">
                <h2 className="text-xl font-extrabold text-brand-darkGray font-display uppercase tracking-tight">Browse Vault</h2>
                <button onClick={onClose} className="p-2 text-brand-darkGray/40 hover:text-brand-orange">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2 pb-5 border-b border-orange-100">
                  {[
                    { to: '/', label: 'Home' },
                    { to: '/catalog', label: 'Catalog' },
                    { to: '/about', label: 'About' }
                  ].map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      className={`block w-full text-left px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border ${
                        location.pathname === link.to
                          ? 'bg-brand-orange text-white border-brand-orange shadow-lg'
                          : 'bg-white text-brand-darkGray border-orange-50 hover:bg-orange-50'
                      }`}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onSelectCategory('All');
                    onClose();
                  }}
                  className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border ${
                    selectedCategory === 'All'
                      ? 'bg-brand-brown text-white border-brand-brown shadow-lg'
                      : 'bg-white text-brand-darkGray border-orange-50 hover:bg-orange-50'
                  }`}
                >
                  All Products
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onSelectCategory(category);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border ${
                      selectedCategory === category
                        ? 'bg-brand-brown text-white border-brand-brown shadow-lg'
                        : 'bg-white text-brand-darkGray border-orange-50 hover:bg-orange-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-cream/30 p-6 border-t border-orange-100">
              <p className="text-[10px] text-center text-brand-darkGray/40 font-bold uppercase tracking-widest">BakeVault Lagos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
