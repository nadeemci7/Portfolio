import { prefersReducedMotion } from './blob'

/*
  Every SVG face on the page registers here. One pointer listener moves all
  their eyes toward the cursor, and a timer makes a random visible face blink.
*/
const faces = new Set<SVGSVGElement>()
let px = 0
let py = 0
let seen = false
let queued = false
let started = false

function inView(r: DOMRect) {
  return r.bottom > -40 && r.top < window.innerHeight + 40 && r.width > 0
}

function update() {
  queued = false
  if (!seen) return
  faces.forEach((f) => {
    const r = f.getBoundingClientRect()
    if (!inView(r)) return
    const dx = px - (r.left + r.width / 2)
    const dy = py - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy) || 1
    const k = Math.min(d / 260, 1)
    f.style.setProperty('--ex', ((dx / d) * k * 5).toFixed(2) + 'px')
    f.style.setProperty('--ey', ((dy / d) * k * 4).toFixed(2) + 'px')
  })
}

function queue() {
  if (queued) return
  queued = true
  requestAnimationFrame(update)
}

function blink() {
  if (document.hidden) return
  const visible = [...faces].filter((f) => inView(f.getBoundingClientRect()))
  if (!visible.length) return
  const f = visible[Math.floor(Math.random() * visible.length)]
  f.classList.add('blink')
  window.setTimeout(() => f.classList.remove('blink'), 140)
}

function start() {
  if (started || prefersReducedMotion()) return
  started = true
  const move = (e: PointerEvent) => {
    px = e.clientX
    py = e.clientY
    seen = true
    queue()
  }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', move, { passive: true })
  window.addEventListener('scroll', queue, { passive: true })
  window.setInterval(blink, 750)
}

export function registerFace(el: SVGSVGElement) {
  start()
  faces.add(el)
  queue()
  return () => {
    faces.delete(el)
  }
}
