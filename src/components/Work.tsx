import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { PROJECTS, TOOLS } from '../data'
import { COLORS } from '../lib/blob'
import ProjectCard from './ProjectCard'
import Reveal, { ScrollFade, Title } from './Reveal'

interface WorkProps {
  active: string | null
  setActive: (key: string | null) => void
  counts: Record<string, number>
  flash: number
}

function Chip(props: { label: string; count: number; pressed: boolean; color: string; onClick: () => void }) {
  return (
    <li>
      <motion.button
        type="button"
        className="chip"
        aria-pressed={props.pressed}
        onClick={props.onClick}
        style={{ ['--sw' as string]: props.color }}
        whileHover={{ y: -3, scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      >
        {props.pressed && (
          <motion.span layoutId="chip-bg" className="chip-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
        )}
        <span className="swatch" style={{ background: props.color }} />
        <span>{props.label}</span>
        <span className="count">{props.count}</span>
      </motion.button>
    </li>
  )
}

export default function Work({ active, setActive, counts, flash }: WorkProps) {
  const shown = PROJECTS.filter((p) => !active || p.uses.includes(active))
  const used = TOOLS.filter((t) => (counts[t.key] ?? 0) > 0)
  const label = TOOLS.find((t) => t.key === active)?.label

  return (
    <section className="section" id="work">
      <div className="wrap">
        <ScrollFade className="section-head" fadeOut={false}>
          <Title text="Work" />
          <span className="note">
            {label ? `${shown.length} of ${PROJECTS.length} use ${label}` : `${PROJECTS.length} projects`}
          </span>
        </ScrollFade>
        <Reveal className="intro" delay={0.05}>
          <p>Client builds, company products and the projects I learned on. Open a card to see what I built.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <LayoutGroup id="chips">
            <ul className="filters" aria-label="Filter projects by tool">
              <Chip label="All" count={PROJECTS.length} pressed={!active} color="var(--text)" onClick={() => setActive(null)} />
              {used.map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  count={counts[t.key]}
                  pressed={active === t.key}
                  color={COLORS[t.color]}
                  onClick={() => setActive(active === t.key ? null : t.key)}
                />
              ))}
            </ul>
          </LayoutGroup>
        </Reveal>
        <motion.div className="projects" layout>
          <AnimatePresence mode="popLayout">
            {shown.map((p) => (
              <ProjectCard key={p.id} project={p} flash={flash} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
