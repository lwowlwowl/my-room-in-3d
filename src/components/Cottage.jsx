import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useStore, labelRef } from '../store'

// ---------------------------------------------------------------------------
// Cottagecore diorama — imported from blender/test1.blend (user's layout).
// One compressed GLB (Draco + WebP) holds ALL furniture. Everything renders
// as plain scenery EXCEPT:
//   • the signpost — its three boards (MY WORK / ABOUT / CONTACT) are each
//     clickable and open a forest-themed modal (see ForestModal.jsx).
//     At night the boards light up with glowing labels (SignpostNightText).
//   • the desk lamp — day/night toggle easter egg; at night its material
//     glows and an HDR bulb sphere at the shade blooms (LampGlow)
//
// Blender is Z-up, glTF is Y-up: blender (x, y, z) → three (x, z, -y).
// Floor top was z=3.16 in blender → y=3.16 here → shifted down so floor = 0.
//
// Measured geometry (decoded from the GLB — see blender/ notes):
//   • lamp bulb (brightest texture strip) ≈ world (-3.5, 2.72, -3.3), on the
//     desk at back-left; lamp mesh spans x[-4.3,-3.0] y[1.35,2.95] z[-4.3,-2.9]
//   • signpost boards are thin panels on the log's ±X faces; the +X face
//     points toward world (0.577, 0, 0.816) — i.e. at the default camera
// ---------------------------------------------------------------------------

const FLOOR_OFFSET = -3.16

// GLB root node names (tripo_node uuids — Blender empties are dropped on
// glTF export, only the mesh object names survive).
const LAMP_NODE = 'tripo_node_da035d8a-3e50-4fe3-aac6-d0e068e1b157'
const SIGNPOST_NODE = 'tripo_node_1d29e4a9-0d71-4481-ac45-6c94a37fa5f1'

// Exact baked transform of the signpost root (read from the GLB json).
// We re-apply it defensively — its scale has been observed to reset at runtime.
const SIGNPOST_TF = {
  pos: [4.419294943277947, 3.071744682742633, -3.5626951637229345],
  rot: [0, -0.45964571700239976, 0, 0.8881023673211044],
  scale: 3.6,
}

// Shared split of the gltf scene. Cached at module level because primitive
// objects must never be mounted twice (two parents = three.js error).
let _parts = null
function useCottageParts() {
  const { scene } = useGLTF('/models/cottagecore-web.glb', '/draco/')
  return useMemo(() => {
    if (_parts) return _parts
    const shell = []
    let lamp = null
    let signpost = null
    for (const child of scene.children) {
      const name = child.name || ''
      if (name === LAMP_NODE) { lamp = child; continue }
      if (name === SIGNPOST_NODE) { signpost = child; continue }
      shell.push(child) // everything else is scenery
    }
    const lampMat = lamp && lamp.isMesh ? lamp.material : null
    const signpostMat = signpost && signpost.isMesh ? signpost.material : null
    // enable shadows on every mesh in the glb; disable mesh raycast —
    // these are 100k+ poly Tripo meshes, CPU raycast would freeze pointer
    // events. Interaction is handled by invisible low-poly proxy boxes.
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
        o.raycast = () => {}
      }
    })
    // vine bulb materials for the night flicker
    const bulbMats = []
    scene.traverse((o) => {
      if (o.isMesh && o.name.startsWith('bulb')) {
        const m = o.material
        if (m && m.emissive && !bulbMats.includes(m)) bulbMats.push(m)
      }
    })
    _parts = { shell, lamp, signpost, bulbMats, lampMat, signpostMat }
    // defensive: restore the signpost's baked transform
    if (signpost) {
      signpost.position.set(...SIGNPOST_TF.pos)
      signpost.quaternion.set(...SIGNPOST_TF.rot)
      signpost.scale.setScalar(SIGNPOST_TF.scale)
    }
    // Night glow: reuse the basecolor map as an emissive map so the object's
    // own texture modulates its glow. Intensity is toggled by `night`
    // (see NightGlow below) — kept at 0 here so day mode is untouched.
    const emissiveSetup = [
      [lampMat, '#ffb459'],
      [signpostMat, '#b8c8e8'],
    ]
    for (const [m, color] of emissiveSetup) {
      if (m && m.map && !m.emissiveMap) {
        m.emissiveMap = m.map
        m.emissive = new THREE.Color(color)
        m.emissiveIntensity = 0
        m.needsUpdate = true
      }
    }
    return _parts
  }, [scene])
}

