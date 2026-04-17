import React from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP_DISPLAY_NUMBER, WHATSAPP_URL } from '@/constants'

const Footer: React.FC = () => (
  <footer className="bg-brand-darkGray text-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Desktop: 3 columns | Mobile: 2 columns + full-width logo row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10">

        {/* Brand — full width on mobile, first column on desktop */}
        <div className="col-span-2 sm:col-span-1 flex sm:flex-col items-center sm:items-start gap-4">
          <Link to="/" className="shrink-0">
            <img src="/logo.svg" alt="BakeVault" className="h-10 w-auto" />
          </Link>
          <p className="text-white/30 text-[10px] font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} BakeVault Lagos
          </p>
        </div>

        {/* Connect */}
        <div className="flex flex-col gap-2">
          <h5 className="font-display font-bold text-sm text-brand-orange uppercase tracking-widest mb-1">
            Connect
          </h5>
          <a href="https://instagram.com/bakevaultlagos" target="_blank" rel="noreferrer"
            className="text-white/60 hover:text-white transition-colors font-medium text-xs flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
            </svg>
            @bakevaultlagos
          </a>
          {WHATSAPP_URL && (
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
              className="text-white/60 hover:text-white transition-colors font-medium text-xs flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-1.071 3.914 4.024-1.056c.915.541 1.983.853 3.12.853 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767z" />
              </svg>
              {WHATSAPP_DISPLAY_NUMBER}
            </a>
          )}
          <a href="mailto:sales@bakevault.com"
            className="text-brand-orange hover:text-white transition-colors font-bold text-xs">
            sales@bakevault.com
          </a>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h5 className="font-display font-bold text-sm text-brand-orange uppercase tracking-widest mb-1">
            Links
          </h5>
          <Link to="/"        className="text-white/60 hover:text-white transition-colors font-medium text-xs">Home</Link>
          <Link to="/catalog" className="text-white/60 hover:text-white transition-colors font-medium text-xs">Catalog</Link>
          <Link to="/about"   className="text-white/60 hover:text-white transition-colors font-medium text-xs">About</Link>
        </div>

      </div>
    </div>
  </footer>
)

export default Footer