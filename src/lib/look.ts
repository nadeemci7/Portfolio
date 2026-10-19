import { prefersReducedMotion } from './blob'

/*
  Every SVG face on the page registers here. One pointer listener moves the
  eyes of the faces on screen toward the cursor, and a timer makes one blink.
  Faces on screen are tracked with an IntersectionObserver, and each update
  reads all positions first and writes all styles after, so the browser
  never has to recalculate layout in between.
*/
const faces = new Set<SVGSVGElement>()
const visible = new Set<SVGSVGElement>()
let px = 0
let py = 0
let queued = false
let started = false
let io: IntersectionObserver | null = null

function update() {
  queued = false
  const list = [...visible]
  const rects = list.map((f) => f.getBoundingClientRect())
  for (let i = 0; i < list.length; i++) {
    const r = rects[i]
    const dx = px - (r.left + r.width / 2)
    const dy = py - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy) || 1
    const k = Math.min(d / 260, 1)
    list[i].style.setProperty('--ex', ((dx / d) * k * 5).toFixed(1) + 'px')
    list[i].style.setProperty('--ey', ((dy / d) * k * 4).toFixed(1) + 'px')
  }
}

function blink() {
  if (document.hidden || !visible.size) return
  const list = [...visible]
  const f = list[Math.floor(Math.random() * list.length)]
  f.classList.add('blink')
  window.setTimeout(() => f.classList.remove('blink'), 140)
}

function start() {
  if (started || prefersReducedMotion()) return
  started = true
  io = new IntersectionObserver((entries) =>
    entries.forEach((en) => {
      const f = en.target as SVGSVGElement
      if (en.isIntersecting) visible.add(f)
      else visible.delete(f)
    }),
  )
  faces.forEach((f) => io!.observe(f))
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX
      py = e.clientY
      if (!queued) {
        queued = true
        requestAnimationFrame(update)
      }
    },
    { passive: true },
  )
  window.setInterval(blink, 800)
}

export function registerFace(el: SVGSVGElement) {
  start()
  faces.add(el)
  io?.observe(el)
  return () => {
    faces.delete(el)
    visible.delete(el)
    io?.unobserve(el)
  }
}
