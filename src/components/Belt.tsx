import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import Face from './Face'
import { TOOLS } from '../data'

/*
  Two rows of big tool names drifting sideways. Scrolling speeds them up, and
  scrolling back up turns them around.
*/
const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

const TOP = ['Apex', 'Lightning Web Components', 'Agentforce', 'Health Cloud', 'Experience Cloud', 'Flows', 'SOQL']
const BOTTOM = ['Spring Boot', 'Java', 'Hibernate', 'MySQL', 'Next.js', 'TypeScript', 'Slack', 'Revenue Cloud']

function Row({ words, speed, outline, offset }: { words: string[]; speed: number; outline?: boolean; offset: number }) {
  const reduce = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = dir.current * speed * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * f
    base.set(base.get() + move)
  })

  const copy = (k: string) =>
    words.map((w, i) => (
      <span className="belt-item" key={k + i}>
        <span className={'belt-word' + (outline ? ' outline' : '')}>{w}</span>
        <span className="belt-face">
          <Face spec={TOOLS[(i + offset) % TOOLS.length]} />
        </span>
      </span>
    ))

  return (
    <div className="belt-row">
      <motion.div className="belt-track" style={{ x }}>
        {copy('a')}
        {copy('b')}
      </motion.div>
    </div>
  )
}

export default function Belt() {
  return (
    <div className="belt" aria-hidden="true">
      <Row words={TOP} speed={-1.6} offset={0} />
      <Row words={BOTTOM} speed={1.6} offset={3} outline />
    </div>
  )
}
