import { useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Interactive, useObjectHighlight } from '../Interactive'

// Desktop top surface (incl. bevel) is at y ≈ 0.88. This object sits ON the desk.
const DESK_Y = 0.88

export function DeskTrinket() {
  const { boost } = useObjectHighlight('contact', { hover: 0.25, active: 0.4 })
  const flagRef = useRef()
  useFrame(({ clock }) => {
    if (flagRef.current) flagRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.25
  })

  return (
    <Interactive id="contact" position={[1.0, DESK_Y, -1.0]} labelAnchor={[0, 0.8, 0]}>
      {/* ===== Compact desk mailbox — sits on the desk surface ===== */}
      {/* Base plate */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.02, 16]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Mailbox body — morandi lavender */}
      <RoundedBox radius={0.05} smoothness={4} position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.3, 0.3]} />
        <meshStandardMaterial color="#a89bc0" roughness={0.5} metalness={0.1} emissive="#a89bc0" emissiveIntensity={boost} />
      </RoundedBox>

      {/* Mailbox curved top — half cylinder */}
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.21, 0.21, 0.3, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#9888b0" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Mail slot */}
      <mesh position={[0, 0.18, 0.151]}>
        <boxGeometry args={[0.26, 0.035, 0.01]} />
        <meshStandardMaterial color="#1a1208" roughness={0.4} />
      </mesh>
      {/* Slot rim */}
      <mesh position={[0, 0.18, 0.152]}>
        <boxGeometry args={[0.28, 0.045, 0.005]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ===== Envelopes sticking out of the slot ===== */}
      {[
        { x: -0.06, r: 0.08, c: '#f0e8d0' },
        { x: 0.0, r: -0.05, c: '#e8dcc0' },
        { x: 0.06, r: 0.12, c: '#f5ead0' },
      ].map((e, i) => (
        <mesh key={`env-${i}`} position={[e.x, 0.19, 0.16]} rotation={[0.15, e.r, 0]} castShadow>
          <boxGeometry args={[0.15, 0.02, 0.2]} />
          <meshStandardMaterial color={e.c} roughness={0.8} />
        </mesh>
      ))}
      {/* Stamp on front envelope */}
      <mesh position={[-0.06, 0.21, 0.185]} rotation={[0.15, 0.08, 0]}>
        <planeGeometry args={[0.035, 0.035]} />
        <meshBasicMaterial color="#c9544a" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ===== Name / address plate on mailbox front ===== */}
      <mesh position={[0, 0.07, 0.152]}>
        <boxGeometry args={[0.2, 0.05, 0.004]} />
        <meshStandardMaterial color="#c9a06a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ===== Little flag — raised, gently waving ===== */}
      <group ref={flagRef} position={[0.22, 0.22, 0]}>
        <mesh position={[0.06, 0, 0]} castShadow>
          <boxGeometry args={[0.015, 0.18, 0.015]} />
          <meshStandardMaterial color="#c9544a" roughness={0.5} />
        </mesh>
        <mesh position={[0.14, 0.08, 0]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.015]} />
          <meshStandardMaterial color="#c9544a" roughness={0.5} />
        </mesh>
      </group>

      {/* ===== Stack of letters next to the mailbox ===== */}
      <group position={[0.28, 0.005, -0.05]} rotation={[0, 0.15, 0]}>
        <mesh position={[0, 0.005, 0]} castShadow>
          <boxGeometry args={[0.22, 0.01, 0.15]} />
          <meshStandardMaterial color="#f0e8d0" roughness={0.8} />
        </mesh>
        <mesh position={[0.01, 0.015, 0.005]} castShadow>
          <boxGeometry args={[0.22, 0.01, 0.15]} />
          <meshStandardMaterial color="#e8dcc0" roughness={0.8} />
        </mesh>
      </group>

      {/* Soft glow when active */}
      {boost > 0 && (
        <pointLight position={[0, 0.25, 0.2]} intensity={boost * 1.5} color="#a89bc0" distance={1.5} />
      )}
    </Interactive>
  )
}
