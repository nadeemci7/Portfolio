import type { CSSProperties } from 'react'
import type { ColorName, Eyes, Shape } from '../data'

export const COLORS: Record<ColorName, string> = {
  blue: '#3d6cf5',
  yellow: '#f7c425',
  red: '#ee4848',
  pink: '#f5a8d6',
  teal: '#3cc8d6',
  ink: '#1b1e27',
  cloud: '#c9ccd5',
  orange: '#ff8a3d',
}

/*
  The colour used for borders, fills and glows around a character. Ink is the
  character's own colour but would vanish on a dark page, so its highlights use
  a light steel instead. --on-tint is the text colour that reads on a filled tint.
*/
const UI_TINT: Record<ColorName, string> = { ...COLORS, ink: '#aab2c8' }
const WHITE_TEXT_ON = new Set<ColorName>(['blue'])
export function tintVars(c: ColorName): CSSProperties {
  return { '--tint': UI_TINT[c], '--on-tint': WHITE_TEXT_ON.has(c) ? '#ffffff' : '#111316' } as CSSProperties
}

export const EYE_DARK = '#111316'
export const EYE_LIGHT = '#f3f4f8'
export const eyeColor = (c: ColorName) => (c === 'ink' ? EYE_LIGHT : EYE_DARK)

/* Eye parts in units of the blob radius, centred on the blob, y pointing down. */
export type EyePart =
  | { t: 'c'; x: number; y: number; r: number }
  | { t: 'r'; x: number; y: number; w: number; h: number; rot: number }

export const EYES: Record<Eyes, EyePart[]> = {
  dashes: [
    { t: 'r', x: -0.2, y: -0.1, w: 0.11, h: 0.3, rot: 0 },
    { t: 'r', x: 0.2, y: -0.1, w: 0.11, h: 0.3, rot: 0 },
  ],
  dots: [
    { t: 'c', x: -0.21, y: -0.06, r: 0.095 },
    { t: 'c', x: 0.21, y: -0.06, r: 0.095 },
  ],
  strobi: [
    { t: 'c', x: -0.2, y: -0.1, r: 0.17 },
    { t: 'c', x: 0.27, y: 0.12, r: 0.085 },
  ],
  vee: [
    { t: 'r', x: -0.17, y: -0.08, w: 0.1, h: 0.3, rot: -0.45 },
    { t: 'r', x: 0.17, y: -0.08, w: 0.1, h: 0.3, rot: 0.45 },
  ],
  dashdot: [
    { t: 'r', x: -0.17, y: -0.03, w: 0.28, h: 0.1, rot: 0 },
    { t: 'c', x: 0.25, y: -0.03, r: 0.065 },
  ],
}

/* Outline radius at angle t, in units of R (2D, y down). */
export function shapeR(shape: Shape, t: number): number {
  const c = Math.cos(t)
  const s = Math.sin(t)
  switch (shape) {
    case 'egg':
      return 1 + 0.075 * s - 0.02 * Math.cos(2 * t)
    case 'bean':
      return 1 + 0.055 * Math.cos(2 * t) + 0.035 * s
    case 'pill': {
      const a = 0.86
      const b = 1.06
      return 1 / Math.sqrt((c / a) ** 2 + (s / b) ** 2)
    }
    case 'cloud':
      return 1 + 0.045 * Math.cos(6 * t + 0.5) + (s < 0 ? 0.025 * Math.cos(3 * t) : 0)
    case 'squircle': {
      const n = 3.2
      return 0.9 / Math.pow(Math.abs(c) ** n + Math.abs(s) ** n, 1 / n)
    }
    default:
      return 1 + 0.02 * Math.cos(3 * t + 0.6)
  }
}

export function shapePoints(shape: Shape, R: number, n = 64): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const r = shapeR(shape, t) * R
    pts.push([r * Math.cos(t), r * Math.sin(t)])
  }
  return pts
}

/* Smooth closed SVG path through the points (quadratic curves between midpoints). */
export function svgPath(pts: [number, number][]): string {
  const f = (v: number) => v.toFixed(2)
  const n = pts.length
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m = mid(pts[n - 1], pts[0])
  let d = `M${f(m[0])} ${f(m[1])}`
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const q = mid(pts[i], pts[(i + 1) % n])
    d += `Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`
  }
  return d + 'Z'
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(hex: string, target: number, t: number): string {
  const [r, g, b] = hexToRgb(hex)
  const m = (v: number) => Math.round(v + (target - v) * t)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}
export const lighten = (hex: string, t: number) => mix(hex, 255, t)
export const darken = (hex: string, t: number) => mix(hex, 0, t)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
