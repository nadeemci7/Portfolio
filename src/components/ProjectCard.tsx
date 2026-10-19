import { forwardRef, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useSpring, type MotionStyle } from 'motion/react'
import type { Project } from '../data'
import { COLORS } from '../lib/blob'
import Face from './Face'
import { EASE } from './Reveal'

interface CardProps {
  project: Project
  index: number
  flash: number
}

/* "98 Apex classes" becomes a big 98 over a small label. */
function Fact({ text }: { text: string }) {
  const m = text.match(/^(\d[\d,.+]*)\s+(.*)$/)
  return m ? (
    <li className="fact">
      <b>{m[1]}</b>
      <span>{m[2]}</span>
    </li>
  ) : (
    <li className="fact plain">
      <span>{text}</span>
    </li>
  )
}

const ProjectCard = forwardRef<HTMLElement, CardProps>(function ProjectCard({ project: p, index, flash }, ref) {
  const [open, setOpen] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const reduce = useReducedMotion()
  const face = p.face ?? { color: 'blue', shape: 'round', eyes: 'dots' }
  const rx = useSpring(0, { stiffness: 180, damping: 18 })
  const ry = useSpring(0, { stiffness: 180, damping: 18 })
  const tilt = p.featured ? 2.5 : 5

  useEffect(() => {
    if (!flash) return
    setFlashing(true)
    const id = window.setTimeout(() => setFlashing(false), 1700)
    return () => window.clearTimeout(id)
  }, [flash])

  const style = {
    '--tint': COLORS[face.color],
    rotateX: rx,
    rotateY: ry,
    transformPerspective: 1100,
  } as unknown as MotionStyle

  return (
    <motion.article
      ref={ref}
      layout={!reduce}
      className={'card' + (p.featured ? ' featured' : '') + (p.image ? ' has-shot' : '') + (flashing ? ' flash' : '')}
      style={style}
      initial={reduce ? false : { opacity: 0, y: 40, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.94, filter: 'blur(6px)', transition: { duration: 0.22 } }}
      transition={{
        duration: 0.75,
        delay: Math.min(index, 5) * 0.07,
        ease: EASE,
        layout: { type: 'spring', stiffness: 260, damping: 30 },
      }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * tilt * 2)
        rx.set((0.5 - py) * tilt * 1.6)
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      <div className="stage">
        {p.image ? (
          <>
            <img className="shot" src={p.image.src} alt={p.image.alt} loading="lazy" />
            <div className="stage-face corner">
              <Face spec={face} />
            </div>
          </>
        ) : (
          <>
            <span className="stage-shadow" aria-hidden="true" />
            <div className="stage-face">
              <Face spec={face} />
            </div>
          </>
        )}
        {p.when && <span className="when">{p.when}</span>}
      </div>

      <div className="card-body">
        <span className="kind">{p.kind}</span>
        <h3>{p.name}</h3>
        <p className="line">{p.line}</p>

        {p.chain && (
          <ol className="chain" aria-label="Sales lifecycle">
            {p.chain.map((s) => (
              <li key={s}>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}
        {p.facts && p.facts.length > 0 && (
          <ul className="facts">
            {p.facts.map((f) => (
              <Fact key={f} text={f} />
            ))}
          </ul>
        )}
        <p className="stack">{p.stack.join('  /  ')}</p>
        {p.links && p.links.length > 0 && (
          <p className="links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener">
                {l.label} <span aria-hidden="true">&#8599;</span>
              </a>
            ))}
          </p>
        )}

        <div className="more">
          <button type="button" className="more-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            What I built <span className="plus" aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="more"
                className="more-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <ul>
                  {p.built.map((b, i) => (
                    <motion.li
                      key={b}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.35, ease: EASE }}
                    >
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
})

export default ProjectCard
