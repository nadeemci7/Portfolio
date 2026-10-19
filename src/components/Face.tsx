import { useEffect, useId, useMemo, useRef } from 'react'
import type { FaceSpec } from '../data'
import { COLORS, EYES, darken, eyeColor, lighten, shapePoints, svgPath } from '../lib/blob'
import { registerFace } from '../lib/look'

const R = 40

/* A flat blob character drawn in SVG, shaded to look soft and round. */
export default function Face({ spec, className }: { spec: FaceSpec; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const d = useMemo(() => svgPath(shapePoints(spec.shape, R, 64)), [spec.shape])
  const col = COLORS[spec.color]

  useEffect(() => (ref.current ? registerFace(ref.current) : undefined), [])

  return (
    <svg ref={ref} className={'face ' + (className ?? '')} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`b${id}`} cx="34%" cy="26%" r="82%">
          <stop offset="0" stopColor={lighten(col, 0.34)} />
          <stop offset="0.58" stopColor={col} />
          <stop offset="1" stopColor={darken(col, 0.26)} />
        </radialGradient>
        <radialGradient id={`h${id}`} cx="30%" cy="20%" r="34%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#b${id})`} />
      <path d={d} fill={`url(#h${id})`} />
      <g className="eyes" fill={eyeColor(spec.color)}>
        {EYES[spec.eyes].map((e, i) =>
          e.t === 'c' ? (
            <circle key={i} cx={e.x * R} cy={e.y * R} r={e.r * R} />
          ) : (
            <rect
              key={i}
              x={(e.x - e.w / 2) * R}
              y={(e.y - e.h / 2) * R}
              width={e.w * R}
              height={e.h * R}
              rx={(Math.min(e.w, e.h) * R) / 2}
              transform={`rotate(${((e.rot * 180) / Math.PI).toFixed(1)} ${e.x * R} ${e.y * R})`}
            />
          ),
        )}
      </g>
    </svg>
  )
}
