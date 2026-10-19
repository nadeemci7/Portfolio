import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { TOOLS, type Project } from '../data'
import { tintVars } from '../lib/blob'
import { lockScroll } from '../lib/scroll'
import Face from './Face'
import Pill from './Pill'
import { EASE } from './Reveal'

export type Tab = 'overview' | 'built' | 'stack' | 'screens'

interface ModalProps {
  project: Project | null
  tab: Tab
  setTab: (t: Tab) => void
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  index: number
  total: number
  onTool: (key: string) => void
}

export default function ProjectModal(props: ModalProps) {
  return createPortal(<AnimatePresence>{props.project && <Dialog {...props} project={props.project} />}</AnimatePresence>, document.body)
}

/* small line icons so each tab reads as something to click */
const ICONS: Record<Tab, string> = {
  overview: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7v6m0-9.5v.5',
  built: 'M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8V20h3.2l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z',
  stack: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  screens: 'M4 5h16v11H4zM8 20h8m-4-4v4',
}

function tabsFor(p: Project): { id: Tab; label: string }[] {
  const t: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'built', label: 'What I built' },
    { id: 'stack', label: 'Stack' },
  ]
  if (p.images?.length) t.push({ id: 'screens', label: `Screens (${p.images.length})` })
  return t
}

function Dialog({ project: p, tab: asked, setTab, onClose, onPrev, onNext, index, total, onTool }: ModalProps & { project: Project }) {
  const reduce = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabs = tabsFor(p)
  const tab: Tab = tabs.some((t) => t.id === asked) ? asked : 'overview'
  const face = p.face ?? { color: 'blue', shape: 'round', eyes: 'dots' }

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    lockScroll(true)
    closeBtn.current?.focus()
    return () => {
      lockScroll(false)
      before?.focus?.()
    }
  }, [])

  useEffect(() => {
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [onClose])

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const i = tabs.findIndex((t) => t.id === tab)
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
    setTab(next.id)
    document.getElementById(`tab-${next.id}`)?.focus()
  }

  const tools = TOOLS.filter((t) => p.uses.includes(t.key))

  return (
    <div className="modal-root">
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        ref={panel}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={tintVars(face.color)}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <header className="modal-head">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={p.id}
              className="modal-who"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <span className="modal-face">
                <Face spec={face} />
              </span>
              <div>
                <span className="modal-kind">
                  {p.kind}
                  {p.when ? ` · ${p.when}` : ''}
                </span>
                <h2 id="modal-title">{p.name}</h2>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="modal-nav">
            <span className="modal-count">
              {index + 1} / {total}
            </span>
            <button type="button" className="round" onClick={onPrev} aria-label="Previous project">
              &larr;
            </button>
            <button type="button" className="round" onClick={onNext} aria-label="Next project">
              &rarr;
            </button>
            <button type="button" className="round close" onClick={onClose} aria-label="Close" ref={closeBtn}>
              &times;
            </button>
          </div>
        </header>

        <div className="tabs" role="tablist" aria-label="Project details" onKeyDown={onTabKey} ref={tabsRef}>
          <Pill host={tabsRef} selector='[aria-selected="true"]' watch={tab + p.id} className="tab-pill" />
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="tab-panel"
              tabIndex={tab === t.id ? 0 : -1}
              className="tab"
              onClick={() => setTab(t.id)}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={ICONS[t.id]} />
              </svg>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-body" data-lenis-prevent>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.id + tab}
              id="tab-panel"
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -26 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              {tab === 'overview' && <Overview p={p} openScreens={() => setTab('screens')} />}
              {tab === 'built' && <Built p={p} />}
              {tab === 'stack' && (
                <div className="m-stack">
                  <h3 className="m-h">Built with</h3>
                  <ul className="m-chips">
                    {p.stack.map((s, i) => (
                      <motion.li key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                  {tools.length > 0 && (
                    <>
                      <h3 className="m-h">See other projects that use</h3>
                      <div className="m-tools">
                        {tools.map((t) => (
                          <button key={t.key} type="button" className="m-tool" onClick={() => onTool(t.key)} style={tintVars(t.color)}>
                            <span className="m-tool-face">
                              <Face spec={t} />
                            </span>
                            {t.label}
                            <span aria-hidden="true">&rarr;</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {tab === 'screens' && p.images && <Screens images={p.images} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function Overview({ p, openScreens }: { p: Project; openScreens: () => void }) {
  return (
    <div className="m-overview">
      <p className="m-lead">{p.line}</p>
      {p.facts && p.facts.length > 0 && (
        <ul className="m-facts">
          {p.facts.map((f, i) => {
            const m = f.match(/^(\d[\d,.+]*)\s+(.*)$/)
            return (
              <motion.li key={f} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06, ease: EASE }}>
                {m ? (
                  <>
                    <b>{m[1]}</b>
                    <span>{m[2]}</span>
                  </>
                ) : (
                  <span className="plain">{f}</span>
                )}
              </motion.li>
            )
          })}
        </ul>
      )}
      {p.chain && (
        <ol className="chain m-chain" aria-label="Sales lifecycle">
          {p.chain.map((s) => (
            <li key={s}>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
      {p.links && p.links.length > 0 && (
        <div className="m-links">
          {p.links.map((l) => (
            <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener">
              {l.label} <span aria-hidden="true">&#8599;</span>
            </a>
          ))}
        </div>
      )}
      {p.images && p.images.length > 0 && (
        <button type="button" className="m-peek" onClick={openScreens}>
          <img src={p.images[0].src} alt="" />
          <span>See the screens &rarr;</span>
        </button>
      )}
    </div>
  )
}

function Built({ p }: { p: Project }) {
  return (
    <ul className="m-built">
      {p.built.map((b, i) => (
        <motion.li key={b} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.06, duration: 0.4, ease: EASE }}>
          {b}
        </motion.li>
      ))}
    </ul>
  )
}

function Screens({ images }: { images: NonNullable<Project['images']> }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState(false)
  const im = images[i]
  return (
    <div className="m-screens">
      <figure className="m-frame">
        <div className={'m-scroll' + (zoom ? ' zoom' : '')} data-lenis-prevent>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={im.src}
              src={im.src}
              alt={im.alt}
              onClick={() => setZoom((z) => !z)}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>
        </div>
        <figcaption>
          {im.caption}
          <span className="m-zoom-hint">{zoom ? 'Click the picture to fit it' : 'Click the picture to zoom in'}</span>
        </figcaption>
      </figure>
      {images.length > 1 && (
        <div className="m-thumbs">
          {images.map((t, n) => (
            <button
              key={t.src}
              type="button"
              className={'m-thumb' + (n === i ? ' on' : '')}
              onClick={() => {
                setI(n)
                setZoom(false)
              }}
              aria-label={`Screen ${n + 1}: ${t.caption}`}
              aria-pressed={n === i}
            >
              <img src={t.src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
