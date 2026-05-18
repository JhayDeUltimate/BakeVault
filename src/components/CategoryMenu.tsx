import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/constants'

interface CategoryMenuProps {
  isOpen:  boolean
  onClose: () => void
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()

  if (!isOpen) return null

  function goToCategory(categoryName: string) {
    onClose()
    // Pass the category name as a search param so CatalogPage can filter
    navigate(`/catalog?cat=${encodeURIComponent(categoryName)}`)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-brand-darkGray/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-full max-w-xs">
          <div className="h-full flex flex-col bg-white shadow-2xl">
            <div className="flex-1 py-8 overflow-y-auto px-6">
              <div className="flex items-start justify-between mb-8">
                <h2 className="text-xl font-extrabold text-brand-darkGray font-display uppercase tracking-tight">
                  Browse the Vault
                </h2>
                <button onClick={onClose} aria-label="Close menu"
                  className="p-2 text-brand-darkGray/40 hover:text-brand-orange">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                {/* Page links */}
                <div className="space-y-2 pb-4 border-b border-orange-100">
                  {[
                  { to: '/',             label: 'Home'         },
                    { to: '/catalog',      label: 'Catalog'      },
                    { to: '/about',        label: 'About'        },
                    { to: '/faq',          label: 'FAQ'          },
                    { to: '/how-to-order', label: 'How to Order' },
                    { to: '/delivery',     label: 'Delivery Info'},
                    { to: '/contact',      label: 'Contact'      },
                  ].map(link => (
                    <Link key={link.to} to={link.to} onClick={onClose}
                      className={`block w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border ${
                        location.pathname === link.to && !location.search
                          ? 'bg-brand-orange text-white border-brand-orange shadow-lg'
                          : 'bg-white text-brand-darkGray border-orange-50 hover:bg-orange-50'
                      }`}>
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Category links */}
                <p className="px-1 pt-3 text-xs font-black uppercase tracking-widest text-brand-brown-text/60">
                  Ingredients by Category
                </p>
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => goToCategory(category)}
                    className="block w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border bg-white text-brand-darkGray border-orange-50 hover:bg-brand-brown hover:text-white hover:border-brand-brown"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-cream/30 p-5 border-t border-orange-100">
              <p className="text-xs text-center text-brand-darkGray/40 font-bold uppercase tracking-widest">
                BakeVault Lagos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryMenu