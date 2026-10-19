import { useEffect, useState, type RefObject } from 'react'

/*
  A highlight that slides to whichever child matches `selector`. It measures
  the child's offset inside `host` (which must be position: relative), so it
  works inside sticky headers and fixed pop-ups, where shared-layout
  animations get thrown off by the page scroll.
*/
export default function Pill({
  host,
  selector,
  watch,
  className,
}: {
  host: RefObject<HTMLElement | null>
  selector: string
  watch: unknown
  className: string
}) {
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  // a passive effect: by then React has attached the host's ref (a layout effect in this child runs too early)
  useEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => {
      const a = el.querySelector<HTMLElement>(selector)
      setBox(a ? { x: a.offsetLeft, y: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight } : null)
    }
    measure()
    const raf = requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [host, selector, watch])

  if (!box) return null
  return (
    <span
      className={'slide-pill ' + className}
      aria-hidden="true"
      style={{ transform: `translate(${box.x}px, ${box.y}px)`, width: box.w, height: box.h }}
    />
  )
}
