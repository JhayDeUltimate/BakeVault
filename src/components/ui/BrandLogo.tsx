// src/components/ui/BrandLogo.tsx 

import React from 'react'

interface BrandLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  hideText?: boolean
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  iconClassName = 'w-10 h-10',
  textClassName = '',
  hideText = true,
}) => {
  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <div className={[iconClassName].filter(Boolean).join(' ')}>
        <img
          src="/logo.svg"
          alt="BakeVault"
          className="w-full h-full object-contain"
        />
      </div>

      {!hideText && (
        <span
          className={[
            'font-extrabold tracking-tighter font-display transition-colors',
            textClassName || 'text-brand-darkGray text-xl',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          BakeVault
        </span>
      )}
    </div>
  )
}

export default BrandLogo