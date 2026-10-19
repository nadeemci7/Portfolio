import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { BallCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Environment, Html, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PROJECTS, TOOLS, type Shape, type Tool } from '../data'
import { COLORS, EYES, eyeColor, prefersReducedMotion } from '../lib/blob'
import { cssVar } from '../theme'

/*
  Zero-gravity blob characters. Each one is pulled gently toward a resting
  spot, drifts a little on its own, gets pushed by an invisible ball under the
  cursor, and can be grabbed and thrown. Rotations are locked so the faces
  always look at you. Tapping one opens a small card that says where that tool
  shows up below. Idea after the pmndrs "Lusion connectors" example.
*/

const BASE = 0.62

type Shared = { grabbing: boolean; outside: boolean }

export interface BlobSceneProps {
  active: string | null
  counts: Record<string, number>
  onPick: (key: string) => void
  onShow: (key: string) => void
  onClear: () => void
}

function anchorFor(vw: number, vh: number, pxWidth: number): [number, number] {
  if (pxWidth < 900) return [0, 0]
  const sx = Math.min(pxWidth * 0.74, pxWidth / 2 + 330)
  return [(sx / pxWidth - 0.5) * vw, -vh * 0.02]
}

const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/* ---------------- geometry ---------------- */

function smooth(g: THREE.BufferGeometry) {
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  const merged = mergeVertices(g)
  merged.computeVertexNormals()
  g.dispose()
  return merged
}

function egg(r: number) {
  const g = new THREE.SphereGeometry(r, 64, 48)
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i)
    const k = 1 - 0.09 * (y / r)
    p.setXYZ(i, p.getX(i) * k, y * 1.06, p.getZ(i) * k)
  }
  return smooth(g)
}

function bumpy(r: number) {
  const g = new THREE.SphereGeometry(r, 96, 64)
  const p = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  const n = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    n.copy(v).normalize()
    const theta = Math.atan2(n.y, n.x)
    const f = 1 + 0.06 * Math.cos(6 * theta + 0.5) * (1 - Math.abs(n.z)) * (n.y > -0.2 ? 1 : 0.5)
    v.multiplyScalar(f)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  return smooth(g)
}

interface ShapeDef {
  geo: THREE.BufferGeometry
  scale: [number, number, number]
  front: number
  lift: number
}

function makeShape(shape: Shape, r: number): ShapeDef {
  switch (shape) {
    case 'egg':
      return { geo: egg(r), scale: [1, 1, 1], front: r * 1.0, lift: 0 }
    case 'bean':
      return { geo: new THREE.SphereGeometry(r, 64, 48), scale: [1.1, 0.9, 0.92], front: r * 0.92, lift: 0 }
    case 'pill':
      return { geo: new THREE.CapsuleGeometry(r * 0.74, r * 0.62, 12, 32), scale: [1, 1, 1], front: r * 0.74, lift: r * 0.14 }
    case 'cloud':
      return { geo: bumpy(r), scale: [1, 1, 0.95], front: r * 0.96, lift: 0 }
    case 'squircle':
      return { geo: new RoundedBoxGeometry(r * 1.8, r * 1.75, r * 1.45, 6, r * 0.5), scale: [1, 1, 1], front: r * 0.725, lift: 0 }
    default:
      return { geo: new THREE.SphereGeometry(r, 64, 48), scale: [1, 1, 1], front: r, lift: 0 }
  }
}

/* ---------------- pieces ---------------- */

function EyeMeshes({ tool, r, z }: { tool: Tool; r: number; z: number }) {
  const color = eyeColor(tool.color)
  return (
    <>
      {EYES[tool.eyes].map((e, i) => {
        const x = e.x * r
        const y = -e.y * r
        if (e.t === 'c') {
          return (
            <mesh key={i} position={[x, y, z]} scale={[1, 1, 0.5]}>
              <sphereGeometry args={[e.r * r, 24, 16]} />
              <meshStandardMaterial color={color} roughness={0.25} />
            </mesh>
          )
        }
        const thick = Math.min(e.w, e.h) * r
        const len = Math.max(e.w, e.h) * r - thick
        const turn = e.w > e.h ? Math.PI / 2 : 0
        return (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, turn - e.rot]} scale={[1, 1, 0.5]}>
            <capsuleGeometry args={[thick / 2, len, 8, 16]} />
            <meshStandardMaterial color={color} roughness={0.25} />
          </mesh>
        )
      })}
    </>
  )
}

interface BlobProps {
  tool: Tool
  index: number
  active: boolean
  count: number
  names: string[]
  ring: string
  onPick: (key: string) => void
  onShow: (key: string) => void
  onClear: () => void
  shared: MutableRefObject<Shared>
  reduce: boolean
}

