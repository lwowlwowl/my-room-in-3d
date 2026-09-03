import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { woodTextures, wallTexture, rugTexture } from '../textures'

export function Room() {
  const wood = useMemo(() => woodTextures(), [])
  const darkWood = useMemo(() => {
    // reuse wood map for floor, darkened via material color
    return wood
  }, [wood])
  const wall = useMemo(() => wallTexture(), [])
  const rug = useMemo(() => rugTexture('#c97f5b'), [])

  return (
    <group>
      {/* ===== Floor: warm oak wood with grain ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={wood.map} roughnessMap={wood.roughnessMap} roughness={0.8} metalness={0.04} color="#b5854f" />
      </mesh>

      {/* ===== Back wall (textured plaster) ===== */}
      <mesh position={[0, 3, -5.5]} receiveShadow>
        <boxGeometry args={[14, 6, 0.3]} />
        <meshStandardMaterial map={wall} color="#efe5d4" roughness={1} metalness={0} />
      </mesh>

      {/* ===== Left wall ===== */}
      <mesh position={[-6.85, 3, -1]} receiveShadow>
        <boxGeometry args={[0.3, 6, 9]} />
        <meshStandardMaterial map={wall} color="#e7dcc8" roughness={1} />
      </mesh>

      {/* ===== Right wall — SPLIT to create window opening ===== */}
      {/* Window sits at z≈-3.6, frame width ≈1.8, so gap from z≈-4.5 to z≈-2.7 */}
      {/* Back segment (behind the window) */}
      <mesh position={[6.85, 3, -5.0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 1.0]} />
        <meshStandardMaterial map={wall} color="#e7dcc8" roughness={1} />
      </mesh>
      {/* Front segment — extends ALL the way to front opening (z=2.5) */}
      <mesh position={[6.85, 3, -0.1]} receiveShadow>
        <boxGeometry args={[0.3, 6, 5.2]} />
        <meshStandardMaterial map={wall} color="#e7dcc8" roughness={1} />
      </mesh>
      {/* Lintel above window gap (z=-4.5 to z=-2.7, top portion) */}
      <mesh position={[6.85, 5.5, -3.6]} receiveShadow>
        <boxGeometry args={[0.3, 1.0, 1.8]} />
        <meshStandardMaterial map={wall} color="#e0d4bc" roughness={1} />
      </mesh>
      {/* Sill below window gap */}
      <mesh position={[6.85, 0.3, -3.6]} receiveShadow>
        <boxGeometry args={[0.3, 0.6, 1.8]} />
        <meshStandardMaterial color="#d4c8b0" roughness={1} />
      </mesh>

      {/* ===== Ceiling — thick slab with plaster texture, visible edge profile ===== */}
      {/* Main ceiling body — thick enough to see edge from below */}
      <mesh position={[0, 5.9, -1]} receiveShadow>
        <boxGeometry args={[14, 0.4, 11]} />
        <meshStandardMaterial map={wall} color="#e8ddc6" roughness={1} metalness={0} />
      </mesh>
      {/* Ceiling crown moulding — thin decorative trim where wall meets ceiling (back wall) */}
      <mesh position={[0, 5.7, -5.35]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.12, 0.15]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.9} />
      </mesh>
      {/* Ceiling crown moulding — left wall */}
      <mesh position={[-6.78, 5.7, -1]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.12, 11]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.9} />
      </mesh>
      {/* Ceiling crown moulding — right wall */}
      <mesh position={[6.78, 5.7, -1]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.12, 11]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.9} />
      </mesh>

      {/* ===== Front opening lintel beam — structural, closes the gap above the door ===== */}
      {/* This replaces the "black hole" — a proper beam spanning the front opening */}
      <RoundedBox radius={0.03} smoothness={3} position={[0, 5.5, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[13.6, 0.8, 0.3]} />
        <meshStandardMaterial map={wall} color="#e0d4bc" roughness={1} />
      </RoundedBox>

      {/* ===== Baseboards (warm wood) ===== */}
      {/* back */}
      <mesh position={[0, 0.12, -5.32]}>
        <boxGeometry args={[14, 0.24, 0.06]} />
        <meshStandardMaterial color="#9a6a3e" roughness={0.6} />
      </mesh>
      {/* left */}
      <mesh position={[-6.69, 0.12, -1]}>
        <boxGeometry args={[0.06, 0.24, 9]} />
        <meshStandardMaterial color="#9a6a3e" roughness={0.6} />
      </mesh>

      {/* ===== Front opening — open but framed for depth ===== */}
      {/* Left door jamb */}
      <RoundedBox radius={0.03} smoothness={3} position={[-6.75, 3, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 5.2, 0.3]} />
        <meshStandardMaterial map={wall} color="#e2d5c0" roughness={1} />
      </RoundedBox>
      {/* Right door jamb */}
      <RoundedBox radius={0.03} smoothness={3} position={[6.75, 3, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 5.2, 0.3]} />
        <meshStandardMaterial map={wall} color="#e2d5c0" roughness={1} />
      </RoundedBox>

      {/* ===== Wall art — framed pictures on back wall ===== */}
      {/* Large frame, center-back */}
      <group position={[2.5, 3.2, -5.3]}>
        <RoundedBox radius={0.02} smoothness={3} castShadow receiveShadow>
          <boxGeometry args={[1.4, 1.0, 0.06]} />
          <meshStandardMaterial color="#8a6240" roughness={0.6} />
        </RoundedBox>
        {/* "canvas" */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#d4c4a8" roughness={0.9} />
        </mesh>
        {/* abstract shapes on canvas — warm morandi tones */}
        <mesh position={[-0.2, 0.1, 0.045]}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color="#c9885a" toneMapped={false} />
        </mesh>
        <mesh position={[0.25, -0.1, 0.045]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshBasicMaterial color="#7a9a78" toneMapped={false} />
        </mesh>
      </group>

      {/* Smaller frame, left of center */}
      <group position={[-0.5, 3.5, -5.3]}>
        <RoundedBox radius={0.02} smoothness={3} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshStandardMaterial color="#9a6a3e" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[0.65, 0.45]} />
          <meshStandardMaterial color="#c8b898" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0.04]}>
          <planeGeometry args={[0.3, 0.2]} />
          <meshBasicMaterial color="#a8c4d8" toneMapped={false} />
        </mesh>
      </group>

      {/* ===== Pendant lamp hanging from ceiling — warm accent ===== */}
      <group position={[0, 5.5, 0.5]}>
        {/* Cord */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
          <meshStandardMaterial color="#3a2f25" roughness={0.8} />
        </mesh>
        {/* Shade — dome shape */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
          <meshStandardMaterial color="#e8b86d" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} emissive="#ffd28a" emissiveIntensity={0.15} />
        </mesh>
        {/* Bulb glow */}
        <pointLight position={[0, -0.15, 0]} intensity={0.3} color="#ffd28a" distance={3} decay={2} />
        {/* Small bulb sphere */}
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#fff0c0" toneMapped={false} />
        </mesh>
      </group>

      {/* ===== Floor plant — near front-left corner, with breathing room ===== */}
      <group position={[-5.8, 0, 1.5]}>
        {/* Pot */}
        <RoundedBox radius={0.04} smoothness={3} position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#b9744a" roughness={0.8} />
        </RoundedBox>
        {/* Soil top */}
        <mesh position={[0, 0.61, 0]}>
          <boxGeometry args={[0.52, 0.02, 0.52]} />
          <meshStandardMaterial color="#4a3a28" roughness={1} />
        </mesh>
        {/* Foliage — layered icosahedrons for low-poly plant */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <icosahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#5a8e3a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0.15, 1.25, 0.05]} castShadow>
          <icosahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#6aa84a" roughness={1} flatShading />
        </mesh>
        <mesh position={[-0.12, 1.2, -0.08]} castShadow>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color="#5a9a42" roughness={1} flatShading />
        </mesh>
        <mesh position={[0.05, 1.45, 0.02]} castShadow>
          <icosahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#6ab84a" roughness={1} flatShading />
        </mesh>
      </group>

      {/* ===== Wall shelf with small items — adds mid-ground detail ===== */}
      <group position={[-3.5, 2.8, -5.3]}>
        {/* Shelf bracket */}
        <RoundedBox radius={0.01} smoothness={2} castShadow position={[0, 0, 0.05]}>
          <boxGeometry args={[1.2, 0.06, 0.2]} />
          <meshStandardMaterial color="#8a6240" roughness={0.6} />
        </RoundedBox>
        {/* Small books */}
        {[
          { x: -0.4, c: '#c9544a', h: 0.3 },
          { x: -0.25, c: '#5a8fa0', h: 0.25 },
          { x: -0.1, c: '#c9a23a', h: 0.28 },
        ].map((b, i) => (
          <RoundedBox key={i} radius={0.01} smoothness={2} position={[b.x, b.h / 2 + 0.03, 0.08]} castShadow>
            <boxGeometry args={[0.12, b.h, 0.15]} />
            <meshStandardMaterial color={b.c} roughness={0.75} />
          </RoundedBox>
        ))}
        {/* Small decorative object */}
        <mesh position={[0.2, 0.18, 0.08]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
          <meshStandardMaterial color="#9a7a5a" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* ===== Rug under the desk — solid woven, no texture map artifacts ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.5]} receiveShadow>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#b8704a" roughness={0.95} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -0.5]} receiveShadow>
        <ringGeometry args={[2.0, 2.25, 48]} />
        <meshStandardMaterial color="#c98860" roughness={0.95} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, -0.5]} receiveShadow>
        <ringGeometry args={[1.35, 1.5, 48]} />
        <meshStandardMaterial color="#a86038" roughness={0.95} metalness={0} />
      </mesh>

      {/* ===== Wall clock — back wall, warm wood frame ===== */}
      <group position={[-2.5, 4.2, -5.3]}>
        {/* Outer frame — cylinder axis along z so the disc faces the room */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 24]} />
          <meshStandardMaterial color="#8a6240" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Clock face */}
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial color="#f0e8d8" roughness={0.9} />
        </mesh>
        {/* Hour marks */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const angle = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0.035]}>
              <boxGeometry args={[0.02, 0.04, 0.01]} />
              <meshStandardMaterial color="#3a2f25" />
            </mesh>
          )
        })}
        {/* Hour hand */}
        <mesh position={[0, 0.05, 0.04]}>
          <boxGeometry args={[0.02, 0.1, 0.005]} />
          <meshStandardMaterial color="#3a2f25" />
        </mesh>
        {/* Minute hand */}
        <mesh position={[0.05, 0.03, 0.045]}>
          <boxGeometry args={[0.015, 0.15, 0.005]} />
          <meshStandardMaterial color="#5a4030" />
        </mesh>
        {/* Center pin */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
          <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* ===== Electrical outlet plates — near baseboards ===== */}
      {/* Back wall outlet */}
      <mesh position={[3.5, 0.3, -5.32]}>
        <boxGeometry args={[0.12, 0.18, 0.01]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.9} />
      </mesh>
      {/* Left wall outlet */}
      <mesh position={[-6.68, 0.3, 0.5]}>
        <boxGeometry args={[0.01, 0.18, 0.12]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.9} />
      </mesh>

      {/* ===== Entrance area — shoes + welcome mat ===== */}
      {/* Welcome mat — flat, textured, at the front opening */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 2.3]} receiveShadow>
        <planeGeometry args={[3.0, 0.6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2.3]} receiveShadow>
        <planeGeometry args={[2.8, 0.45]} />
        <meshStandardMaterial color="#9a7a5a" roughness={0.95} />
      </mesh>

      {/* Sneakers — pair near the entrance, left side */}
      <group position={[-5.0, 0, 2.0]} rotation={[0, 0.4, 0]}>
        {/* Left shoe */}
        <RoundedBox radius={0.05} smoothness={3} position={[-0.12, 0.06, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.4]} />
          <meshStandardMaterial color="#4a5a6a" roughness={0.8} />
        </RoundedBox>
        <RoundedBox radius={0.04} smoothness={3} position={[-0.12, 0.14, -0.12]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.15]} />
          <meshStandardMaterial color="#3a4a5a" roughness={0.7} />
        </RoundedBox>
        {/* Right shoe */}
        <RoundedBox radius={0.05} smoothness={3} position={[0.15, 0.06, 0.05]} castShadow rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.4]} />
          <meshStandardMaterial color="#4a5a6a" roughness={0.8} />
        </RoundedBox>
        <RoundedBox radius={0.04} smoothness={3} position={[0.15, 0.14, -0.07]} castShadow rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.16, 0.08, 0.15]} />
          <meshStandardMaterial color="#3a4a5a" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* ===== Wall shelf with books — on left wall ===== */}
      <group position={[-6.68, 2.0, -3.5]}>
        <RoundedBox radius={0.01} smoothness={2} castShadow position={[0, 0, 0.08]}>
          <boxGeometry args={[0.04, 0.05, 1.0]} />
          <meshStandardMaterial color="#8a6240" roughness={0.6} />
        </RoundedBox>
        {/* Books standing on the shelf */}
        {[
          { z: -0.35, c: '#5a8fa0', h: 0.28 },
          { z: -0.2, c: '#c9885a', h: 0.24 },
          { z: -0.05, c: '#6fae5a', h: 0.26 },
          { z: 0.1, c: '#a8788a', h: 0.22 },
          { z: 0.25, c: '#c9a23a', h: 0.25 },
        ].map((b, i) => (
          <RoundedBox key={i} radius={0.01} smoothness={2} position={[0.02, b.h / 2 + 0.03, b.z]} castShadow>
            <boxGeometry args={[0.12, b.h, 0.1]} />
            <meshStandardMaterial color={b.c} roughness={0.75} />
          </RoundedBox>
        ))}
      </group>

      {/* ===== Picture frame on left wall — adds life to empty wall ===== */}
      <group position={[-6.68, 3.5, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox radius={0.02} smoothness={3} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial color="#9a6a3e" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.5, 0.7]} />
          <meshStandardMaterial color="#d4c4a8" roughness={0.9} />
        </mesh>
        {/* Abstract landscape — simple shapes */}
        <mesh position={[0, 0.15, 0.035]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#a8c8d8" toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.1, 0.035]}>
          <planeGeometry args={[0.4, 0.25]} />
          <meshBasicMaterial color="#8aa878" toneMapped={false} />
        </mesh>
        <mesh position={[-0.1, 0.2, 0.036]}>
          <circleGeometry args={[0.06, 12]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
      </group>

      {/* ===== Wall coat hooks near the entrance — lived-in detail ===== */}
      <group position={[-6.65, 3.0, 1.6]} rotation={[0, Math.PI / 2, 0]}>
        {/* Backboard strip */}
        <RoundedBox radius={0.02} smoothness={2} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.28, 0.04]} />
          <meshStandardMaterial color="#8a6240" roughness={0.6} />
        </RoundedBox>
        {/* 3 pegs */}
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh key={`peg-${i}`} position={[x, 0.05, 0.06]} castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
            <meshStandardMaterial color="#c9a06a" metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
        {/* Hanging jacket on center peg */}
        <group position={[0, -0.55, 0.05]}>
          {/* Shoulders */}
          <RoundedBox radius={0.06} smoothness={3} position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.45, 0.16, 0.1]} />
            <meshStandardMaterial color="#6a5a4a" roughness={0.85} />
          </RoundedBox>
          {/* Body panels */}
          <RoundedBox radius={0.04} smoothness={3} position={[-0.09, -0.2, 0]} castShadow rotation={[0, 0, 0.03]}>
            <boxGeometry args={[0.16, 0.55, 0.06]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.85} />
          </RoundedBox>
          <RoundedBox radius={0.04} smoothness={3} position={[0.09, -0.2, 0]} castShadow rotation={[0, 0, -0.03]}>
            <boxGeometry args={[0.16, 0.55, 0.06]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.85} />
          </RoundedBox>
          {/* Sleeve */}
          <RoundedBox radius={0.04} smoothness={3} position={[-0.2, -0.05, 0]} castShadow rotation={[0, 0, 0.18]}>
            <boxGeometry args={[0.09, 0.4, 0.06]} />
            <meshStandardMaterial color="#6a5a4a" roughness={0.85} />
          </RoundedBox>
          {/* Collar */}
          <mesh position={[0, 0.42, 0.04]} castShadow>
            <boxGeometry args={[0.2, 0.06, 0.04]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
          </mesh>
        </group>
        {/* Hat on left peg */}
        <group position={[-0.4, 0.0, 0.08]}>
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 16]} />
            <meshStandardMaterial color="#5a4636" roughness={0.8} />
          </mesh>
          {/* Brim */}
          <mesh position={[0, -0.01, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.015, 16]} />
            <meshStandardMaterial color="#4a3626" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ===== Floor pouf / cushion — extra seating, warms the rug ===== */}
      <group position={[1.6, 0, 1.4]}>
        {/* Base — pouf cylinder */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.32, 0.36, 0.36, 20]} />
          <meshStandardMaterial color="#b87a5a" roughness={0.9} />
        </mesh>
        {/* Tufted top cushion */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.06, 20]} />
          <meshStandardMaterial color="#c98a6a" roughness={0.9} />
        </mesh>
        {/* Tuft buttons */}
        {[
          [0, 0], [0.12, 0], [-0.12, 0], [0, 0.12], [0, -0.12],
        ].map(([x, z], i) => (
          <mesh key={`pouf-tuft-${i}`} position={[x, 0.41, z]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color="#8a5a3a" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ===== Small trash bin near the desk ===== */}
      <group position={[2.0, 0, 0.8]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.13, 0.5, 12]} />
          <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <torusGeometry args={[0.16, 0.015, 8, 16]} />
          <meshStandardMaterial color="#5a4a40" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Crumpled paper peeking out */}
        <mesh position={[0.04, 0.48, 0.02]} castShadow rotation={[0.2, 0.3, 0.15]}>
          <icosahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#e8dcc0" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  )
}
