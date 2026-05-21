/**
 * Ref-counted body scroll lock.
 *
 * Multiple components (ProductModal, Cart drawer, CategoryMenu) may all
 * want to prevent background scrolling at the same time. A simple
 * `document.body.style.overflow = 'hidden' / ''` toggle creates a race:
 * whichever component unmounts last "wins", potentially unlocking scroll
 * while another overlay is still visible.
 *
 * This module keeps a counter of active locks. Scroll is only re-enabled
 * when every consumer that called `lockBodyScroll` has called
 * `unlockBodyScroll`.
 */

let lockCount = 0

export function lockBodyScroll(): void {
  lockCount++
  if (lockCount === 1) {
    document.body.style.overflow = 'hidden'
  }
}

export function unlockBodyScroll(): void {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = ''
  }
}
