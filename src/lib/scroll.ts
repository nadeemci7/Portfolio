import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { prefersReducedMotion } from './blob'

/*
  Smooth wheel scrolling (Lenis). Touch scrolling stays native. Anchor links
  and the scroll helpers below go through it so everything glides the same way.
*/
const HEADER_OFFSET = -76
let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    anchors: { offset: HEADER_OFFSET },
  })
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : HEADER_OFFSET })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

/* Stops the page from scrolling behind a pop-up. */
export function lockScroll(lock: boolean) {
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
