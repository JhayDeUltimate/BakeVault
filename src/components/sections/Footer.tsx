import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/hooks'

const Footer: React.FC = () => {
  const { settings } = useSettings()

  const instagramHandle = settings.instagram_handle || 'bakevaultlagos'
  const contactEmail    = settings.contact_email    || 'sales@bakevault.com.ng'
  const whatsappNumber  = settings.whatsapp_number  || import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') || ''
  const whatsappUrl     = whatsappNumber ? `https://wa.me/${whatsappNumber}` : ''

  return (
    <footer className="bg-brand-darkGray text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-start gap-4">
            <Link to="/" className="shrink-0">
              <img src="/logo.svg" alt="BakeVault" className="h-10 w-auto" />
            </Link>
            <p className="text-white/30 text-[10px] font-medium uppercase tracking-widest leading-relaxed">
              © {new Date().getFullYear()} BakeVault Lagos<br />
              Your Baking Success, Secured
            </p>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-display font-bold text-sm text-brand-orange uppercase tracking-widest mb-1">Shop</h5>
            <Link to="/catalog"      className="text-white/60 hover:text-white transition-colors font-medium text-xs">Catalog</Link>
            <Link to="/how-to-order" className="text-white/60 hover:text-white transition-colors font-medium text-xs">How to Order</Link>
            <Link to="/delivery"     className="text-white/60 hover:text-white transition-colors font-medium text-xs">Delivery Info</Link>
            <Link to="/faq"          className="text-white/60 hover:text-white transition-colors font-medium text-xs">FAQ</Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-display font-bold text-sm text-brand-orange uppercase tracking-widest mb-1">Company</h5>
            <Link to="/"       className="text-white/60 hover:text-white transition-colors font-medium text-xs">Home</Link>
            <Link to="/about"  className="text-white/60 hover:text-white transition-colors font-medium text-xs">About</Link>
            <Link to="/contact" className="text-white/60 hover:text-white transition-colors font-medium text-xs">Contact</Link>
            <Link to="/terms"  className="text-white/60 hover:text-white transition-colors font-medium text-xs">Terms</Link>
            <Link to="/privacy" className="text-white/60 hover:text-white transition-colors font-medium text-xs">Privacy</Link>
          </div>

          {/* Find Us */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-display font-bold text-sm text-brand-orange uppercase tracking-widest mb-1">Find Us</h5>
            <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors font-medium text-xs flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                <circle cx="12" cy="12" r="3.2" />
                <circle cx="18.406" cy="5.594" r="1.44" />
              </svg>
              @{instagramHandle}
            </a>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors font-medium text-xs flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {whatsappNumber}
              </a>
            )}
            <a href={`mailto:${contactEmail}`}
              className="text-brand-orange hover:text-white transition-colors font-bold text-xs">
              {contactEmail}
            </a>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer