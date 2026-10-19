import { useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { PROJECTS, TOOLS } from './data'
import { scrollToId, startSmoothScroll } from './lib/scroll'
import Header from './components/Header'
import Hero from './components/Hero'
import Work from './components/Work'
import Guide from './components/Guide'
import Belt from './components/Belt'
import { Contact, Cv, Footer, Path, Toolbox } from './components/Sections'

export default function App() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<string | null>(null)
  const [flash, setFlash] = useState(0)
  const counts = useMemo(
    () => Object.fromEntries(TOOLS.map((t) => [t.key, PROJECTS.filter((p) => p.uses.includes(t.key)).length])),
    [],
  )
  const pick = useCallback((key: string) => setActive((a) => (a === key ? null : key)), [])
  const clear = useCallback(() => setActive(null), [])
  const show = useCallback(
    (key: string) => {
      setActive(key)
      scrollToId('work')
      window.setTimeout(() => setFlash((f) => f + 1), reduce ? 0 : 900)
    },
    [reduce],
  )

  useEffect(() => {
    startSmoothScroll()
  }, [])

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero active={active} counts={counts} onPick={pick} onShow={show} onClear={clear} />
        <Belt />
        <Work active={active} setActive={setActive} counts={counts} flash={flash} />
        <Path />
        <Toolbox />
        <Cv />
        <Contact />
      </main>
      <Footer />
      <Guide />
    </>
  )
}
