import { useRef, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useStore, labelRef } from '../store'
import { content } from '../content'

// Wraps a group of meshes: handles pointer hover/click + label tracking.
// Each object component reads its own hovered/active state from the store
// (see useObjectHighlight below) so highlight state flows to materials
// without a context provider.
//
// props:
//   id          — content key (e.g. 'projects')
//   position    — group position
//   labelAnchor — [x,y,z] offset (group local space) where the label floats
export function Interactive({ id, position = [0, 0, 0], labelAnchor = [0, 1.2, 0], children }) {
  const groupRef = useRef()
  const { camera, size } = useThree()
  const isHovered = useStore((s) => s.hovered === id)
  const setHovered = useStore((s) => s.setHovered)
  const setActive = useStore((s) => s.setActive)

  const worldPos = useRef(new THREE.Vector3())
  const tmp = useRef(new THREE.Vector3())

  // Hover lift — the group gently rises and swells (lightweight take on the
  // HoverTransform pattern from 3d-room-portfolio: one tween per group,
  // not one per mesh). overwrite:'auto' kills the opposing tween cleanly.
  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    gsap.to(g.position, {
      y: position[1] + (isHovered ? 0.03 : 0),
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    const s = isHovered ? 1.02 : 1
    gsap.to(g.scale, { x: s, y: s, z: s, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
  }, [isHovered, position])

  // Write label screen position directly to the DOM node — no state churn.
  useFrame(() => {
    if (!isHovered || !groupRef.current || !labelRef.current) return
    groupRef.current.localToWorld(tmp.current.set(labelAnchor[0], labelAnchor[1], labelAnchor[2]))
    const v = worldPos.current.copy(tmp.current).project(camera)
    const x = (v.x * 0.5 + 0.5) * size.width
    const y = (-v.y * 0.5 + 0.5) * size.height
    const el = labelRef.current
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  })

  const onOver = useCallback(
    (e) => {
      e.stopPropagation()
      setHovered(id)
    },
    [id, setHovered]
  )
  const onOut = useCallback(
    (e) => {
      e.stopPropagation()
      if (useStore.getState().hovered === id) setHovered(null)
    },
    [id, setHovered]
  )
  const onClick = useCallback(
    (e) => {
      e.stopPropagation()
      setActive(id)
    },
    [id, setActive]
  )

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      {children}
    </group>
  )
}

// Hook: each object subscribes to ITS OWN hover/active state only,
// so only the two objects involved in a hover change re-render.
// Returns { isHovered, isActive, boost } where boost is an emissive amount.
export function useObjectHighlight(id, { hover = 0.25, active = 0.4 } = {}) {
  const isHovered = useStore((s) => s.hovered === id)
  const isActive = useStore((s) => s.active === id)
  const boost = isActive ? active : isHovered ? hover : 0
  return { isHovered, isActive, boost }
}

// Convenience: material props with an emissive boost baked in.
export function highlightMaterial(baseColor, boost, { roughness = 0.85, metalness = 0 } = {}) {
  return {
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: boost,
    roughness,
    metalness,
  }
}
