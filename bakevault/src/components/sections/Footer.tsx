import React from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_DISPLAY_NUMBER, WHATSAPP_URL } from '../../constants';
import BrandLogo from '../ui/BrandLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-darkGray text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        <div className="text-center md:text-left">
          <Link to="/" className="inline-flex mb-6">
            <BrandLogo textClassName="text-white" />
          </Link>
          <p className="text-white/30 text-[10px] font-medium uppercase tracking-widest">Copyright {new Date().getFullYear()} BakeVault Lagos.</p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3">
          <h5 className="font-display font-bold text-lg text-brand-orange uppercase tracking-widest mb-1">Connect</h5>
          <a
            href="https://instagram.com/bakevaultlagos"
            target="_blank"
            rel="noreferrer"
            className="text-white/60 hover:text-white transition-colors font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @bakevaultlagos
          </a>
          {WHATSAPP_URL ? (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-white transition-colors font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-1.071 3.914 4.024-1.056c.915.541 1.983.853 3.12.853 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.344 8.205c-.15.422-.766.782-1.056.818-.289.035-.555.051-1.636-.369-1.393-.541-2.288-1.956-2.358-2.05-.071-.094-.576-.766-.576-1.459 0-.692.361-1.034.489-1.176.128-.142.279-.177.373-.177h.262c.085 0 .197-.033.303.224l.432 1.052c.036.088.058.188.001.298-.057.11-.086.182-.172.282l-.258.303c-.085.1-.176.208-.078.376.098.168.435.719.932 1.162.641.571 1.179.749 1.347.834.168.085.267.071.366-.042.1-.113.424-.492.538-.661.114-.168.228-.141.385-.084.157.057.994.469 1.165.555.172.085.286.128.329.201.042.073.042.422-.108.844z" />
              </svg>
              {WHATSAPP_DISPLAY_NUMBER}
            </a>
          ) : null}
        </div>

        <div className="text-center md:text-right">
          <h5 className="font-display font-bold text-lg text-brand-orange uppercase tracking-widest mb-4">Quick Links</h5>
          <div className="space-y-2">
            <Link to="/" className="block text-white/60 hover:text-white transition-colors font-medium text-sm">
              Home
            </Link>
            <Link to="/catalog" className="block text-white/60 hover:text-white transition-colors font-medium text-sm">
              Catalog
            </Link>
            <Link to="/about" className="block text-white/60 hover:text-white transition-colors font-medium text-sm">
              About
            </Link>
            <p className="pt-2 text-brand-orange font-bold font-display text-lg">sales@bakevault.com.ng</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
