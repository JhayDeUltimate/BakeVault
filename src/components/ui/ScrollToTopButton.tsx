import { useCallback, useEffect, useState } from 'react'

/**
 * Floating "scroll to top" button that appears after the user scrolls
 * past a configurable threshold. Renders a smooth upward-pointing
 * triangle with a glass-morphism backdrop.
 */
export default function ScrollToTopButton({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()                       // check on mount
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        bg-brand-orange/90 backdrop-blur-md
        shadow-lg shadow-brand-orange/25
        flex items-center justify-center
        text-white
        hover:bg-brand-brown hover:scale-110
        active:scale-95
        transition-all duration-300 ease-out
        ${visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {/* Upward triangle */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l-8 12h16z" />
      </svg>
    </button>
  )
}
