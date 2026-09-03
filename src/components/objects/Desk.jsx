import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { woodTextures } from '../../textures'

// Desk dimensions — sturdier proportions
const DESK_W = 3.6   // width (x)
const DESK_D = 1.8   // depth (z)
const DESK_H = 0.78  // top surface height
const TOP_THICK = 0.08  // thicker desktop — visible edge
const LEG_R = 0.06      // thicker legs — 2x previous

export function Desk() {
  const wood = useMemo(() => woodTextures(), [])

  // Curved-front desk shape (subtle curve, not a giant arc)
  const deskGeo = useMemo(() => {
    const shape = new THREE.Shape()
    const w = DESK_W, d = DESK_D, cr = 0.5
    shape.moveTo(-w/2, 0)
    shape.lineTo(-w/2 + cr, 0)
    shape.quadraticCurveTo(0, -0.15, w/2 - cr, 0)
    shape.lineTo(w/2, 0)
    shape.lineTo(w/2, d)
    shape.lineTo(-w/2, d)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: TOP_THICK, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2,
    })
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, DESK_H, 0)
    return geo
  }, [])

  // Leg positions — 4 corners, inset
  const legPositions = [
    [-DESK_W/2 + 0.18, DESK_D - 0.18],
    [ DESK_W/2 - 0.18, DESK_D - 0.18],
    [-DESK_W/2 + 0.18, 0.18],
    [ DESK_W/2 - 0.18, 0.18],
  ]

  const surfaceY = DESK_H + TOP_THICK + 0.02 // desktop top incl. bevel — y of the desk surface

  return (
    // Desk sits in the middle-back of the room
    <group position={[0, 0, -0.8]}>
      {/* ===== Desktop — thick oak slab with visible beveled edge ===== */}
      <mesh geometry={deskGeo} castShadow receiveShadow>
        <meshStandardMaterial map={wood.map} roughnessMap={wood.roughnessMap} color="#9a6a3a" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Edge banding — thin darker lip around the desktop perimeter */}
      <RoundedBox radius={0.01} smoothness={2} position={[0, DESK_H + TOP_THICK / 2 - 0.01, -0.02]} castShadow>
        <boxGeometry args={[DESK_W, 0.03, 0.06]} />
        <meshStandardMaterial color="#6a4628" roughness={0.7} />
      </RoundedBox>

      {/* ===== 4 Legs — thick tapered dark wood ===== */}
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, DESK_H / 2 - 0.01, z]} castShadow>
          <cylinderGeometry args={[LEG_R * 0.75, LEG_R, DESK_H - 0.02, 8]} />
          <meshStandardMaterial color="#3a2818" roughness={0.8} />
        </mesh>
      ))}

      {/* Leg feet — brass caps for a refined detail */}
      {legPositions.map(([x, z], i) => (
        <mesh key={`cap-${i}`} position={[x, 0.03, z]} castShadow>
          <cylinderGeometry args={[LEG_R * 0.8, LEG_R * 0.85, 0.06, 8]} />
          <meshStandardMaterial color="#c9a06a" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}

      {/* ===== Stretcher bars ===== */}
      <mesh position={[-DESK_W/2 + 0.18, 0.2, DESK_D/2]} castShadow>
        <boxGeometry args={[0.04, 0.06, DESK_D - 0.36]} />
        <meshStandardMaterial color="#3a2818" roughness={0.8} />
      </mesh>
      <mesh position={[DESK_W/2 - 0.18, 0.2, DESK_D/2]} castShadow>
        <boxGeometry args={[0.04, 0.06, DESK_D - 0.36]} />
        <meshStandardMaterial color="#3a2818" roughness={0.8} />
      </mesh>

      {/* ===== Drawer/apron under desk front ===== */}
      <RoundedBox radius={0.01} smoothness={2} position={[0, DESK_H - 0.14, 0.02]} castShadow>
        <boxGeometry args={[DESK_W - 0.3, 0.16, 0.04]} />
        <meshStandardMaterial color="#3a2818" roughness={0.8} />
      </RoundedBox>
      {/* Drawer handle */}
      <mesh position={[0, DESK_H - 0.14, 0.05]}>
        <boxGeometry args={[0.3, 0.025, 0.02]} />
        <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* ===== Desk surface items ===== */}

      {/* Coaster + coffee mug — single warm-tone accessory */}
      <group position={[-1.0, surfaceY, -1.2]}>
        {/* Coaster */}
        <mesh position={[0, 0.005, 0]} receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
          <meshStandardMaterial color="#8a6240" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.14, 12]} />
          <meshStandardMaterial color="#8aa882" roughness={0.4} metalness={0.05} />
        </mesh>
        {/* Coffee surface */}
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.005, 12]} />
          <meshStandardMaterial color="#3a2418" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.09, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.035, 0.012, 8, 12, Math.PI]} />
          <meshStandardMaterial color="#8aa882" roughness={0.4} />
        </mesh>
      </group>

      {/* ===== Pen holder with pens ===== */}
      <group position={[-1.35, surfaceY, -1.3]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#c9744a" roughness={0.6} />
        </mesh>
        {/* Pens poking out */}
        {[
          { x: -0.02, z: 0.01, c: '#3a5a7a', h: 0.1, t: 0.15 },
          { x: 0.025, z: -0.015, c: '#c9544a', h: 0.11, t: -0.1 },
          { x: 0.0, z: 0.03, c: '#5a8a5a', h: 0.09, t: 0.05 },
          { x: -0.03, z: -0.02, c: '#c9a23a', h: 0.105, t: -0.2 },
        ].map((p, i) => (
          <mesh key={`pen-${i}`} position={[p.x, 0.18, p.z]} castShadow rotation={[p.t, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, p.h, 6]} />
            <meshStandardMaterial color={p.c} roughness={0.5} metalness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ===== Stack of books on the right side ===== */}
      <group position={[1.3, surfaceY, -1.3]} rotation={[0, 0.15, 0]}>
        {[
          { c: '#5a7a8a', h: 0.04, y: 0.02 },
          { c: '#c9544a', h: 0.045, y: 0.0625, r: 0.08 },
          { c: '#9a7a4a', h: 0.035, y: 0.1, r: -0.05 },
        ].map((b, i) => (
          <RoundedBox key={`book-${i}`} radius={0.008} smoothness={2} position={[0, b.y, 0]} castShadow rotation={[0, b.r || 0, 0]}>
            <boxGeometry args={[0.4, b.h, 0.28]} />
            <meshStandardMaterial color={b.c} roughness={0.75} />
          </RoundedBox>
        ))}
        {/* Book on top, slightly tilted */}
        <RoundedBox radius={0.008} smoothness={2} position={[0.02, 0.14, 0.02]} castShadow rotation={[0, 0.2, 0.04]}>
          <boxGeometry args={[0.38, 0.04, 0.26]} />
          <meshStandardMaterial color="#6a8a6a" roughness={0.75} />
        </RoundedBox>
      </group>

      {/* ===== Sticky note ===== */}
      <mesh position={[0.55, surfaceY + 0.001, -0.4]} rotation={[-Math.PI / 2, 0, 0.3]} castShadow>
        <planeGeometry args={[0.22, 0.22]} />
        <meshStandardMaterial color="#e8d870" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Lines on the sticky note */}
      {[-0.04, 0, 0.04].map((y, i) => (
        <mesh key={`note-line-${i}`} position={[0.56, surfaceY + 0.002, -0.4 + y]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[0.16, 0.004]} />
          <meshBasicMaterial color="#9a8a3a" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ===== Chair — properly built with supports ===== */}
      <group position={[0, 0, 1.6]} rotation={[0, Math.PI, 0]}>
        {/* Seat base — thick plank */}
        <RoundedBox radius={0.02} smoothness={3} position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.08, 0.8]} />
          <meshStandardMaterial color="#5b4636" roughness={0.8} />
        </RoundedBox>
        {/* Seat cushion */}
        <RoundedBox radius={0.05} smoothness={4} position={[0, 0.51, 0]} castShadow>
          <boxGeometry args={[0.72, 0.06, 0.72]} />
          <meshStandardMaterial color="#7a8a7a" roughness={0.9} />
        </RoundedBox>
        {/* Backrest — thick, with slight tilt */}
        <RoundedBox radius={0.04} smoothness={3} position={[0, 0.88, -0.34]} castShadow rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.78, 0.72, 0.1]} />
          <meshStandardMaterial color="#6b5640" roughness={0.8} />
        </RoundedBox>
        {/* Backrest cushion — thinner pad on front of backrest */}
        <RoundedBox radius={0.04} smoothness={4} position={[0, 0.88, -0.29]} castShadow rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.68, 0.6, 0.05]} />
          <meshStandardMaterial color="#7a8a7a" roughness={0.9} />
        </RoundedBox>
        {/* Vertical support posts connecting seat to backrest */}
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, 0.65, -0.32]} castShadow>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#5b4636" roughness={0.8} />
          </mesh>
        ))}
        {/* 4 Chair legs — thick square posts */}
        {[
          [-0.34, -0.34], [0.34, -0.34], [-0.34, 0.34], [0.34, 0.34],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.21, lz]} castShadow>
            <boxGeometry args={[0.06, 0.42, 0.06]} />
            <meshStandardMaterial color="#3a2f25" roughness={0.8} />
          </mesh>
        ))}
        {/* Cross stretchers */}
        <mesh position={[0, 0.1, 0.34]} castShadow>
          <boxGeometry args={[0.62, 0.04, 0.04]} />
          <meshStandardMaterial color="#3a2f25" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.1, -0.34]} castShadow>
          <boxGeometry args={[0.62, 0.04, 0.04]} />
          <meshStandardMaterial color="#3a2f25" roughness={0.8} />
        </mesh>

        {/* ===== Over-ear headphones hanging on the chair back ===== */}
        <group position={[0, 0.7, -0.42]} rotation={[0.3, 0, 0]}>
          {/* Headband — half torus */}
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.14, 0.018, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.2} />
          </mesh>
          {/* Left ear cup */}
          <mesh position={[-0.14, 0, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.075, 0.06, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Right ear cup */}
          <mesh position={[0.14, 0, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.075, 0.06, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Ear cushions — padded */}
          <mesh position={[-0.14, 0, 0.02]}>
            <torusGeometry args={[0.06, 0.018, 8, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </mesh>
          <mesh position={[0.14, 0, 0.02]}>
            <torusGeometry args={[0.06, 0.018, 8, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
