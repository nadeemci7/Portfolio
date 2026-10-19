import { forwardRef, useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Project } from '../data'
import { COLORS } from '../lib/blob'
import Face from './Face'
import { EASE, ScrollFade } from './Reveal'

interface CardProps {
  project: Project
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

/*
  Three layers: the slot is the grid item (filter animations), the fade
  follows the scroll, and the card itself pops on hover.
*/
const ProjectCard = forwardRef<HTMLDivElement, CardProps>(function ProjectCard({ project: p, flash }, ref) {
  const [open, setOpen] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const reduce = useReducedMotion()
  const face = p.face ?? { color: 'blue', shape: 'round', eyes: 'dots' }

  useEffect(() => {
    if (!flash) return
    setFlashing(true)
    const id = window.setTimeout(() => setFlashing(false), 1700)
    return () => window.clearTimeout(id)
  }, [flash])

  const toggleFromCard = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    setOpen((o) => !o)
  }

  return (
    <motion.div
      ref={ref}
      layout={!reduce}
      className={'slot' + (p.featured ? ' featured' : '')}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, ease: EASE, layout: { type: 'spring', stiffness: 260, damping: 30 } }}
    >
      <ScrollFade className="slot-fade">
        <article
          className={'card' + (p.image ? ' has-shot' : '') + (flashing ? ' flash' : '') + (open ? ' open' : '')}
          style={{ '--tint': COLORS[face.color] } as CSSProperties}
          onClick={toggleFromCard}
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse') return
            const el = e.currentTarget
            const r = el.getBoundingClientRect()
            el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
            el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
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
            {p.teaser && (
              <span className="quip" aria-hidden="true">
                {p.teaser}
              </span>
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
                {open ? 'Close' : 'What I built'} <span className="plus" aria-hidden="true" />
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
                          initial={reduce ? false : { opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease: EASE }}
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
        </article>
      </ScrollFade>
    </motion.div>
  )
})

export default ProjectCard