export function CottageShell() {
  const { shell, bulbMats } = useCottageParts()
  const night = useStore((s) => s.night)
  const flickerSeeds = useMemo(() => Array.from({ length: 12 }, () => Math.random() * 10), [])
  const baseEmissive = useMemo(() => bulbMats.map((m) => m.emissiveIntensity ?? 1), [bulbMats])

  useFrame(({ clock }) => {
    if (!bulbMats.length) return
    const t = clock.elapsedTime
    for (let i = 0; i < bulbMats.length; i++) {
      const f = 0.85 + 0.15 * Math.sin(t * 7 + flickerSeeds[i % flickerSeeds.length])
      bulbMats[i].emissiveIntensity = (baseEmissive[i] || 1) * (night ? 2.4 : 1) * f
    }
  })

  return (
    <group position={[0, FLOOR_OFFSET, 0]}>
      {shell.map((n, i) => (
        <primitive key={n.uuid || i} object={n} />
      ))}
    </group>
  )
}

// Invisible low-poly hit proxy: raycasting against 100k+ poly Tripo meshes
// would stall pointer events, so interaction uses cheap boxes instead.
// center is floor-relative three-space (== final world y); we render inside
// the group that is already offset by FLOOR_OFFSET, so add 3.16 back on y.
function HitProxy({ center, size }) {
  return (
    <mesh position={[center[0], center[1] - FLOOR_OFFSET, center[2]]}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

// The lamp's lit bulb: an HDR-bright sphere over the brightest part of the
// lamp's baked texture (measured via raycast+uv sampling — the visible bulb
// strip, not the shade centroid; the centroid sits inside the mesh and
// separates from the bulb once the camera orbits). Bloom picks it up and
// turns it into a warm halo; the point light is a CHILD of the sphere so the
// light pool always follows this position. Color flickers gently, in step
// with the vine-bulb flicker aesthetic.
const LAMP_HEAD = [-3.52, 2.35, -3.32]

function LampGlow() {
  const mat = useRef()
  const seed = useMemo(() => Math.random() * 10, [])
  const base = useMemo(() => new THREE.Color(2.6, 1.8, 0.95), [])
  useFrame(({ clock }) => {
    if (!mat.current) return
    const f = 0.86 + 0.14 * Math.sin(clock.elapsedTime * 7 + seed)
    mat.current.color.copy(base).multiplyScalar(f)
  })
  return (
    <mesh position={LAMP_HEAD}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial ref={mat} color={base} toneMapped={false} />
      <pointLight intensity={6} distance={7} decay={2} color="#ffb459" />
    </mesh>
  )
}

// Glowing labels on the signpost boards at night. The baked boards are blank
// wood; the boards are thin panels on the log's ±X faces, so the text plane
// is parallel to that face, nudged along its normal toward the viewer.
// h = height on the post (fraction); dx/dy/dz = per-board world-space offset
// (dx 左右, dy 上下, dz 前后 — units match world coords, e.g. 0.1 ≈ 十厘米)
const BOARD_LABELS = [
  { id: 'work', label: 'MY WORK', h: 0.8, dx: 0.07, dy: 0, dz: 0 },
  { id: 'about', label: 'ABOUT', h: 0.61, dx: 0, dy: 0, dz: 0 },
  { id: 'contact', label: 'CONTACT', h: 0.41, dx: 0.03, dy: 0, dz: 0 },
]

function SignpostNightText({ bb }) {
  const night = useStore((s) => s.night)
  const group = useRef()
  // board face normal = signpost baked yaw + 90° (local +X rotated into world)
  const yaw = useMemo(() => {
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(...SIGNPOST_TF.rot), 'YXZ')
    return e.y + Math.PI / 2
  }, [])
  const dir = useMemo(() => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), [yaw])
  // HDR color pushes the glyphs past the bloom threshold (troika's material
  // deletes .color when the mesh color prop is null — set it via the prop)
  const glowColor = useMemo(() => new THREE.Color(2.1, 1.55, 0.9), [])

  useEffect(() => {
    if (!night || !group.current) return
    const mats = []
    group.current.traverse((o) => { if (o.material) mats.push(o.material) })
    mats.forEach((m) => {
      if ('toneMapped' in m) m.toneMapped = false
      m.transparent = true
      m.opacity = 0
      m.needsUpdate = true
    })
    // staggered fade-in, one board at a time
    const tl = gsap.timeline()
    mats.forEach((m, i) => tl.to(m, { opacity: 1, duration: 0.9, delay: 0.15 + i * 0.22 }, 0))
    return () => tl.kill()
  }, [night])

  if (!night) return null
  const fontSize = bb.h * 0.085
  return (
    <group ref={group}>
      {BOARD_LABELS.map(({ id, label, h, dx, dy, dz }) => (
        <Text
          key={id}
          font="/fonts/CabinSketch-Bold.ttf"
          color={glowColor}
          position={[bb.cx + dir.x * 0.45 + dx, bb.base + h * bb.h + dy, bb.cz + dir.z * 0.3 + dz]}
          rotation={[0, yaw, 0]}
          fontSize={fontSize}
          maxWidth={1.5}
          anchorX="center"
          anchorY="middle"
          outlineWidth={fontSize * 0.06}
          outlineColor="#3d2a12"
        >
          {label}
        </Text>
      ))}
    </group>
  )
}

