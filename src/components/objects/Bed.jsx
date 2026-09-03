import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { Interactive, useObjectHighlight, highlightMaterial } from '../Interactive'
import { woodTextures, fabricTextures } from '../../textures'

export function Bed() {
  const { boost } = useObjectHighlight('about')
  const wood = useMemo(() => woodTextures(), [])
  const sheet = useMemo(() => fabricTextures('#e8dcc4'), [])
  const pillowWhite = useMemo(() => fabricTextures('#f5f0e8'), [])
  const pillowCream = useMemo(() => fabricTextures('#ffe9c7'), [])
  const blanketTex = useMemo(() => fabricTextures('#c98a6a'), [])
  const throwPillowTex = useMemo(() => fabricTextures('#c9a06a'), [])
  const duvetTex = useMemo(() => fabricTextures('#d8b89a'), [])

  // Tuft button positions on each headboard panel (2 rows x 3 cols per panel)
  const tuftButtons = useMemo(() => {
    const pts = []
    for (const px of [-0.8, 0.8]) {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          pts.push([px - 0.4 + c * 0.4, 0.98 + r * 0.34, -2.15])
        }
      }
    }
    return pts
  }, [])

  return (
    <Interactive id="about" position={[-4.6, 0, -2]} labelAnchor={[0, 2.0, 0]}>
      {/* ===== Recessed plinth + feet — furniture reads as grounded, not a floating box ===== */}
      <RoundedBox radius={0.02} smoothness={2} position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.12, 4.2]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </RoundedBox>
      {[
        [-1.5, -1.9], [1.5, -1.9], [-1.5, 1.9], [1.5, 1.9],
      ].map(([x, z], i) => (
        <mesh key={`foot-${i}`} position={[x, 0.06, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.12, 8]} />
          <meshStandardMaterial color="#2a1c10" roughness={0.8} />
        </mesh>
      ))}

      {/* Bed frame — dark wood with bevels */}
      <RoundedBox radius={0.04} smoothness={3} position={[0, 0.41, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.7, 4.4]} />
        <meshStandardMaterial map={wood.map} color="#7a5230" roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {/* Frame top trim — a slightly lighter lip on the frame edge */}
      <RoundedBox radius={0.02} smoothness={3} position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[3.44, 0.06, 4.44]} />
        <meshStandardMaterial map={wood.map} color="#8a5e38" roughness={0.7} />
      </RoundedBox>

      {/* Mattress — fabric with bump */}
      <RoundedBox radius={0.08} smoothness={4} position={[0, 0.91, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.45, 4.0]} />
        <meshStandardMaterial map={sheet.map} bumpMap={sheet.bumpMap} bumpScale={0.02} roughness={0.95} color="#e0d2bc" />
      </RoundedBox>

      {/* Fitted sheet — drapes over mattress edges */}
      <RoundedBox radius={0.06} smoothness={4} position={[0, 0.88, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.15, 0.42, 4.05]} />
        <meshStandardMaterial map={sheet.map} bumpMap={sheet.bumpMap} bumpScale={0.015} color="#f0e8d8" roughness={0.95} />
      </RoundedBox>

      {/* Pillows — rounded, slightly dented tops for a "slept-in" feel */}
      <RoundedBox radius={0.15} smoothness={4} position={[-0.75, 1.18, -1.4]} castShadow rotation={[0.06, 0.02, 0.04]}>
        <boxGeometry args={[1.05, 0.25, 0.75]} />
        <meshStandardMaterial map={pillowWhite.map} bumpMap={pillowWhite.bumpMap} bumpScale={0.015} roughness={0.95} color="#f5f0e8" />
      </RoundedBox>
      <RoundedBox radius={0.14} smoothness={4} position={[0.82, 1.2, -1.35]} castShadow rotation={[0.04, -0.03, -0.02]}>
        <boxGeometry args={[0.95, 0.24, 0.7]} />
        <meshStandardMaterial map={pillowCream.map} bumpMap={pillowCream.bumpMap} bumpScale={0.015} roughness={0.95} color="#ffe9c7" />
      </RoundedBox>
      {/* Pillow crease — thin indent line across each pillow */}
      <mesh position={[-0.75, 1.31, -1.4]} rotation={[0, Math.PI / 2, 0.04]}>
        <boxGeometry args={[0.9, 0.015, 0.04]} />
        <meshStandardMaterial color="#d8cfc0" roughness={0.95} />
      </mesh>

      {/* Main blanket — covers lower 2/3 of bed */}
      <RoundedBox radius={0.05} smoothness={3} position={[0, 1.14, 0.6]} castShadow>
        <boxGeometry args={[3.1, 0.18, 2.6]} />
        <meshStandardMaterial map={blanketTex.map} bumpMap={blanketTex.bumpMap} bumpScale={0.025} color="#c98a6a" roughness={0.95} emissive="#c98a6a" emissiveIntensity={boost * 0.3} />
      </RoundedBox>

      {/* Blanket side drapes — fabric overhanging the mattress edges */}
      <RoundedBox radius={0.04} smoothness={3} position={[-1.5, 0.95, 0.6]} castShadow>
        <boxGeometry args={[0.18, 0.55, 2.6]} />
        <meshStandardMaterial map={blanketTex.map} bumpMap={blanketTex.bumpMap} bumpScale={0.02} color="#bf7f5e" roughness={0.95} />
      </RoundedBox>
      <RoundedBox radius={0.04} smoothness={3} position={[1.5, 0.95, 0.6]} castShadow>
        <boxGeometry args={[0.18, 0.55, 2.6]} />
        <meshStandardMaterial map={blanketTex.map} bumpMap={blanketTex.bumpMap} bumpScale={0.02} color="#bf7f5e" roughness={0.95} />
      </RoundedBox>
      {/* Folded blanket flap at the foot — a turned-down corner */}
      <RoundedBox radius={0.04} smoothness={3} position={[0.8, 1.2, 1.75]} castShadow rotation={[0.18, 0, 0.05]}>
        <boxGeometry args={[1.5, 0.1, 0.5]} />
        <meshStandardMaterial map={duvetTex.map} bumpMap={duvetTex.bumpMap} bumpScale={0.02} color="#d8b89a" roughness={0.95} />
      </RoundedBox>

      {/* Folded quilt at foot of bed */}
      <RoundedBox radius={0.04} smoothness={3} position={[0, 1.18, 1.7]} castShadow>
        <boxGeometry args={[3.0, 0.12, 0.5]} />
        <meshStandardMaterial map={duvetTex.map} bumpMap={duvetTex.bumpMap} bumpScale={0.02} color="#d8b89a" roughness={0.95} />
      </RoundedBox>

      {/* Decorative throw pillow — warm terracotta */}
      <RoundedBox radius={0.1} smoothness={4} position={[0.2, 1.31, -0.9]} castShadow rotation={[0, 0.3, 0.1]}>
        <boxGeometry args={[0.5, 0.22, 0.45]} />
        <meshStandardMaterial map={throwPillowTex.map} bumpMap={throwPillowTex.bumpMap} bumpScale={0.015} color="#c9a06a" roughness={0.95} />
      </RoundedBox>

      {/* ===== Headboard — upholstered with tufted buttons ===== */}
      <RoundedBox radius={0.04} smoothness={3} position={[0, 1.21, -2.25]} castShadow>
        <boxGeometry args={[3.4, 0.8, 0.18]} />
        <meshStandardMaterial map={wood.map} color="#8a5e38" roughness={0.75} />
      </RoundedBox>
      {/* Upholstered panel — padded fabric over the headboard face */}
      <RoundedBox radius={0.12} smoothness={4} position={[0, 1.21, -2.16]} castShadow>
        <boxGeometry args={[3.1, 0.6, 0.08]} />
        <meshStandardMaterial map={duvetTex.map} bumpMap={duvetTex.bumpMap} bumpScale={0.02} color="#c9a878" roughness={0.95} />
      </RoundedBox>
      {/* Tuft buttons — small spheres pressed into the upholstery */}
      {tuftButtons.map((p, i) => (
        <mesh key={`tuft-${i}`} position={p} castShadow>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#a88860" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      {/* Headboard side wings — wrap slightly forward for a wingback silhouette */}
      <RoundedBox radius={0.08} smoothness={3} position={[-1.6, 1.3, -2.05]} castShadow rotation={[0, 0, -0.04]}>
        <boxGeometry args={[0.2, 0.7, 0.4]} />
        <meshStandardMaterial map={duvetTex.map} color="#b89868" roughness={0.95} />
      </RoundedBox>
      <RoundedBox radius={0.08} smoothness={3} position={[1.6, 1.3, -2.05]} castShadow rotation={[0, 0, 0.04]}>
        <boxGeometry args={[0.2, 0.7, 0.4]} />
        <meshStandardMaterial map={duvetTex.map} color="#b89868" roughness={0.95} />
      </RoundedBox>

      {/* ===== Bedside table ===== */}
      <RoundedBox radius={0.03} smoothness={3} position={[2.1, 0.5, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshStandardMaterial map={wood.map} color="#7a5230" roughness={0.7} />
      </RoundedBox>
      {/* Toe-kick recess under the nightstand */}
      <RoundedBox radius={0.02} smoothness={2} position={[2.1, 0.06, -1.6]}>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </RoundedBox>
      {/* Drawer handle */}
      <mesh position={[2.1, 0.62, -1.09]}>
        <boxGeometry args={[0.4, 0.04, 0.03]} />
        <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Drawer line */}
      <mesh position={[2.1, 0.5, -1.005]}>
        <boxGeometry args={[0.86, 0.005, 0.01]} />
        <meshStandardMaterial color="#3a2818" roughness={0.8} />
      </mesh>

      {/* ===== Small lamp on bedside table — upgraded with proper shade ===== */}
      <group position={[2.1, 1.05, -1.6]}>
        {/* Base — stepped */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.04, 16]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
          <meshStandardMaterial color="#5a4038" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Lampshade — truncated cone, open bottom */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.1, 0.2, 16, 1, true]} />
          <meshStandardMaterial color="#e8caa0" roughness={0.5} metalness={0.05} emissive="#ffd28a" emissiveIntensity={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* Bulb glow inside shade */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color="#fff0c0" toneMapped={false} />
        </mesh>
        {/* Small finial on top */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.3} />
        </mesh>
        <pointLight position={[0, 0.22, 0]} intensity={0.4} color="#ffd28a" distance={2.5} decay={2} />
      </group>

      {/* ===== Book lying on the nightstand ===== */}
      <group position={[2.45, 1.015, -1.85]} rotation={[0, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.03, 0.22]} />
          <meshStandardMaterial color="#5a7a8a" roughness={0.7} />
        </mesh>
        {/* Pages */}
        <mesh position={[0, 0.002, 0]}>
          <boxGeometry args={[0.3, 0.025, 0.2]} />
          <meshStandardMaterial color="#f0e8d4" roughness={0.9} />
        </mesh>
      </group>

      {/* ===== Reading glasses ===== */}
      <group position={[1.75, 1.02, -1.4]} rotation={[0, 0.2, 0]}>
        {[-0.06, 0.06].map((x, i) => (
          <mesh key={`lens-${i}`} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.008, 8, 16]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        {/* Bridge */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.04, 6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Temple arms */}
        {[-0.105, 0.105].map((x, i) => (
          <mesh key={`arm-${i}`} position={[x, -0.01, 0.04]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.12, 6]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ===== Phone charging — glowing screen adds life (clear of the lamp base) ===== */}
      <group position={[2.35, 1.005, -1.15]} rotation={[0, -0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.015, 0.32]} />
          <meshStandardMaterial color="#1a1a1c" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <planeGeometry args={[0.14, 0.28]} />
          <meshBasicMaterial color="#2a3a4a" toneMapped={false} />
        </mesh>
        {/* Charging cable curving to the nightstand edge */}
        <mesh position={[0.1, -0.005, 0.18]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.01, 0.18, 0.01]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
        </mesh>
      </group>

      {/* Small plant sitting ON the headboard top (headboard top = y 1.61) */}
      <mesh position={[-1.2, 1.75, -2.26]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.28, 8]} />
        <meshStandardMaterial color="#b9744a" roughness={0.8} />
      </mesh>
      <mesh position={[-1.2, 2.02, -2.26]} castShadow>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#6fae5a" roughness={1} flatShading />
      </mesh>
      <mesh position={[-1.05, 2.17, -2.34]} castShadow>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#7ab85a" roughness={1} flatShading />
      </mesh>
    </Interactive>
  )
}
