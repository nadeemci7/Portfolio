import { useState, type CSSProperties } from 'react'
import { PATH, PROFILE, PROJECTS, TOOLBOX, type Eyes, type Shape } from '../data'
import { COLORS } from '../lib/blob'
import Face from './Face'
import Reveal, { Magnetic, ScrollFade, Title } from './Reveal'

export function Path() {
  return (
    <section className="section" id="path">
      <div className="wrap">
        <ScrollFade className="section-head" fadeOut={false}>
          <Title text="Path" />
          <span className="note">2018 to now</span>
        </ScrollFade>
        <ol className="path">
          {PATH.map((item) => (
            <li key={item.title} style={{ '--tint': COLORS[item.color] } as CSSProperties}>
              <ScrollFade className="path-row">
                <span className="dot" aria-hidden="true" />
                <span className="yrs">{item.years}</span>
                <div>
                  <h3>
                    {item.title}, <span className="org">{item.org}</span>
                    {item.now && <span className="now">Now</span>}
                  </h3>
                  {item.text && <p>{item.text}</p>}
                </div>
              </ScrollFade>
            </li>
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

/* Words to look for in the project write-ups when a skill's own name won't match. */
const ALIASES: Record<string, string[]> = {
  'Lightning Web Components': ['lwc'],
  'Batch and Queueable Apex': ['batch'],
  Triggers: ['trigger'],
  'Visualforce PDF': ['visualforce'],
  'Inbound Email Services': ['inbound email'],
  'Entitlements and Milestones': ['entitlement'],
  'Reports and Dashboards': ['reports'],
  'Salesforce for Slack': ['sales cloud for slack', 'slack api'],
  'OpenAI API': ['openai'],
  'Named Credentials': ['named credential'],
  'REST APIs': ['api'],
  Webhooks: ['webhook'],
  'Apex User Mode': ['user mode'],
  'Profiles and Permission Sets': ['permission'],
  'Sharing Rules': ['sharing'],
  'Guest User Security': ['guest'],
  'Protected Custom Settings': ['protected custom setting'],
  'Java 8+': ['core java', 'spring boot'],
  JavaScript: ['javascript'],
  'Database design (3NF)': ['mysql', 'postgresql', 'supabase'],
  'Zoho CRM and Deluge': ['zoho'],
  'HTML and CSS': ['html'],
}

const CORPUS = PROJECTS.map((p) => ({
  name: p.name,
  text: [p.name, p.kind, p.line, p.stack.join(' '), p.built.join(' ')].join(' ').toLowerCase(),
}))

function usedIn(item: string) {
  const keys = (ALIASES[item] ?? [item]).map((k) => k.toLowerCase())
  const names = CORPUS.filter((c) => keys.some((k) => c.text.includes(k))).map((c) => c.name)
  if (!names.length) return undefined
  const shown = names.slice(0, 3).join(', ')
  return `Used in ${shown}${names.length > 3 ? ` and ${names.length - 3} more` : ''}`
}

export function Toolbox() {
  return (
    <section className="section" id="toolbox">
      <div className="wrap">
        <ScrollFade className="section-head" fadeOut={false}>
          <Title text="Toolbox" />
          <span className="note">Hover a skill to see where I used it</span>
        </ScrollFade>
        <Reveal className="intro" delay={0.05}>
          <p>I speak English, Hindi and Urdu, and these:</p>
        </Reveal>
        <div className="toolbox">
          {TOOLBOX.map((g, i) => (
            <ScrollFade key={g.title} className="tool-fade">
              <div className="tool-group" style={{ '--tint': COLORS[g.color] } as CSSProperties}>
                <header>
                  <span className="mini">
                    <Face spec={{ color: g.color, ...GROUP_LOOKS[i % GROUP_LOOKS.length] }} />
                  </span>
                  <h3>{g.title}</h3>
                  <span className="tool-count">{g.items.length}</span>
                </header>
                <ul>
                  {g.items.map((it) => {
                    const tip = usedIn(it)
                    return (
                      <li key={it} data-tip={tip} tabIndex={tip ? 0 : undefined}>
                        {it}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </ScrollFade>
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
        <ScrollFade fadeOut={false}>
          <div className="section-head">
            <Title text="CV" />
          </div>
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
        </ScrollFade>
        <ScrollFade className="sheet-wrap" fadeOut={false}>
          <span className="peek">
            <Face spec={{ color: 'teal', shape: 'pill', eyes: 'dots' }} />
          </span>
          <span className="quip sheet-say" aria-hidden="true">
            Two pages, no fluff
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
        </ScrollFade>
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
        <ScrollFade fadeOut={false}>
          <Title text="Say hello" />
          <p className="big">Email is the quickest way to reach me.</p>
        </ScrollFade>
        <ScrollFade className="mail-row" fadeOut={false}>
          <a className="mail" id="mail" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
          <Magnetic>
            <button className="btn band" type="button" onClick={copy}>
              {label}
            </button>
          </Magnetic>
        </ScrollFade>
        <ScrollFade fadeOut={false}>
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
        </ScrollFade>
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