// The three signpost boards, as fractions of the signpost's world bounding
// box (measured off the model): center height + band height. We can't hardcode
// world coords — the GLB roots carry their own baked transforms.
const BOARD_BANDS = [
  { id: 'work', h: 0.81, band: 0.09 },
  { id: 'about', h: 0.59, band: 0.09 },
  { id: 'contact', h: 0.37, band: 0.09 },
]

function SignpostBoards() {
  const { signpost } = useCottageParts()
  const [bb, setBb] = useState(null)
  const { camera, size: viewport } = useThree()
  const tmp = useRef(new THREE.Vector3())

  // Measure the signpost's world bounding box at mount (after transforms settle)
  useEffect(() => {
    if (!signpost) return
    let raf
    const measure = () => {
      const box = new THREE.Box3().setFromObject(signpost)
      if (box.isEmpty()) { raf = requestAnimationFrame(measure); return }
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      setBb({ base: box.min.y, h: size.y, cx: center.x, cz: center.z, sx: size.x, sz: size.z })
    }
    raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [signpost])

  return (
    <>
      <group position={[0, FLOOR_OFFSET, 0]}>
        {signpost && <primitive object={signpost} />}
      </group>
      {bb && <SignpostNightText bb={bb} />}
      {bb && BOARD_BANDS.map(({ id, h, band }) => (
        <SignpostHit
          key={id}
          boardId={id}
          center={[bb.cx, bb.base + h * bb.h, bb.cz]}
          size={[bb.sx * 0.95, band * 2 * bb.h, bb.sz * 0.95]}
          camera={camera}
          viewport={viewport}
          tmp={tmp}
        />
      ))}
    </>
  )
}

function SignpostHit({ boardId, center, size, camera, viewport, tmp }) {
  const setHovered = useStore((s) => s.setHovered)
  const setBoard = useStore((s) => s.setBoard)
  const setActive = useStore((s) => s.setActive)
  const isHovered = useStore((st) => st.hovered === boardId)

  // Float the "My Work / About / Contact" label over the hovered board.
  useFrame(() => {
    if (!isHovered || !labelRef.current) return
    tmp.current.set(center[0], center[1] + size[1] * 0.75, center[2])
    const v = tmp.current.project(camera)
    const el = labelRef.current
    el.style.left = `${(v.x * 0.5 + 0.5) * viewport.width}px`
    el.style.top = `${(-v.y * 0.5 + 0.5) * viewport.height}px`
  })

  return (
    <mesh
      position={center}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(boardId) }}
      onPointerOut={(e) => { e.stopPropagation(); if (useStore.getState().hovered === boardId) setHovered(null) }}
      onClick={(e) => { e.stopPropagation(); setActive('contact'); setBoard(boardId) }}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

// Moonlight through the window — always-on at night: just a soft cool point
// light near the window (no visible panel — a flat plane there reads as a
// stark rectangle against the frame, see earlier iteration).
const WINDOW_CENTER = [-3.9, 3.9, 1.2]

function WindowMoonlight() {
  return (
    <pointLight position={[WINDOW_CENTER[0] - 0.1, WINDOW_CENTER[1] + 0.3, WINDOW_CENTER[2] - 0.4]} intensity={0.6} distance={5} decay={2} color="#aebfff" />
  )
}

export function CottageFurniture() {
  const { lamp, lampMat, signpostMat } = useCottageParts()
  const setHovered = useStore((s) => s.setHovered)
  const setNight = useStore((s) => s.setNight)
  const night = useStore((s) => s.night)

  // Night mode: lamp body gets a warm glow, signpost wood a faint moonlight
  // (both are texture-modulated — see useCottageParts' emissiveMap setup).
  useEffect(() => {
    if (lampMat) lampMat.emissiveIntensity = night ? 1.1 : 0
    if (signpostMat) signpostMat.emissiveIntensity = night ? 0.4 : 0
  }, [night, lampMat, signpostMat])

  return (
    <>
      {/* Desk lamp = day/night toggle easter egg */}
      {lamp && (
        <group position={[0, FLOOR_OFFSET, 0]}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('lamp') }}
          onPointerOut={(e) => { e.stopPropagation(); if (useStore.getState().hovered === 'lamp') setHovered(null) }}
          onClick={(e) => { e.stopPropagation(); setNight(!useStore.getState().night) }}
        >
          <primitive object={lamp} />
          <HitProxy center={[-3.66, 2.15, -3.61]} size={[1.5, 1.75, 1.5]} />
        </group>
      )}

      {/* Lit bulb at the lamp shade (night only) */}
      {night && <LampGlow />}

      {/* Moonlight glow through the window (night only, always on) */}
      {night && <WindowMoonlight />}

      {/* Signpost — three clickable boards (hitboxes measured at runtime) */}
      <SignpostBoards />
    </>
  )
}
