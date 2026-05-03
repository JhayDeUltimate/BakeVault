import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import BrandLogo from './ui/BrandLogo'

interface HeaderProps {
  cartCount:        number
  onOpenCart:       () => void
  onOpenCategories: () => void
}

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenCategories }) => {
  const location = useLocation()

  const navLinkClass = (path: string) =>
    ['transition-colors font-bold text-sm uppercase tracking-[0.2em]',
     location.pathname === path
       ? 'text-brand-orange'
       : 'text-brand-darkGray/60 hover:text-brand-orange'
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="flex-shrink-0 group">
            <BrandLogo iconClassName="h-10 w-auto group-hover:opacity-80 transition-opacity" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/"        className={navLinkClass('/')}>Home</Link>
            <Link to="/catalog" className={navLinkClass('/catalog')}>Catalog</Link>
            <Link to="/about"   className={navLinkClass('/about')}>About</Link>
            <Link to="/faq"     className={navLinkClass('/faq')}>FAQ</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onOpenCategories}
              className="md:hidden p-2.5 text-brand-darkGray hover:text-brand-orange transition-colors bg-orange-50 rounded-full"
              aria-label="Browse by Category"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-brand-darkGray hover:text-brand-orange transition-colors bg-orange-50 rounded-full"
              aria-label="View Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header