/*
  Colour themes. Open the site with ?theme=<id> to try one, for example
  http://127.0.0.1:5173/?theme=lime. Change DEFAULT_THEME to pick the one the
  site uses without a parameter. Each theme's colours live in styles.css under
  [data-theme='<id>'].
*/
export const THEMES = [
  { id: 'night', name: 'Night' },
  { id: 'studio', name: 'Studio' },
  { id: 'lime', name: 'Lime' },
  { id: 'lime-light', name: 'Lime light' },
  { id: 'cobalt', name: 'Cobalt' },
  { id: 'brutal', name: 'Brutal' },
  { id: 'ink', name: 'Ink' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const DEFAULT_THEME: ThemeId = 'night'

export function applyTheme(): ThemeId {
  const asked = new URLSearchParams(window.location.search).get('theme')
  const id: ThemeId = THEMES.find((t) => t.id === asked)?.id ?? DEFAULT_THEME
  document.documentElement.dataset.theme = id
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg || '#0b1026')
  return id
}

export function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
