import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { Interactive, useObjectHighlight, highlightMaterial } from '../Interactive'
import { woodTextures } from '../../textures'

export function Wardrobe() {
  const { boost } = useObjectHighlight('skills', { hover: 0.22, active: 0.35 })
  const wood = useMemo(() => woodTextures(), [])

  // Door positions
  const doorX = [-0.45, 0.45]

  return (
    <Interactive id="skills" position={[4.4, 0, -1.5]} labelAnchor={[0, 3.4, 0]}>
      {/* ===== Recessed plinth / toe-kick base ===== */}
      <RoundedBox radius={0.02} smoothness={2} position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.16, 1.3]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </RoundedBox>
      {/* Feet — small brass caps */}
      {[
        [-0.75, -0.55], [0.75, -0.55], [-0.75, 0.55], [0.75, 0.55],
      ].map(([x, z], i) => (
        <mesh key={`foot-${i}`} position={[x, 0.04, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.08, 8]} />
          <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}

      {/* Wardrobe body — dark frame */}
      <RoundedBox radius={0.03} smoothness={3} position={[0, 1.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 3.32, 1.4]} />
        <meshStandardMaterial map={wood.map} color="#8a5a34" roughness={0.75} metalness={0.04} emissive="#8a5a34" emissiveIntensity={boost} />
      </RoundedBox>

      {/* ===== Door panels with raised inset molding ===== */}
      {doorX.map((x, i) => (
        <group key={`door-${i}`} position={[x, 1.73, 0.71]}>
          {/* Door slab */}
          <RoundedBox radius={0.02} smoothness={3} castShadow>
            <boxGeometry args={[0.72, 3.1, 0.04]} />
            <meshStandardMaterial map={wood.map} color="#a06a42" roughness={0.7} emissive="#a06a42" emissiveIntensity={boost} />
          </RoundedBox>
          {/* Raised panel — inset rectangle with beveled frame */}
          {/* Outer frame border (darker) */}
          <mesh position={[0, 0.05, 0.025]}>
            <boxGeometry args={[0.6, 2.4, 0.01]} />
            <meshStandardMaterial color="#7a4a28" roughness={0.75} />
          </mesh>
          {/* Inner raised panel */}
          <RoundedBox radius={0.015} smoothness={2} position={[0, 0.05, 0.03]} castShadow>
            <boxGeometry args={[0.54, 2.3, 0.025]} />
            <meshStandardMaterial map={wood.map} color="#b07a52" roughness={0.65} />
          </RoundedBox>
          {/* Decorative molding trim — thin border lines */}
          <mesh position={[0, 0.05, 0.04]}>
            <boxGeometry args={[0.58, 0.02, 0.01]} />
            <meshStandardMaterial color="#6a3a1c" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, 0.04]}>
            <boxGeometry args={[0.58, 0.02, 0.01]} />
            <meshStandardMaterial color="#6a3a1c" roughness={0.8} />
          </mesh>
          <mesh position={[0, -1.15, 0.04]}>
            <boxGeometry args={[0.58, 0.02, 0.01]} />
            <meshStandardMaterial color="#6a3a1c" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Door split line */}
      <mesh position={[0, 1.73, 0.72]}>
        <boxGeometry args={[0.02, 3.05, 0.01]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.8} />
      </mesh>

      {/* ===== Handles — elegant bar pulls with brass finish ===== */}
      {doorX.map((x, i) => (
        <group key={`handle-${i}`} position={[x > 0 ? 0.12 : -0.12, 1.78, 0.75]}>
          {/* Bar */}
          <mesh position={[0, 0, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.28, 10]} />
            <meshStandardMaterial color="#d9b06a" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Mounting posts */}
          {[0.14, -0.14].map((y, j) => (
            <mesh key={`post-${j}`} position={[0, y, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.04, 8]} />
              <meshStandardMaterial color="#c9a05a" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Top crown moulding — stepped */}
      <RoundedBox radius={0.04} smoothness={3} position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[2.0, 0.18, 1.6]} />
        <meshStandardMaterial map={wood.map} color="#6a4628" roughness={0.75} />
      </RoundedBox>
      {/* Crown lip — slightly wider top step */}
      <RoundedBox radius={0.03} smoothness={3} position={[0, 3.56, 0]} castShadow>
        <boxGeometry args={[1.92, 0.06, 1.52]} />
        <meshStandardMaterial color="#5a3a1c" roughness={0.75} />
      </RoundedBox>

      {/* Small potted plant on wardrobe top */}
      <group position={[0.3, 3.62, 0.2]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.16, 8]} />
          <meshStandardMaterial color="#b9744a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.24, 0]} castShadow>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#5a8e3a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0.05, 0.3, 0.02]} castShadow>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#6aa84a" roughness={1} flatShading />
        </mesh>
      </group>
      {/* Stack of folded blankets/storage box on top, other side */}
      <RoundedBox radius={0.04} smoothness={3} position={[-0.4, 3.68, 0.1]} castShadow>
        <boxGeometry args={[0.7, 0.2, 0.5]} />
        <meshStandardMaterial map={wood.map} color="#a87850" roughness={0.9} />
      </RoundedBox>

      {/* ===== Coat hook on the left side + hanging jacket ===== */}
      <group position={[-0.91, 2.2, 0.3]}>
        {/* Hook */}
        <mesh castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
          <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#c9a06a" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* Hanging jacket — draped */}
        <group position={[0, -0.45, 0]}>
          {/* Shoulders / collar */}
          <RoundedBox radius={0.08} smoothness={3} position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.5, 0.2, 0.12]} />
            <meshStandardMaterial color="#4a5a6a" roughness={0.85} />
          </RoundedBox>
          {/* Body — two panels falling */}
          <RoundedBox radius={0.04} smoothness={3} position={[-0.1, -0.35, 0]} castShadow rotation={[0, 0, 0.04]}>
            <boxGeometry args={[0.18, 0.7, 0.06]} />
            <meshStandardMaterial color="#445262" roughness={0.85} />
          </RoundedBox>
          <RoundedBox radius={0.04} smoothness={3} position={[0.1, -0.35, 0]} castShadow rotation={[0, 0, -0.04]}>
            <boxGeometry args={[0.18, 0.7, 0.06]} />
            <meshStandardMaterial color="#445262" roughness={0.85} />
          </RoundedBox>
          {/* Sleeve */}
          <RoundedBox radius={0.04} smoothness={3} position={[-0.22, -0.2, 0]} castShadow rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.1, 0.5, 0.06]} />
            <meshStandardMaterial color="#4a5a6a" roughness={0.85} />
          </RoundedBox>
        </group>
      </group>

      {/* ===== Storage box / basket at the base ===== */}
      <RoundedBox radius={0.04} smoothness={3} position={[0.55, 0.32, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.45]} />
        <meshStandardMaterial color="#a89070" roughness={0.9} />
      </RoundedBox>
      {/* Basket weave lines */}
      {[0.12, 0.24, 0.36].map((y, i) => (
        <mesh key={`weave-${i}`} position={[0.55, y, 0.675]}>
          <boxGeometry args={[0.48, 0.02, 0.01]} />
          <meshStandardMaterial color="#8a7050" roughness={0.9} />
        </mesh>
      ))}
      {/* A folded sweater poking out */}
      <RoundedBox radius={0.03} smoothness={2} position={[0.55, 0.6, 0.4]} castShadow rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.3, 0.12, 0.25]} />
        <meshStandardMaterial color="#c98868" roughness={0.9} />
      </RoundedBox>
    </Interactive>
  )
}
