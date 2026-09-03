import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, labelRef } from '../store'

// ---------------------------------------------------------------------------
// Cottagecore diorama — imported from blender/test1.blend (user's layout).
// One compressed GLB (Draco + WebP) holds ALL furniture. Everything renders
// as plain scenery EXCEPT:
//   • the signpost — its three boards (MY WORK / ABOUT / CONTACT) are each
//     clickable and open a forest-themed modal (see ForestModal.jsx)
//   • the desk lamp — day/night toggle easter egg
//
// Blender is Z-up, glTF is Y-up: blender (x, y, z) → three (x, z, -y).
// Floor top was z=3.16 in blender → y=3.16 here → shifted down so floor = 0.
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
    _parts = { shell, lamp, signpost, bulbMats }
    // defensive: restore the signpost's baked transform
    if (signpost) {
      signpost.position.set(...SIGNPOST_TF.pos)
      signpost.quaternion.set(...SIGNPOST_TF.rot)
      signpost.scale.setScalar(SIGNPOST_TF.scale)
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

export function CottageFurniture() {
  const { lamp } = useCottageParts()
  const setHovered = useStore((s) => s.setHovered)
  const setNight = useStore((s) => s.setNight)

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
          <HitProxy center={[-2.6, 2.9, 2.2]} size={[1.5, 1.7, 1.5]} />
        </group>
      )}

      {/* Signpost — three clickable boards (hitboxes measured at runtime) */}
      <SignpostBoards />
    </>
  )
}
