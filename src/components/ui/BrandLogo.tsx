import React from 'react'

interface BrandLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  hideText?: boolean
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  iconClassName = '',
  textClassName = '',
  hideText = true,
}) => {
  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <div
        className={['w-40 h-40 p-1.5']
          .filter(Boolean)
          .join(' ')}
      >
        <img src="/logo.svg" alt="BakeVault" className="w-full h-full object-contain" />
      </div>

      {!hideText && (
        <span
          className={[
            'font-extrabold text-4xl tracking-tighter font-display transition-colors',
            textClassName || 'text-brand-darkGray',
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
