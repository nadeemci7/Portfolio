import { useRef, type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

export const EASE = [0.22, 0.7, 0.2, 1] as const

/*
  Scroll-linked fade. As the block comes up from the bottom of the screen it
  fades in, rises, grows to full size and comes into focus; as it leaves past
  the top it fades back out. It follows the scroll both ways.
*/
export function ScrollFade({
  children,
  className,
  style,
  fadeOut = true,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  fadeOut?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  const opacity = useTransform(p, fadeOut ? [0, 0.22, 0.8, 1] : [0, 0.22], fadeOut ? [0, 1, 1, 0.1] : [0, 1])
  const y = useTransform(p, [0, 0.28], [110, 0])
  const scale = useTransform(p, fadeOut ? [0, 0.28, 0.82, 1] : [0, 0.28], fadeOut ? [0.86, 1, 1, 0.94] : [0.86, 1])
  const filter = useTransform(p, (v) => {
    const b = v < 0.22 ? (1 - v / 0.22) * 12 : v > 0.85 && fadeOut ? ((v - 0.85) / 0.15) * 6 : 0
    return b < 0.1 ? 'none' : `blur(${b.toFixed(1)}px)`
  })
  if (reduce) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    )
  }
  return (
    <motion.div ref={ref} className={className} style={{ ...style, opacity, y, scale, filter }}>
      {children}
    </motion.div>
  )
}

export default function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* A heading whose letters rise out of a mask, one after another, each time it scrolls into view. */
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
      viewport={{ once: false, margin: '0px 0px -15% 0px' }}
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
                    hidden: { y: '115%', rotate: 12, transition: { duration: 0.3 } },
                    show: { y: '0%', rotate: 0, transition: { duration: 0.8, delay: i * 0.04, ease: EASE } },
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
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
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
