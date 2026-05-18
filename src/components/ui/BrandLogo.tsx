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
  iconClassName = 'h-10 w-auto',
  textClassName = '',
  hideText = true,
}) => {
  return (
    <div className={['inline-flex items-center gap-2 min-w-0', className].filter(Boolean).join(' ')}>
      <img
        src="/logo.svg"
        alt="BakeVault"
        className={[iconClassName, 'block max-w-[9rem] shrink-0 object-contain'].filter(Boolean).join(' ')}
      />

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