function Blob({ tool, index, active, count, names, ring, onPick, onShow, onClear, shared, reduce }: BlobProps) {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const grab = useRef<{ x: number; y: number; t: number; moved: boolean } | null>(null)
  const time = useRef(0)
  const mounted = useRef(performance.now())
  const pulse = useRef(0)
  const blink = useRef({ next: 1.5 + Math.random() * 3, until: 0 })
  const [hovered, setHovered] = useState(false)
  const [held, setHeld] = useState(false)

  const r = BASE * tool.size
  const def = useMemo(() => makeShape(tool.shape, r), [tool.shape, r])
  useEffect(() => () => def.geo.dispose(), [def])
  const seed = useMemo(() => Math.random() * 100, [])
  const start = useMemo<[number, number, number]>(() => {
    const a = (index / TOOLS.length) * Math.PI * 2
    const cx = window.innerWidth >= 900 ? 3.3 : 0
    return [cx + Math.cos(a) * 1.9, Math.sin(a) * 1.7, 0]
  }, [index])
  const goal = useMemo(() => new THREE.Vector3(1, 1, 1), [])

  useFrame((state, delta) => {
    const b = body.current
    if (!b) return
    const dt = Math.min(delta, 1 / 20)
    time.current += dt
    const t = time.current
    const { pointer, viewport, size } = state
    const p = b.translation()
    const px = (pointer.x * viewport.width) / 2
    const py = (pointer.y * viewport.height) / 2

    if (grab.current) {
      b.setLinvel({ x: (px - p.x) * 14, y: (py - p.y) * 14, z: -p.z * 6 }, true)
    } else {
      const [ax, ay] = anchorFor(viewport.width, viewport.height, size.width)
      const wx = reduce ? 0 : Math.sin(t * 0.55 + seed) * 0.4
      const wy = reduce ? 0 : Math.cos(t * 0.45 + seed * 1.7) * 0.35
      const k = b.mass() * 7 * dt
      b.applyImpulse({ x: (ax + wx - p.x) * k, y: (ay + wy - p.y) * k, z: -p.z * k * 2 }, true)
    }

    const e = eyes.current
    if (e) {
      const dx = px - p.x
      const dy = py - p.y
      const d = Math.hypot(dx, dy) || 1
      const m = reduce ? 0 : Math.min(d / 2.4, 1) * r * 0.12
      e.position.x += ((dx / d) * m - e.position.x) * 0.15
      e.position.y += ((dy / d) * m - e.position.y) * 0.15
      if (!reduce && t > blink.current.next) {
        blink.current.until = t + 0.13
        blink.current.next = t + 2.2 + Math.random() * 4
      }
      const sy = grab.current ? 1.3 : t < blink.current.until ? 0.12 : 1
      e.scale.y += (sy - e.scale.y) * 0.45
      e.scale.x += ((grab.current ? 1.15 : 1) - e.scale.x) * 0.3
    }

    const v = visual.current
    if (v) {
      pulse.current *= 0.9
      const lv = b.linvel()
      const sp = Math.hypot(lv.x, lv.y)
      const st = reduce ? 0 : Math.min(sp * 0.02, 0.14)
      const ux = sp > 0.01 ? Math.abs(lv.x) / sp : 0
      const uy = sp > 0.01 ? Math.abs(lv.y) / sp : 0
      // pop-in runs on wall-clock time, so slow devices still show every blob within a second or two
      const age = (performance.now() - mounted.current) / 1000
      const born = reduce ? 1 : easeOutBack(Math.min(Math.max((age - 0.15 - index * 0.09) / 0.6, 0), 1))
      const s = born * (1 + pulse.current * 0.18 + (hovered ? 0.05 : 0) + (active ? 0.06 : 0))
      goal.set(Math.max(s * (1 + st * (ux - uy)), 0.001), Math.max(s * (1 + st * (uy - ux)), 0.001), Math.max(s, 0.001))
      v.scale.lerp(goal, born < 1 ? 1 : 0.25)
    }
  })

  const cursor = (c: string) => {
    document.body.style.cursor = c
  }

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ;(e.target as unknown as Element).setPointerCapture?.(e.pointerId)
    grab.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: performance.now(), moved: false }
    shared.current.grabbing = true
    setHeld(true)
    cursor('grabbing')
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const g = grab.current
    if (g && Math.hypot(e.nativeEvent.clientX - g.x, e.nativeEvent.clientY - g.y) > 6) g.moved = true
  }
  const release = (e: ThreeEvent<PointerEvent>, allowPick: boolean) => {
    const g = grab.current
    if (!g) return
    grab.current = null
    shared.current.grabbing = false
    setHeld(false)
    ;(e.target as unknown as Element).releasePointerCapture?.(e.pointerId)
    cursor(hovered ? 'grab' : '')
    if (allowPick && !g.moved && performance.now() - g.t < 350) {
      pulse.current = 1
      onPick(tool.key)
    }
  }

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={start}
      linearDamping={3.5}
      angularDamping={2}
      enabledRotations={[false, false, false]}
      restitution={0.5}
      friction={0.2}
    >
      <BallCollider args={[r * 1.02]} />
      <group ref={visual} scale={0.001}>
        <mesh
          geometry={def.geo}
          scale={def.scale}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={(e) => release(e, true)}
          onLostPointerCapture={(e) => release(e, false)}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            if (!grab.current) cursor('grab')
          }}
          onPointerOut={() => {
            setHovered(false)
            if (!grab.current) cursor('')
          }}
        >
          <meshPhysicalMaterial color={COLORS[tool.color]} roughness={0.4} clearcoat={0.65} clearcoatRoughness={0.28} />
        </mesh>
        <group ref={eyes}>
          <group position={[0, def.lift, 0]}>
            <EyeMeshes tool={tool} r={r} z={def.front} />
          </group>
        </group>
      </group>
      {active && (
        <mesh position={[0, 0, -r * 0.5]}>
          <torusGeometry args={[r * 1.3, 0.022, 12, 96]} />
          <meshBasicMaterial color={ring} transparent opacity={0.85} />
        </mesh>
      )}
      {hovered && !active && !held && (
        <Html position={[0, r * 1.25, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <span className="blob-tip">
            {tool.label}
            <em>tap me</em>
          </span>
        </Html>
      )}
      {active && !held && (
        <Html position={[0, r * 1.3, 0]} zIndexRange={[6, 0]}>
          <div className="pop" onPointerDown={(e) => e.stopPropagation()}>
            <div className="pop-head">
              <strong>{tool.label}</strong>
              <span>
                {count} project{count === 1 ? '' : 's'} below
              </span>
              <button type="button" className="pop-x" aria-label="Close" onClick={onClear}>
                &times;
              </button>
            </div>
            <ul className="pop-list">
              {names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <button type="button" className="pop-go" onClick={() => onShow(tool.key)}>
              Show me <span aria-hidden="true">&darr;</span>
            </button>
          </div>
        </Html>
      )}
    </RigidBody>
  )
}

function PointerBody({ shared }: { shared: MutableRefObject<Shared> }) {
  const ref = useRef<RapierRigidBody>(null)
  useFrame(({ pointer, viewport }) => {
    const b = ref.current
    if (!b) return
    const away = shared.current.grabbing || shared.current.outside
    if (away) {
      if (b.isEnabled()) b.setEnabled(false)
      return
    }
    const pos = { x: (pointer.x * viewport.width) / 2, y: (pointer.y * viewport.height) / 2, z: 0 }
    if (!b.isEnabled()) {
      b.setTranslation(pos, true)
      b.setEnabled(true)
    } else {
      b.setNextKinematicTranslation(pos)
    }
  })
  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders={false} position={[0, 0, 0]}>
      <BallCollider args={[0.45]} />
    </RigidBody>
  )
}

