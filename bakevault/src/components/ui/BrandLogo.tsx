import React from 'react';

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', iconClassName = '', textClassName = '' }) => {
  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <div className={['bg-brand-brown text-white p-2 rounded-xl transition-colors', iconClassName].filter(Boolean).join(' ')}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <span
        className={[
          'font-extrabold text-2xl tracking-tighter font-display transition-colors',
          textClassName || 'text-brand-darkGray'
        ].join(' ')}
      >
        BakeVault
      </span>
    </div>
  );
};

export default BrandLogo;
