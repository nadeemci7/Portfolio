import type { ReactNode } from 'react'
import { motion, useReducedMotion, useSpring } from 'motion/react'

export const EASE = [0.22, 0.7, 0.2, 1] as const

/* Props for a blur-fade-and-rise as the element scrolls into view. */
export function useFade() {
  const reduce = useReducedMotion()
  return (delay = 0, y = 30) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y, filter: 'blur(10px)' },
          whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
          viewport: { once: true, margin: '0px 0px -10% 0px' },
          transition: { duration: 0.85, delay, ease: EASE },
        }
}

export default function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const fade = useFade()
  return (
    <motion.div className={className} {...fade(delay)}>
      {children}
    </motion.div>
  )
}

/* A heading whose letters rise out of a mask, one after another. */
export function Title({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <h2 className={className}>{text}</h2>
  let n = 0
  return (
    <motion.h2
      className={'split ' + (className ?? '')}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
    >
      {text.split(' ').map((word, wi) => (
        <span key={wi}>
          <span className="word" aria-hidden="true">
            {[...word].map((ch, ci) => {
              const i = n++
              return (
                <motion.span
                  key={ci}
                  className="ch"
                  variants={{
                    hidden: { y: '115%', rotate: 10 },
                    show: { y: '0%', rotate: 0, transition: { duration: 0.75, delay: i * 0.035, ease: EASE } },
                  }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>{' '}
        </span>
      ))}
    </motion.h2>
  )
}

/* Leans a button toward the mouse while it hovers. */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 320, damping: 18, mass: 0.4 })
  const y = useSpring(0, { stiffness: 320, damping: 18, mass: 0.4 })
  if (reduce) return <>{children}</>
  return (
    <motion.span
      className="magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