/* ---------------- scene ---------------- */

export default function BlobScene({ active, counts, onPick, onShow, onClear }: BlobSceneProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const shared = useRef<Shared>({ grabbing: false, outside: true })
  const [visible, setVisible] = useState(true)
  const reduce = useMemo(prefersReducedMotion, [])
  const ring = useMemo(() => cssVar('--text', '#eef1fb'), [])
  const names = useMemo(
    () => Object.fromEntries(TOOLS.map((t) => [t.key, PROJECTS.filter((p) => p.uses.includes(t.key)).map((p) => p.name)])),
    [],
  )

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting))
    io.observe(el)
    const enter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') shared.current.outside = false
    }
    const leave = () => {
      shared.current.outside = true
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') shared.current.outside = false
    }
    const up = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') shared.current.outside = true
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      io.disconnect()
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <div ref={wrap} className="scene">
      <Canvas
        flat
        dpr={[1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 14], fov: 30, near: 1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ touchAction: 'pan-y' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[-5, 7, 9]} intensity={1.3} />
        <Suspense fallback={null}>
          <Physics gravity={[0, 0, 0]}>
            <PointerBody shared={shared} />
            {TOOLS.map((t, i) => (
              <Blob
                key={t.key}
                tool={t}
                index={i}
                active={active === t.key}
                count={counts[t.key] ?? 0}
                names={names[t.key] ?? []}
                ring={ring}
                onPick={onPick}
                onShow={onShow}
                onClear={onClear}
                shared={shared}
                reduce={reduce}
              />
            ))}
          </Physics>
          <Environment resolution={256} frames={1}>
            <group rotation={[-Math.PI / 3, 0, 1]}>
              <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
            </group>
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  )
}
