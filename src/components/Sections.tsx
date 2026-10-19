import { useState } from 'react'
import { motion } from 'motion/react'
import { PATH, PROFILE, TOOLBOX, type Eyes, type Shape } from '../data'
import { COLORS } from '../lib/blob'
import Face from './Face'
import Reveal, { Magnetic, Title, useFade } from './Reveal'

export function Path() {
  const fade = useFade()
  return (
    <section className="section" id="path">
      <div className="wrap">
        <div className="section-head">
          <Title text="Path" />
          <Reveal className="note" delay={0.2}>
            2018 to now
          </Reveal>
        </div>
        <ol className="path">
          {PATH.map((item, i) => (
            <motion.li key={item.title} {...fade(i * 0.07)}>
              <span className="dot" style={{ background: COLORS[item.color] }} aria-hidden="true" />
              <span className="yrs">{item.years}</span>
              <div>
                <h3>
                  {item.title}, <span className="org">{item.org}</span>
                  {item.now && <span className="now">Now</span>}
                </h3>
                {item.text && <p>{item.text}</p>}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const GROUP_LOOKS: { shape: Shape; eyes: Eyes }[] = [
  { shape: 'round', eyes: 'strobi' },
  { shape: 'bean', eyes: 'dashes' },
  { shape: 'pill', eyes: 'dashdot' },
  { shape: 'cloud', eyes: 'vee' },
  { shape: 'egg', eyes: 'dashes' },
  { shape: 'squircle', eyes: 'dots' },
]

export function Toolbox() {
  const fade = useFade()
  return (
    <section className="section" id="toolbox">
      <div className="wrap">
        <div className="section-head">
          <Title text="Toolbox" />
          <Reveal className="note" delay={0.2}>
            What I reach for
          </Reveal>
        </div>
        <Reveal className="intro" delay={0.05}>
          <p>I speak English, Hindi and Urdu, and these:</p>
        </Reveal>
        <div className="toolbox">
          {TOOLBOX.map((g, i) => (
            <motion.div
              key={g.title}
              className="tool-group"
              style={{ ['--tint' as string]: COLORS[g.color] }}
              {...fade((i % 3) * 0.08)}
            >
              <header>
                <span className="mini">
                  <Face spec={{ color: g.color, ...GROUP_LOOKS[i % GROUP_LOOKS.length] }} />
                </span>
                <h3>{g.title}</h3>
              </header>
              <ul>
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Cv() {
  return (
    <section className="section" id="cv">
      <div className="wrap cv-grid">
        <div>
          <div className="section-head">
            <Title text="CV" />
          </div>
          <Reveal delay={0.1}>
            <p className="cv-text">
              Two pages: skills, experience at Cloud Ingenious, the projects on this page, training and education. It's
              typeset in LaTeX, so the source file opens in Overleaf if anything needs changing.
            </p>
            <div className="cv-actions">
              <Magnetic>
                <a className="btn primary" href={PROFILE.cvPdf} target="_blank" rel="noopener">
                  Open the PDF <span className="arrow" aria-hidden="true">&#8599;</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn" href={PROFILE.cvTex} download>
                  LaTeX source
                </a>
              </Magnetic>
            </div>
            <p className="updated">Last updated {PROFILE.cvUpdated}</p>
          </Reveal>
        </div>
        <Reveal className="sheet-wrap" delay={0.15}>
          <span className="peek">
            <Face spec={{ color: 'teal', shape: 'pill', eyes: 'dots' }} />
          </span>
          <a href={PROFILE.cvPdf} target="_blank" rel="noopener" className="sheet-link" aria-label="Open the CV as a PDF">
            <img
              className="sheet"
              src={PROFILE.cvPreview}
              width={910}
              height={1287}
              alt="First page of Nadeem Ahmad's CV: summary, technical skills, experience and the start of the projects list."
              loading="lazy"
            />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

export function Contact() {
  const [label, setLabel] = useState('Copy address')
  const copy = () => {
    const done = (t: string) => {
      setLabel(t)
      window.setTimeout(() => setLabel('Copy address'), 1800)
    }
    const fallback = () => {
      const el = document.getElementById('mail')
      if (!el) return
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      done('Selected, press Ctrl+C')
    }
    try {
      navigator.clipboard.writeText(PROFILE.email).then(() => done('Copied'), fallback)
    } catch {
      fallback()
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <Title text="Say hello" />
        <Reveal delay={0.1}>
          <p className="big">Email is the quickest way to reach me.</p>
        </Reveal>
        <Reveal className="mail-row" delay={0.16}>
          <a className="mail" id="mail" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
          <Magnetic>
            <button className="btn band" type="button" onClick={copy}>
              {label}
            </button>
          </Magnetic>
        </Reveal>
        <Reveal delay={0.22}>
          <ul className="elsewhere">
            <li>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={PROFILE.github} target="_blank" rel="noopener">
                GitHub
              </a>
            </li>
            <li>{PROFILE.location}</li>
          </ul>
        </Reveal>
        <div className="peekers" aria-hidden="true">
          <span>
            <Face spec={{ color: 'yellow', shape: 'egg', eyes: 'dots' }} />
          </span>
          <span>
            <Face spec={{ color: 'pink', shape: 'bean', eyes: 'dashes' }} />
          </span>
          <span>
            <Face spec={{ color: 'ink', shape: 'round', eyes: 'dashes' }} />
          </span>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p>&copy; 2026 Nadeem Ahmad</p>
        <p>
          Blob characters after the{' '}
          <a href="https://avatars.bible-strong.app/" target="_blank" rel="noopener">
            Bible Strong Avatar Lab
          </a>
          . Built with React, three.js and Motion.
        </p>
      </div>
    </footer>
  )
}
