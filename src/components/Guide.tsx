import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import Face from './Face'

/*
  A small blob that follows you down the page. When you reach a new section
  it says what is there and what comes next; tap it and it takes you there.
*/
const STOPS = [
  { id: 'top', tip: 'Tap a blob up here to see where I used it. Or tap me and I take you down.', next: 'work', nextLabel: 'Work' },
  { id: 'work', tip: 'Every card opens: try "What I built". The chips above filter by tool.', next: 'path', nextLabel: 'Path' },
  { id: 'path', tip: 'That is the road so far. Next are the tools I reach for.', next: 'toolbox', nextLabel: 'Toolbox' },
  { id: 'toolbox', tip: 'Want all of this on paper? The CV is right below.', next: 'cv', nextLabel: 'CV' },
  { id: 'cv', tip: 'Last stop is a hello. Tap me.', next: 'contact', nextLabel: 'Contact' },
  { id: 'contact', tip: 'You reached the end. Tap me to fly back up.', next: 'top', nextLabel: 'Top' },
] as const

export default function Guide() {
  const reduce = useReducedMotion()
  const [stop, setStop] = useState(0)
  const [talking, setTalking] = useState(false)
  const [scope, animate] = useAnimate()
  const hideTimer = useRef<number>(0)

  const say = (ms: number) => {
    setTalking(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setTalking(false), ms)
  }

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return
          const i = STOPS.findIndex((s) => s.id === en.target.id)
          if (i >= 0) setStop(i)
        }),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    STOPS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    const first = window.setTimeout(() => say(5200), 2600)
    return () => {
      io.disconnect()
      window.clearTimeout(first)
      window.clearTimeout(hideTimer.current)
    }
  }, [])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    say(4200)
  }, [stop])

  const go = () => {
    const s = STOPS[stop]
    document.getElementById(s.next)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    if (!reduce && scope.current) {
      animate(scope.current, { y: [0, -22, 0], rotate: [0, -12, 0] }, { duration: 0.55, ease: 'easeOut' })
    }
  }

  const s = STOPS[stop]
  return (
    <div className="guide" onMouseEnter={() => say(3000)}>
      <AnimatePresence>
        {talking && (
          <motion.div
            key={s.id}
            className="guide-bubble"
            role="status"
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.9, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <p>{s.tip}</p>
            <span className="guide-next">Next: {s.nextLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" className="guide-btn" onClick={go} aria-label={`Go to ${s.nextLabel}`}>
        <span ref={scope} className="guide-face">
          <Face spec={{ color: 'blue', shape: 'round', eyes: 'strobi' }} />
        </span>
      </button>
    </div>
  )
}
