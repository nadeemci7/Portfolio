import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import Face from './Face'
import { scrollToId } from '../lib/scroll'

/*
  A small blob that follows you down the page. When you reach a new section
  it says what is there and what comes next; tap it and it takes you there.
  The × closes the bubble and stops the automatic tips for this visit;
  hovering the blob opens the bubble again, and it stays until you close it.
*/
const STOPS = [
  { id: 'top', tip: 'Tap a blob up here to see where I used it. Or tap me and I take you down.', next: 'work', nextLabel: 'Work' },
  { id: 'work', tip: 'Click any card to open it: tabs for the overview, what I built, the stack and screenshots.', next: 'path', nextLabel: 'Path' },
  { id: 'path', tip: 'That is the road so far. Next are the tools I reach for.', next: 'toolbox', nextLabel: 'Toolbox' },
  { id: 'toolbox', tip: 'Hover a skill to see which projects used it. The CV is right below.', next: 'cv', nextLabel: 'CV' },
  { id: 'cv', tip: 'Last stop is a hello. Tap me.', next: 'contact', nextLabel: 'Contact' },
  { id: 'contact', tip: 'You reached the end. Tap me to fly back up.', next: 'top', nextLabel: 'Top' },
] as const

const MUTE_KEY = 'guide-muted'

function readMuted() {
  try {
    return sessionStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export default function Guide() {
  const reduce = useReducedMotion()
  const [stop, setStop] = useState(0)
  const [talking, setTalking] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [scope, animate] = useAnimate()
  const hideTimer = useRef<number>(0)
  const state = useRef({ muted, pinned })
  state.current = { muted, pinned }

  const sayFor = (ms: number) => {
    if (state.current.muted || state.current.pinned) return
    setTalking(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (!state.current.pinned) setTalking(false)
    }, ms)
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
    const first = window.setTimeout(() => sayFor(5200), 2600)
    return () => {
      io.disconnect()
      window.clearTimeout(first)
      window.clearTimeout(hideTimer.current)
    }
  }, [])

  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    sayFor(4500)
  }, [stop])

  const open = () => {
    window.clearTimeout(hideTimer.current)
    setPinned(true)
    setTalking(true)
  }

  const close = () => {
    window.clearTimeout(hideTimer.current)
    setTalking(false)
    setPinned(false)
    setMuted(true)
    try {
      sessionStorage.setItem(MUTE_KEY, '1')
    } catch {
      /* private mode: the tips just stay off until reload */
    }
  }

  const go = () => {
    scrollToId(STOPS[stop].next)
    if (!reduce && scope.current) {
      animate(scope.current, { y: [0, -22, 0], rotate: [0, -12, 0] }, { duration: 0.55, ease: 'easeOut' })
    }
  }

  const s = STOPS[stop]
  return (
    <div className="guide">
      <AnimatePresence>
        {talking && (
          <motion.div
            key="bubble"
            className="guide-bubble"
            role="status"
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <button type="button" className="guide-x" onClick={close} aria-label="Hide tips">
              &times;
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <p>{s.tip}</p>
                <span className="guide-next">Next: {s.nextLabel}</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" className="guide-btn" onClick={go} onMouseEnter={open} onFocus={open} aria-label={`Go to ${s.nextLabel}`}>
        <span ref={scope} className="guide-face">
          <Face spec={{ color: 'blue', shape: 'round', eyes: 'strobi' }} />
        </span>
      </button>
    </div>
  )
}
