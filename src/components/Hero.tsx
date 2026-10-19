import { Component, lazy, Suspense, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import Face from './Face'
import { EASE, Magnetic } from './Reveal'
import { TOOLS } from '../data'

const BlobScene = lazy(() => import('./BlobScene'))

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* Shown while the 3D scene loads, and instead of it where WebGL is missing. */
function StaticCluster() {
  return (
    <div className="cluster" aria-hidden="true">
      {TOOLS.map((t) => (
        <span key={t.key} style={{ '--s': t.size } as CSSProperties}>
          <Face spec={t} />
        </span>
      ))}
    </div>
  )
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

interface HeroProps {
  active: string | null
  counts: Record<string, number>
  onPick: (key: string) => void
  onShow: (key: string) => void
  onClear: () => void
}

export default function Hero({ active, counts, onPick, onShow, onClear }: HeroProps) {
  const reduce = useReducedMotion()
  const gl = useMemo(hasWebGL, [])
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const textFade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.82])
  const stageFade = useTransform(scrollYProgress, [0, 0.9], [1, 0.15])

  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 44, filter: 'blur(8px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.95, delay: 0.1 + i * 0.08, ease: EASE },
        }

  return (
    <section className="hero" id="top" ref={ref}>
      <motion.div
        className="hero-stage"
        style={reduce ? undefined : { scale: stageScale, opacity: stageFade }}
        role="img"
        aria-label="Soft 3D blob characters, one for each tool Nadeem uses: Apex, LWC, Agentforce, Flows, Java, Spring Boot, SQL and Next.js. Push them, throw them, or tap one to see the projects that use it. The same filters are buttons in the Work section."
      >
        {gl ? (
          <SceneBoundary fallback={<StaticCluster />}>
            <Suspense fallback={<StaticCluster />}>
              <BlobScene active={active} counts={counts} onPick={onPick} onShow={onShow} onClear={onClear} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <StaticCluster />
        )}
      </motion.div>

      <div className="wrap hero-copy">
        <motion.div className="hero-text" style={reduce ? undefined : { y: textY, opacity: textFade }}>
          <motion.p className="hello" {...rise(0)}>
            Hi, I'm
          </motion.p>
          <h1 className="name" aria-label="Nadeem Ahmad">
            <motion.span {...rise(1)}>Nadeem</motion.span>
            <motion.span className="accent" {...rise(2)}>
              Ahmad
            </motion.span>
          </h1>
          <motion.p className="lead" {...rise(3)}>
            A full stack developer in Delhi. I build on Salesforce and in Java: lately a healthcare CRM with three live
            portals, an Agentforce assistant that sales reps talk to in Slack, and the sync that keeps Salesforce, Slack,
            HubSpot, Tally and Meta in step.
          </motion.p>
          <motion.p className="sub" {...rise(4)}>
            Currently at Cloud Ingenious. I started with Spring Boot, Hibernate and MySQL, and I still reach for them.
          </motion.p>
          <motion.div className="actions" {...rise(5)}>
            <Magnetic>
              <a className="btn primary" href="#work">
                See the work <span className="arrow" aria-hidden="true">&darr;</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn" href="#cv">
                Get the CV
              </a>
            </Magnetic>
          </motion.div>
          <motion.p className="hint" {...rise(6)}>
            <span className="hint-arrow" aria-hidden="true">&#8599;</span>
            Tap a blob to see where I used it. Drag one to throw it.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
