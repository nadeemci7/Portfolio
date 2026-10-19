import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { PROJECTS, TOOLS } from '../data'
import { COLORS } from '../lib/blob'
import { scrollToId } from '../lib/scroll'
import ProjectCard from './ProjectCard'
import ProjectModal, { type Tab } from './ProjectModal'
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
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
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
  // ?project=healthfirst&tab=screens opens a project straight away (handy for sharing one)
  const [openId, setOpenId] = useState<string | null>(() => {
    const id = new URLSearchParams(window.location.search).get('project')
    return PROJECTS.some((p) => p.id === id) ? id : null
  })
  const [tab, setTab] = useState<Tab>(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    return t === 'built' || t === 'stack' || t === 'screens' ? t : 'overview'
  })
  const shown = PROJECTS.filter((p) => !active || p.uses.includes(active))
  const used = TOOLS.filter((t) => (counts[t.key] ?? 0) > 0)
  const label = TOOLS.find((t) => t.key === active)?.label

  const list = shown.some((p) => p.id === openId) ? shown : PROJECTS
  const index = list.findIndex((p) => p.id === openId)
  const project = index >= 0 ? list[index] : null
  const step = (d: number) => {
    if (index < 0) return
    const next = list[(index + d + list.length) % list.length]
    if (tab === 'screens' && !next.images?.length) setTab('overview')
    setOpenId(next.id)
  }

  return (
    <section className="section" id="work">
      <div className="wrap">
        <ScrollFade className="section-head" fadeOut={false}>
          <Title text="Work" />
          <span className="note">
            {label ? `${shown.length} of ${PROJECTS.length} use ${label}` : `${PROJECTS.length} projects. Click one to open it.`}
          </span>
        </ScrollFade>
        <Reveal className="intro" delay={0.05}>
          <p>Client builds, company products and the projects I learned on. Click a card for the full story, or its picture for the screens.</p>
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
              <ProjectCard
                key={p.id}
                project={p}
                flash={flash}
                onOpen={(t) => {
                  setTab(t)
                  setOpenId(p.id)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProjectModal
        project={project}
        tab={tab}
        setTab={setTab}
        onClose={() => setOpenId(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        index={Math.max(index, 0)}
        total={list.length}
        onTool={(key) => {
          setOpenId(null)
          setActive(key)
          window.setTimeout(() => scrollToId('work'), 60)
        }}
      />
    </section>
  )
}
