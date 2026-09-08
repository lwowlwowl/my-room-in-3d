import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, labelRef, nightBlendRef } from '../store'

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
    // The lamp mesh is exempted from CASTING: its bulb light sits inside the
    // shade, so a casting shade self-shadows and swallows its own light.
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = o !== lamp
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
      // The signpost mesh also contains its base stones and grass, so keep
      // its shared emissive tint muted and neutral at night.
      [signpostMat, '#7d8aa8'],
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
  const flickerSeeds = useMemo(() => Array.from({ length: 12 }, () => Math.random() * 10), [])
  const baseEmissive = useMemo(() => bulbMats.map((m) => m.emissiveIntensity ?? 1), [bulbMats])

  useFrame(({ clock }) => {
    if (!bulbMats.length) return
    const t = clock.elapsedTime
    const nightBoost = THREE.MathUtils.lerp(1, 2.4, nightBlendRef.current)
    for (let i = 0; i < bulbMats.length; i++) {
      const f = 0.85 + 0.15 * Math.sin(t * 7 + flickerSeeds[i % flickerSeeds.length])
      bulbMats[i].emissiveIntensity = (baseEmissive[i] || 1) * nightBoost * f
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
// DEBUG_HOTBOXES=true paints every interactive box in its own color so the
// hover regions are visible while tuning coordinates — set false to hide.
const DEBUG_HOTBOXES = false

// DEBUG_COORDS=true overlays the world coordinate system for tuning:
//   • red/green/blue arrows = world X/Y/Z axes from the origin (1 unit = 1m)
//   • ground grid, 1m cells
//   • yellow markers = this file's constants (COMPUTER_HIT etc.) — they
//     REFERENCE the constants, so editing the constant moves the marker
//   • cyan markers = Scene.jsx rig lights — they track the live object each
//     frame via `name="dbg:*"`, so editing a light's position in Scene.jsx
//     moves the marker immediately
const DEBUG_COORDS = false

// Live tracker: positions the marker on an object found by name every frame.
// Use for anything defined OUTSIDE this file (Scene.jsx lights) — no stale
// copies. Lights sit at the scene root while this marker lives inside the
// parallax-tilted world group, so under pointer tilt there is a tiny (<1°)
// offset — irrelevant for tuning.
function LiveMarker({ target, label }) {
  const g = useRef()
  const { scene } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const o = scene.getObjectByName(target)
    if (o && g.current) g.current.position.copy(o.getWorldPosition(tmp))
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#44ddff" depthTest={false} />
      </mesh>
      <Text
        fontSize={0.22}
        color="#aee7ff"
        outlineWidth={0.015}
        outlineColor="#000000"
        position={[0, 0.35, 0]}
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  )
}

function DebugCoords() {
  if (!DEBUG_COORDS) return null
  // references the CONSTANTS (not copies) — evaluated at render time, after
  // they are defined below in this module
  const landmarks = [
    ['origin (0,0,0)', [0, 0, 0]],
    ['COMPUTER_HIT', COMPUTER_HIT.center],
    ['STUMP_HIT', STUMP_HIT.center],
    ['LAMP_HEAD', LAMP_HEAD],
    ['LAMP_LIGHT', LAMP_LIGHT],
    ['WINDOW', WINDOW_CENTER],
  ]
  return (
    <group>
      {/* world axes: X red, Y green, Z blue */}
      <axesHelper args={[3]} />
      <gridHelper args={[16, 16, '#cc6644', '#445566']} position={[0, 0.03, 0]} />
      {landmarks.map(([name, pos]) => (
        <group key={name} position={pos}>
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ffdd44" depthTest={false} />
          </mesh>
          <Text
            fontSize={0.22}
            color="#ffffff"
            outlineWidth={0.015}
            outlineColor="#000000"
            position={[0, 0.35, 0]}
            anchorX="center"
            renderOrder={999}
          >
            {name}
          </Text>
        </group>
      ))}
      {/* Scene.jsx night-rig lights — tracked live by name */}
      <LiveMarker target="dbg:stumpOrb" label="stumpOrb" />
      <LiveMarker target="dbg:screenGlow" label="screenGlow" />
      <LiveMarker target="dbg:signpostSpot" label="signpostSpot" />
      <LiveMarker target="dbg:nightFill" label="nightFill" />
    </group>
  )
}

function HitProxy({ center, size, debugColor }) {
  return (
    <mesh position={[center[0], center[1] - FLOOR_OFFSET, center[2]]}>
      <boxGeometry args={size} />
      <meshBasicMaterial
        transparent
        opacity={DEBUG_HOTBOXES ? 0.4 : 0}
        color={debugColor}
        depthWrite={false}
      />
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

// The light sits just OUTSIDE the shade's opening (+Z toward the room), a
// raycast-measured ~0.3 clear of the mesh — the bulb position itself is only
// 0.07 from the shade walls, and a pointLight there gets swallowed by its own
// shade once it casts shadows (self-shadowing black patches + almost no light
// escaping to the room).
const LAMP_LIGHT = [-3.52, 2.35, -3.02]

function LampGlow() {
  const mat = useRef()
  const light = useRef()
  const seed = useMemo(() => Math.random() * 10, [])
  const base = useMemo(() => new THREE.Color(2.6, 1.8, 0.95), [])
  useFrame(({ clock }) => {
    const b = nightBlendRef.current
    if (mat.current) {
      // keep the HDR color constant and fade OPACITY with the blend —
      // scaling the color down left an opaque BLACK sphere in full day
      const f = 0.86 + 0.14 * Math.sin(clock.elapsedTime * 7 + seed)
      mat.current.color.copy(base).multiplyScalar(f)
      mat.current.opacity = b
    }
    if (light.current) light.current.intensity = 6 * b
  })
  return (
    <>
      <mesh position={LAMP_HEAD}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial ref={mat} color={base} toneMapped={false} transparent />
      </mesh>
      {/* castShadow makes furniture block the warm pool — the chair throws a
          REAL shadow pointing AWAY from the lamp at night, instead of the
          omnidirectional ContactShadows blob that reads as reversed.
          Intensity rides the night blend so the warm pool fades in/out. */}
      <pointLight
        ref={light}
        position={LAMP_LIGHT}
        distance={7}
        decay={2}
        color="#ffb459"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
        shadow-normalBias={0.02}
      />
    </>
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
  const group = useRef()
  // board face normal = signpost baked yaw + 90° (local +X rotated into world)
  const yaw = useMemo(() => {
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(...SIGNPOST_TF.rot), 'YXZ')
    return e.y + Math.PI / 2
  }, [])
  const dir = useMemo(() => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), [yaw])
  // HDR color pushes the glyphs past the bloom threshold. Each board gets its
  // own MUTABLE color instance as the prop — troika re-copies it into the
  // material every render, so mutating it per frame drives the glow.
  const GLOW = new THREE.Color(2.1, 1.55, 0.9)
  const labelColors = useMemo(() => BOARD_LABELS.map(() => new THREE.Color(2.1, 1.55, 0.9)), [])

  // Always mounted; the fade rides the night blend with a small stagger so the
  // boards still light up one at a time during the crossfade. NOTE: troika's
  // `material` GETTER returns an ARRAY [outlineMaterial, fillMaterial] when
  // outlineWidth is set — writing `.opacity` on that array touches nothing.
  // Write to the real materials (the outline material prototypally inherits
  // from the fill material, so setting the fill's props covers both). Opacity
  // alone fades too back-loaded (the HDR color keeps glyphs blooming until
  // near-zero), so the COLOR is dimmed in step — sqrt so it leads slightly.
  const textRefs = useRef([])
  useFrame(() => {
    const b = nightBlendRef.current
    if (group.current) group.current.visible = b > 0.001
    textRefs.current.forEach((t, i) => {
      if (!t || !t.material) return
      // each board starts fading a bit later: stagger window 0..0.3 of the blend
      const s = THREE.MathUtils.clamp((b - i * 0.12) / 0.7, 0, 1)
      labelColors[i].copy(GLOW).multiplyScalar(Math.sqrt(s))
      const mats = Array.isArray(t.material) ? t.material : [t.material]
      for (const m of mats) {
        if (!m) continue
        if ('toneMapped' in m) m.toneMapped = false
        m.transparent = true
        m.opacity = s
      }
    })
  })

  const fontSize = bb.h * 0.085
  return (
    <group ref={group}>
      {BOARD_LABELS.map(({ id, label, h, dx, dy, dz }, i) => (
        <Text
          key={id}
          ref={(el) => { textRefs.current[i] = el }}
          font="/fonts/CabinSketch-Bold.ttf"
          color={labelColors[i]}
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
  { id: 'work', h: 0.81, band: 0.09, debugColor: '#ffaa00' },
  { id: 'about', h: 0.59, band: 0.09, debugColor: '#aa55ff' },
  { id: 'contact', h: 0.37, band: 0.09, debugColor: '#33cc88' },
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
      {bb && BOARD_BANDS.map(({ id, h, band, debugColor }) => (
        <SignpostHit
          key={id}
          boardId={id}
          center={[bb.cx, bb.base + h * bb.h, bb.cz]}
          size={[bb.sx * 0.65, band * 2 * bb.h, bb.sz * 0.65]}
          debugColor={debugColor}
          camera={camera}
          viewport={viewport}
          tmp={tmp}
        />
      ))}
    </>
  )
}

function SignpostHit({ boardId, center, size, debugColor, camera, viewport, tmp }) {
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
      <meshBasicMaterial
        transparent
        opacity={DEBUG_HOTBOXES ? 0.4 : 0}
        color={debugColor}
        depthWrite={false}
      />
    </mesh>
  )
}

// Moonlight through the window — always-on at night: just a soft cool point
// light near the window (no visible panel — a flat plane there reads as a
// stark rectangle against the frame, see earlier iteration).
const WINDOW_CENTER = [-3.9, 3.9, 1.2]

function WindowMoonlight() {
  const light = useRef()
  useFrame(() => { if (light.current) light.current.intensity = 0.6 * nightBlendRef.current })
  return (
    <pointLight ref={light} position={[WINDOW_CENTER[0] - 0.1, WINDOW_CENTER[1] + 0.3, WINDOW_CENTER[2] - 0.4]} distance={5} decay={2} color="#aebfff" />
  )
}

// ---------------------------------------------------------------------------
// The green monitor is part of C03, the single baked desk mesh. The display
// glass itself is the plane x≈-3.86, y[1.51,2.13], z[-2.36,-1.92]. It faces
// the room along +X; the similarly sized object at z≈-4.58 is a desk prop by
// the mushroom, not the computer. Keep this proxy close to the glass bounds
// so it cannot absorb pointer events from nearby desk objects.
// ---------------------------------------------------------------------------
const COMPUTER_HIT = {
  center: [-3.86, 1.9, -1.8],
  // Local Z is depth. After the Y rotation it maps to world +X, while local X
  // maps to the display width along world Z.
  size: [1.15, 0.9, 0.6],
  rotation: [-0.02, Math.PI / 2 - 0.03, 0],
}

function ComputerScreen() {
  const setHovered = useStore((s) => s.setHovered)
  const setActive = useStore((s) => s.setActive)
  const setScreen = useStore((s) => s.setScreen)
  const isHovered = useStore((st) => st.hovered === 'computer')
  const { camera, size: viewport } = useThree()
  const meshRef = useRef()
  const tmp = useRef(new THREE.Vector3())
  const openTimer = useRef(null)

  // unmount safety: never fire the modal after the scene is gone
  useEffect(() => () => clearTimeout(openTimer.current), [])

  useFrame(() => {
    if (!isHovered || !labelRef.current || !meshRef.current) return
    // Use the proxy's live world transform so the label tracks scene parallax.
    meshRef.current.localToWorld(tmp.current.set(0, COMPUTER_HIT.size[1] / 2 + 0.2, 0))
    const v = tmp.current.project(camera)
    const el = labelRef.current
    el.style.left = `${(v.x * 0.5 + 0.5) * viewport.width}px`
    el.style.top = `${(-v.y * 0.5 + 0.5) * viewport.height}px`
  })

  return (
    <mesh
      ref={meshRef}
      position={COMPUTER_HIT.center}
      rotation={COMPUTER_HIT.rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered('computer') }}
      onPointerOut={(e) => { e.stopPropagation(); if (useStore.getState().hovered === 'computer') setHovered(null) }}
      onClick={(e) => {
        e.stopPropagation()
        setActive('computer')
        // let the 1.4s dolly+FOV zoom read first (tween is ~90% done at 1s),
        // then power the screen on
        clearTimeout(openTimer.current)
        openTimer.current = setTimeout(() => {
          if (useStore.getState().active === 'computer') setScreen(true)
        }, 1000)
      }}
    >
      <boxGeometry args={COMPUTER_HIT.size} />
      <meshBasicMaterial
        transparent
        opacity={DEBUG_HOTBOXES ? 0.45 : 0}
        color={DEBUG_HOTBOXES ? '#44aaff' : undefined}
        depthWrite={false}
      />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// The stump cabinet (C05) in the left corner — a "my collection" drawer.
// World bbox x[-3.17,0.52] y[0.07,2.87] z[-0.19,3.28], front faces +Z.
// Click dollies the camera in (focusSpots.stump), then the wooden-drawer
// modal opens — same rhythm as the computer screen.
// ---------------------------------------------------------------------------
const STUMP_HIT = {
  center: [-1.75, 1.4, 1.85],
  size: [1.8, 1.6, 2],
}

function StumpDrawer() {
  const setHovered = useStore((s) => s.setHovered)
  const setActive = useStore((s) => s.setActive)
  const setDrawer = useStore((s) => s.setDrawer)
  const { camera, size: viewport } = useThree()
  const hitRef = useRef()
  const tmp = useRef(new THREE.Vector3())
  const openTimer = useRef(null)

  useEffect(() => () => clearTimeout(openTimer.current), [])

  useFrame(() => {
    if (!hitRef.current || !labelRef.current) return
    const hovered = useStore.getState().hovered === 'stump'
    if (!hovered) return
    hitRef.current.localToWorld(tmp.current.set(0, STUMP_HIT.size[1] / 2 + 0.2, 0))
    const v = tmp.current.project(camera)
    const el = labelRef.current
    el.style.left = `${(v.x * 0.5 + 0.5) * viewport.width}px`
    el.style.top = `${(-v.y * 0.5 + 0.5) * viewport.height}px`
  })

  return (
    <>
      {/* click/hover hitbox over the stump front */}
      <mesh
        ref={hitRef}
        position={STUMP_HIT.center}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('stump') }}
        onPointerOut={(e) => { e.stopPropagation(); if (useStore.getState().hovered === 'stump') setHovered(null) }}
        onClick={(e) => {
          e.stopPropagation()
          setActive('stump')
          clearTimeout(openTimer.current)
          openTimer.current = setTimeout(() => {
            if (useStore.getState().active === 'stump') setDrawer(true)
          }, 650)
        }}
      >
        <boxGeometry args={STUMP_HIT.size} />
        <meshBasicMaterial
          transparent
          opacity={DEBUG_HOTBOXES ? 0.4 : 0}
          color={DEBUG_HOTBOXES ? '#ffdd44' : undefined}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

export function CottageFurniture() {
  const { lamp, lampMat, signpostMat } = useCottageParts()
  const setHovered = useStore((s) => s.setHovered)
  const setNight = useStore((s) => s.setNight)

  // Night mode: the lamp retains its warm glow. The signpost shares a mesh
  // with its stones and grass, so its texture-modulated fill stays subtle.
  // Both emissive intensities ride the night blend (crossfade, not a swap).
  useFrame(() => {
    const b = nightBlendRef.current
    if (lampMat) lampMat.emissiveIntensity = 1.1 * b
    if (signpostMat) signpostMat.emissiveIntensity = 0.1 * b
  })

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
          <HitProxy center={[-3.66, 2.15, -3.61]} size={[1.5, 1.75, 1.5]} debugColor="#ff4444" />
        </group>
      )}

      {/* Lit bulb at the lamp shade — always mounted, intensity rides the
          night crossfade (0 in full day) */}
      <LampGlow />

      {/* Moonlight glow through the window — same crossfade treatment */}
      <WindowMoonlight />

      {/* Signpost — three clickable boards (hitboxes measured at runtime) */}
      <SignpostBoards />

      {/* Computer on the desk — click zooms to the screen and powers it on */}
      <ComputerScreen />

      {/* Stump cabinet — click pulls out a "my collection" drawer */}
      <StumpDrawer />

      {/* World coordinate system overlay — DEBUG_COORDS (see above) */}
      <DebugCoords />
    </>
  )
}
