import { useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Interactive, useObjectHighlight } from '../Interactive'

export function MedicineCabinet() {
  const { isHovered, isActive, boost } = useObjectHighlight('hobbies', { hover: 0.3, active: 0.45 })
  const crossRef = useRef()
  useFrame(({ clock }) => {
    if (crossRef.current && (isHovered || isActive)) {
      crossRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 4) * 0.1
    } else if (crossRef.current) {
      crossRef.current.rotation.z *= 0.9
    }
  })

  return (
    <Interactive id="hobbies" position={[-2.5, 1.8, -5.17]} labelAnchor={[0, 0.7, 0]}>
      {/* ===== Main body — matte medical plastic, morandi rose ===== */}
      <RoundedBox radius={0.06} smoothness={5} position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.5, 0.35]} />
        <meshStandardMaterial color="#d08585" roughness={0.4} metalness={0.08} emissive="#d08585" emissiveIntensity={boost} />
      </RoundedBox>

      {/* Subtle panel groove on front face — inset panel look */}
      <mesh position={[0, 0.18, 0.176]}>
        <boxGeometry args={[0.42, 0.38, 0.005]} />
        <meshStandardMaterial color="#c47878" roughness={0.42} metalness={0.08} emissive="#c47878" emissiveIntensity={boost * 0.5} />
      </mesh>

      {/* ===== Glass window showing contents inside ===== */}
      <mesh position={[0, 0.2, 0.182]}>
        <planeGeometry args={[0.3, 0.22]} />
        <meshStandardMaterial color="#b0d0e0" roughness={0.05} metalness={0.1} transparent opacity={0.35} side={THREE.DoubleSide} envMapIntensity={0.6 + boost} />
      </mesh>
      {/* Glass reflection streak */}
      <mesh position={[0.05, 0.24, 0.184]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[0.04, 0.18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18 + (isHovered || isActive ? 0.12 : 0)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ===== Contents visible through the glass ===== */}
      {/* Two pill bottles */}
      <group position={[-0.08, 0.16, 0.175]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
          <meshStandardMaterial color="#d4a050" roughness={0.5} />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.025, 12]} />
          <meshStandardMaterial color="#c47030" roughness={0.5} />
        </mesh>
        {/* Label */}
        <mesh position={[0, -0.01, 0.036]}>
          <planeGeometry args={[0.05, 0.06]} />
          <meshBasicMaterial color="#f0e8d0" toneMapped={false} />
        </mesh>
      </group>
      <group position={[0.08, 0.16, 0.17]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 12]} />
          <meshStandardMaterial color="#5a8a6a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.033, 0.033, 0.02, 12]} />
          <meshStandardMaterial color="#3a6a4a" roughness={0.5} />
        </mesh>
      </group>
      {/* Bandage roll */}
      <group position={[0, 0.12, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
          <meshStandardMaterial color="#f0e8d0" roughness={0.9} />
        </mesh>
        {/* Center hole */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.052, 10]} />
          <meshStandardMaterial color="#3a2818" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== Lid — glossy plastic, distinct from body ===== */}
      <RoundedBox radius={0.05} smoothness={5} position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.58, 0.07, 0.38]} />
        <meshStandardMaterial color="#bc7070" roughness={0.2} metalness={0.2} />
      </RoundedBox>

      {/* ===== Carrying handle — metal arch on top ===== */}
      <group position={[0, 0.52, 0]}>
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
          <meshStandardMaterial color="#c0a878" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
          <meshStandardMaterial color="#c0a878" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Arch bar — half torus */}
        <mesh position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.12, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c0a878" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Hinge — metal detail on the back */}
      <mesh position={[-0.2, 0.48, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
        <meshStandardMaterial color="#c0a878" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[-0.2, 0.44, -0.1]}>
        <boxGeometry args={[0.04, 0.02, 0.04]} />
        <meshStandardMaterial color="#b09868" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Front latch — metallic clasp with keyhole */}
      <mesh position={[0, 0.46, 0.2]}>
        <boxGeometry args={[0.08, 0.04, 0.03]} />
        <meshStandardMaterial color="#d4bc8c" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.44, 0.19]}>
        <boxGeometry args={[0.06, 0.03, 0.02]} />
        <meshStandardMaterial color="#c0a878" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Keyhole */}
      <mesh position={[0, 0.46, 0.216]}>
        <circleGeometry args={[0.006, 8]} />
        <meshStandardMaterial color="#1a1208" roughness={0.5} />
      </mesh>

      {/* ===== 3D Red cross emblem — beveled, with depth ===== */}
      <group ref={crossRef} position={[0, 0.28, 0.181]}>
        {/* Cross vertical bar */}
        <RoundedBox radius={0.005} smoothness={2} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} emissive="#ffffff" emissiveIntensity={boost * 0.2} />
        </RoundedBox>
        {/* Cross horizontal bar */}
        <RoundedBox radius={0.005} smoothness={2} castShadow>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} emissive="#ffffff" emissiveIntensity={boost * 0.2} />
        </RoundedBox>
        {/* Red border ring behind cross */}
        <mesh position={[0, 0, -0.005]}>
          <ringGeometry args={[0.14, 0.17, 32]} />
          <meshStandardMaterial color="#c44545" roughness={0.4} metalness={0.05} emissive="#c44545" emissiveIntensity={boost * 0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Small prescription tag dangling */}
      <mesh position={[0.25, 0.2, 0.18]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.005]} />
        <meshStandardMaterial color="#f0e8d0" roughness={0.8} />
      </mesh>
      <mesh position={[0.25, 0.26, 0.18]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 6]} />
        <meshStandardMaterial color="#c0a878" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Small rubber feet — raised */}
      {[
        [-0.22, -0.06], [0.22, -0.06], [-0.22, 0.1], [0.22, 0.1],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.04, z]}>
          <cylinderGeometry args={[0.025, 0.03, 0.04, 6]} />
          <meshStandardMaterial color="#7a5050" roughness={0.9} />
        </mesh>
      ))}

      <mesh position={[0, 0.18, -0.185]} receiveShadow>
        <boxGeometry args={[0.5, 0.36, 0.02]} />
        <meshStandardMaterial color="#8a6240" roughness={0.6} />
      </mesh>
      {/* Mount screws */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={`screw-${i}`} position={[x, 0.18, -0.19]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.01, 8]} />
          <meshStandardMaterial color="#c0a878" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {isActive && (
        <pointLight position={[0, 0.3, 0.3]} intensity={0.6} color="#d08585" distance={1.8} />
      )}
    </Interactive>
  )
}
