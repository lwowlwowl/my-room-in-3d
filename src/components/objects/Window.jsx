import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Interactive, useObjectHighlight } from '../Interactive'

export function Window() {
  const { boost, isHovered, isActive } = useObjectHighlight('experience', { hover: 0.18, active: 0.3 })
  const glassRef = useRef()
  const birdRef = useRef()

  // Animate subtle glass reflection shimmer + a bird gliding across the sky
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (glassRef.current) {
      glassRef.current.material.envMapIntensity = 0.4 + Math.sin(t * 0.3) * 0.05 + boost * 0.5
    }
    if (birdRef.current) {
      // Glide in a slow loop across the window (window spans z, so does the flight)
      const phase = (t * 0.15) % 1
      birdRef.current.position.z = (phase - 0.5) * 1.3
      birdRef.current.position.y = 4.0 + Math.sin(t * 0.8) * 0.15
      const flap = Math.sin(t * 6)
      birdRef.current.rotation.x = flap * 0.3
    }
  })

  const viewTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 1024
    const ctx = c.getContext('2d')

    // Sky gradient — warm late afternoon, multi-stop for depth
    const g = ctx.createLinearGradient(0, 0, 0, 1024)
    g.addColorStop(0, '#7aabd0')
    g.addColorStop(0.25, '#a8c8e0')
    g.addColorStop(0.5, '#d0dce8')
    g.addColorStop(0.7, '#e8d8b8')
    g.addColorStop(0.85, '#e0b888')
    g.addColorStop(1, '#d4a868')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 1024)

    // Sun glow — warm halo
    const sg = ctx.createRadialGradient(720, 260, 15, 720, 260, 160)
    sg.addColorStop(0, 'rgba(255,245,210,0.98)')
    sg.addColorStop(0.3, 'rgba(255,235,180,0.5)')
    sg.addColorStop(1, 'rgba(255,235,180,0)')
    ctx.fillStyle = sg
    ctx.beginPath(); ctx.arc(720, 260, 160, 0, Math.PI * 2); ctx.fill()

    // Cloud layers — wispy
    ctx.save()
    ctx.globalAlpha = 0.3
    for (let i = 0; i < 6; i++) {
      const cy = 80 + i * 50
      const cx = (i * 200 + 100) % 1024
      const cg = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120)
      cg.addColorStop(0, 'rgba(255,255,255,0.8)')
      cg.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = cg
      ctx.fillRect(cx - 120, cy - 60, 240, 120)
    }
    ctx.restore()

    // Far mountains — hazy blue-green
    ctx.fillStyle = '#6a8a7a'
    ctx.beginPath(); ctx.moveTo(0, 620)
    for (let x = 0; x <= 1024; x += 20) {
      ctx.lineTo(x, 620 + Math.sin(x * 0.015) * 40 - (x > 300 ? 25 : 0) - (x > 600 ? 15 : 0))
    }
    ctx.lineTo(1024, 1024); ctx.lineTo(0, 1024); ctx.fill()

    // Mid hills — warmer green
    ctx.fillStyle = '#5a7a56'
    ctx.beginPath(); ctx.moveTo(0, 720)
    for (let x = 0; x <= 1024; x += 25) {
      ctx.lineTo(x, 720 + Math.cos(x * 0.02) * 30)
    }
    ctx.lineTo(1024, 1024); ctx.lineTo(0, 1024); ctx.fill()

    // Near tree line — darker, layered
    ctx.fillStyle = 'rgba(35,50,30,0.7)'
    for (let i = 0; i < 12; i++) {
      const x = i * 90 + 20 + Math.sin(i * 3.7) * 15
      const y = 700 + Math.sin(i * 2.1) * 15
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 30, y + 80)
      ctx.lineTo(x + 30, y + 80)
      ctx.closePath()
      ctx.fill()
    }

    // Foreground branch/leaves — top left corner, creates depth
    ctx.fillStyle = 'rgba(30,40,25,0.6)'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(200, 0)
    ctx.quadraticCurveTo(150, 100, 80, 180)
    ctx.quadraticCurveTo(30, 100, 0, 120)
    ctx.closePath()
    ctx.fill()

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <Interactive id="experience" position={[6.6, 0, -3.6]} labelAnchor={[0, 3.6, 0.6]}>
      {/* All planes face -x (into the room): the window sits in the RIGHT wall
          (x ≈ 6.7), so panes must be rotated [0, ±π/2, 0] to lie in the YZ
          plane. Wall opening is y ∈ [0.6, 5.0], z ∈ [-4.5, -2.7]. */}
      {/* ===== Glass pane ===== */}
      <mesh ref={glassRef} position={[0.18, 2.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.7, 4.4]} />
        <meshStandardMaterial
          map={viewTex}
          emissiveMap={viewTex}
          emissive="#ffffff"
          emissiveIntensity={0.6 + boost}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.92}
          envMapIntensity={0.3}
        />
      </mesh>
      {/* Reflection overlay */}
      <mesh position={[0.22, 2.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.65, 4.3]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.04 + (isHovered || isActive ? 0.06 : 0)}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== Flying bird — adds life to the sky ===== */}
      {/* Wings span z (across the view), flight runs along z past the window */}
      <group ref={birdRef} position={[0.18, 4.0, 0]}>
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[0, 0, s * 0.07]} rotation={[-s * 0.5, 0, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.14]} />
            <meshBasicMaterial color="#3a3028" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* ===== Window frame ===== */}
      <RoundedBox radius={0.04} smoothness={4} position={[0.05, 2.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 4.8, 2.0]} />
        <meshStandardMaterial color="#f5ead0" roughness={0.75} metalness={0.02} />
      </RoundedBox>
      <mesh position={[0.13, 2.8, 0]}>
        <boxGeometry args={[0.06, 4.4, 1.5]} />
        <meshStandardMaterial color="#e0d4bc" roughness={0.8} />
      </mesh>

      {/* Vertical mullion */}
      <RoundedBox radius={0.02} smoothness={3} position={[0.18, 2.8, 0]}>
        <boxGeometry args={[0.05, 4.4, 0.08]} />
        <meshStandardMaterial color="#f5ead0" roughness={0.75} />
      </RoundedBox>
      {/* Horizontal rails */}
      {[1.5, 3.0, 4.5].map((y, i) => (
        <RoundedBox key={i} radius={0.02} smoothness={3} position={[0.18, y, 0]}>
          <boxGeometry args={[0.05, 0.07, 1.68]} />
          <meshStandardMaterial color="#f5ead0" roughness={0.75} />
        </RoundedBox>
      ))}

      {/* Window sill — wider, with bevel */}
      <RoundedBox radius={0.04} smoothness={4} position={[-0.1, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.3, 2.0]} />
        <meshStandardMaterial color="#e8d8bc" roughness={0.7} />
      </RoundedBox>

      {/* ===== Curtains with rod, finials, and gathered folds ===== */}
      {/* Curtain rod — mounted on the lintel face, clear of the ceiling (y 5.7) */}
      <mesh position={[0.0, 5.35, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.2, 8]} />
        <meshStandardMaterial color="#8a6240" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Rod finials — decorative ball ends */}
      {[-1.15, 1.15].map((z, i) => (
        <mesh key={`finial-${i}`} position={[0.0, 5.35, z]} castShadow>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#8a6240" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
      {/* Rod brackets */}
      {[-0.9, 0.9].map((z, i) => (
        <mesh key={`bracket-${i}`} position={[0.0, 5.35, z]}>
          <boxGeometry args={[0.06, 0.1, 0.04]} />
          <meshStandardMaterial color="#8a6240" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {/* Left curtain — gathered at top, sheer cream (YZ plane, hangs from rod) */}
      <mesh position={[0.0, 3.0, -0.65]} castShadow rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 4.6]} />
        <meshStandardMaterial color="#f5ead0" roughness={0.95} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* Right curtain */}
      <mesh position={[0.0, 3.0, 0.65]} castShadow rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 4.6]} />
        <meshStandardMaterial color="#f5ead0" roughness={0.95} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* Curtain folds — denser vertical ridges for fabric feel */}
      {[-0.85, -0.7, -0.55, -0.4, 0.4, 0.55, 0.7, 0.85].map((z, i) => (
        <mesh key={`fold-${i}`} position={[0.02, 3.0, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.035, 4.6]} />
          <meshStandardMaterial color="#e8d8b8" roughness={0.95} transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Curtain tiebacks — bands gathered midway */}
      {[-0.65, 0.65].map((z, i) => (
        <mesh key={`tieback-${i}`} position={[0.02, 1.9, z]} castShadow>
          <boxGeometry args={[0.015, 0.09, 0.48]} />
          <meshStandardMaterial color="#c9a06a" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}

      {/* ===== Small potted plant on the sill ===== */}
      <group position={[0.0, 0.35, 0.4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
          <meshStandardMaterial color="#c9744a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <icosahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#7ab85a" roughness={1} flatShading />
        </mesh>
        <mesh position={[0.04, 0.18, 0.02]} castShadow>
          <icosahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#6aa84a" roughness={1} flatShading />
        </mesh>
      </group>

      {/* ===== Small vase with dried flowers ===== */}
      <group position={[0.0, 0.35, -0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.18, 12]} />
          <meshStandardMaterial color="#a8b8c8" roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.04, 12]} />
          <meshStandardMaterial color="#8898a8" roughness={0.5} />
        </mesh>
        {/* Stems + flowers */}
        {[
          { x: 0, z: 0, c: '#d8a050', h: 0.2 },
          { x: 0.03, z: 0.02, c: '#c97050', h: 0.18 },
          { x: -0.02, z: 0.03, c: '#e8c870', h: 0.22 },
          { x: 0.02, z: -0.02, c: '#b87090', h: 0.16 },
        ].map((f, i) => (
          <group key={`flower-${i}`} position={[f.x, 0.14, f.z]}>
            <mesh position={[0, f.h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.004, 0.004, f.h, 5]} />
              <meshStandardMaterial color="#6a8a4a" roughness={0.8} />
            </mesh>
            <mesh position={[0, f.h, 0]} castShadow>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color={f.c} roughness={0.7} emissive={f.c} emissiveIntensity={boost * 0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ===== Display board on a stand — refined presentation board ===== */}
      <group position={[-1.4, 0, 1.0]}>
        {/* Stand pole */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
          <meshStandardMaterial color="#5b4636" roughness={0.8} />
        </mesh>
        {/* Tripod base */}
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={`leg-${i}`} position={[x, 0.25, 0]} castShadow rotation={[0, 0, x > 0 ? 0.2 : -0.2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
            <meshStandardMaterial color="#5b4636" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.25, 0.15]} castShadow rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#5b4636" roughness={0.8} />
        </mesh>
        {/* Board */}
        <RoundedBox radius={0.02} smoothness={3} position={[0, 1.9, 0]} castShadow rotation={[0, -0.3, 0]}>
          <boxGeometry args={[1.1, 0.78, 0.05]} />
          <meshStandardMaterial color="#efe2c8" roughness={0.9} emissive="#efe2c8" emissiveIntensity={boost} />
        </RoundedBox>
        {/* Header bar */}
        <mesh position={[0, 2.18, 0.03]} rotation={[0, -0.3, 0]}>
          <planeGeometry args={[0.9, 0.12]} />
          <meshBasicMaterial color="#9bb5a6" toneMapped={false} />
        </mesh>
        {/* Bullet rows */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`row-${i}`} position={[0, 1.74 - i * 0.15, 0.03]} rotation={[0, -0.3, 0]}>
            <planeGeometry args={[0.84, 0.04]} />
            <meshBasicMaterial color="#b0a888" toneMapped={false} />
          </mesh>
        ))}
        {/* Mini bar chart on the board */}
        {[
          { x: -0.25, h: 0.1, c: '#9bb5a6' },
          { x: -0.15, h: 0.16, c: '#b0a888' },
          { x: -0.05, h: 0.13, c: '#9bb5a6' },
          { x: 0.05, h: 0.2, c: '#c9885a' },
          { x: 0.15, h: 0.24, c: '#c9885a' },
        ].map((b, i) => (
          <mesh key={`bar-${i}`} position={[b.x, 1.32 + b.h / 2, 0.032]} rotation={[0, -0.3, 0]}>
            <planeGeometry args={[0.06, b.h]} />
            <meshBasicMaterial color={b.c} toneMapped={false} />
          </mesh>
        ))}
        {/* Chart axis */}
        <mesh position={[0, 1.32, 0.031]} rotation={[0, -0.3, 0]}>
          <planeGeometry args={[0.5, 0.005]} />
          <meshBasicMaterial color="#8a7858" toneMapped={false} />
        </mesh>
      </group>
    </Interactive>
  )
}
