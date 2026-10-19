import { forwardRef, useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Project } from '../data'
import { COLORS } from '../lib/blob'
import Face from './Face'
import { EASE, ScrollFade } from './Reveal'
import type { Tab } from './ProjectModal'

interface CardProps {
  project: Project
  flash: number
  onOpen: (tab: Tab) => void
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
  follows the scroll, and the card itself pops on hover. Clicking the card
  opens the project window.
*/
const ProjectCard = forwardRef<HTMLDivElement, CardProps>(function ProjectCard({ project: p, flash, onOpen }, ref) {
  const [flashing, setFlashing] = useState(false)
  const reduce = useReducedMotion()
  const face = p.face ?? { color: 'blue', shape: 'round', eyes: 'dots' }
  const cover = p.images?.[0]

  useEffect(() => {
    if (!flash) return
    setFlashing(true)
    const id = window.setTimeout(() => setFlashing(false), 1700)
    return () => window.clearTimeout(id)
  }, [flash])

  const openFromCard = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    onOpen('overview')
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
          className={'card' + (cover ? ' has-shot' : '') + (flashing ? ' flash' : '')}
          style={{ '--tint': COLORS[face.color] } as CSSProperties}
          onClick={openFromCard}
        >
          <div className="stage">
            {cover ? (
              <>
                <button
                  type="button"
                  className="shot-btn"
                  onClick={() => onOpen('screens')}
                  aria-label={`See screenshots of ${p.name}`}
                >
                  <img className="shot" src={cover.src} alt={cover.alt} loading="lazy" />
                  <span className="shot-hint" aria-hidden="true">
                    View screens
                  </span>
                </button>
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
              <button type="button" className="more-btn" onClick={() => onOpen('built')} aria-haspopup="dialog">
                Open details <span className="plus" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      </ScrollFade>
    </motion.div>
  )
})

export default ProjectCard
