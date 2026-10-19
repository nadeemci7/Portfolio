import { useEffect, useRef, useState } from 'react'
import Face from './Face'
import Pill from './Pill'

const LINKS = [
  ['work', 'Work'],
  ['path', 'Path'],
  ['toolbox', 'Toolbox'],
  ['cv', 'CV'],
] as const

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const navRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setCurrent(en.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', 'work', 'path', 'toolbox', 'cv', 'contact'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const click = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.nav, .menu-btn')) setOpen(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('click', click)
    return () => {
      document.removeEventListener('keydown', key)
      document.removeEventListener('click', click)
    }
  }, [open])

  return (
    <header className={'top' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap top-inner">
        <a className="brand" href="#top" aria-label="Nadeem Ahmad, back to the top">
          <span className="logo">
            <Face spec={{ color: 'blue', shape: 'round', eyes: 'strobi' }} />
          </span>
          Nadeem Ahmad
        </a>
        <nav aria-label="Main">
          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="bars" aria-hidden="true">
              <span />
              <span />
            </span>
            Menu
          </button>
          <ul className={'nav' + (open ? ' open' : '')} id="nav" ref={navRef}>
            <Pill host={navRef} selector="a.here" watch={current + open} className="nav-pill" />
            {LINKS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={current === id ? 'here' : ''}
                  aria-current={current === id ? 'location' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span>{label}</span>
                </a>
              </li>
            ))}
            <li>
              <a className="say" href="#contact" onClick={() => setOpen(false)}>
                Say hello
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
