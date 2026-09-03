import { useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Interactive, useObjectHighlight } from '../Interactive'

// Desktop top surface sits at y ≈ 0.78 + 0.08 + 0.02 (bevel) = 0.88.
const DESK_TOP_Y = 0.88

export function Computer() {
  const { isActive, boost } = useObjectHighlight('projects', { hover: 0.3, active: 0.5 })
  const screenMat = useRef()
  useFrame(({ clock }) => {
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 1.6) * 0.1 + boost
    }
  })

  const MON_W = 1.3
  const MON_H = 0.75
  const MON_T = 0.04

  // Full code-editor mockup drawn to canvas — far richer than flat planes.
  const screenTex = useMemo(() => {
    const W = 1024, H = 590
    const c = document.createElement('canvas')
    c.width = W; c.height = H
    const ctx = c.getContext('2d')

    // Base desktop
    ctx.fillStyle = '#1b1f27'
    ctx.fillRect(0, 0, W, H)

    // ===== Title bar =====
    ctx.fillStyle = '#2a3038'
    ctx.fillRect(0, 0, W, 34)
    // Traffic lights
    const lights = ['#ff5f56', '#ffbd2e', '#27c93f']
    lights.forEach((col, i) => {
      ctx.beginPath()
      ctx.arc(20 + i * 22, 17, 6, 0, Math.PI * 2)
      ctx.fillStyle = col
      ctx.fill()
    })
    // Window title
    ctx.fillStyle = '#9aa4b0'
    ctx.font = '13px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Room.jsx — my-room-in-3d', W / 2, 22)
    ctx.textAlign = 'left'

    // ===== Sidebar (file tree) =====
    const SBX = 0, SBW = 200
    ctx.fillStyle = '#171b22'
    ctx.fillRect(SBX, 34, SBW, H - 34)
    // Sidebar title
    ctx.fillStyle = '#7a8590'
    ctx.font = '10px monospace'
    ctx.fillText('EXPLORER', 14, 52)
    // File rows
    const files = [
      ['›', 'src', '#8fdcf0'],
      ['›', 'components', '#8fdcf0'],
      ['›', 'objects', '#8fdcf0'],
      ['—', 'Bed.jsx', '#e8c87a', true],
      ['—', 'Desk.jsx', '#d4d4d4'],
      ['—', 'Computer.jsx', '#d4d4d4'],
      ['—', 'Wardrobe.jsx', '#d4d4d4'],
      ['—', 'Window.jsx', '#d4d4d4'],
      ['—', 'MedicineCabinet.jsx', '#d4d4d4'],
    ]
    files.forEach((f, i) => {
      const y = 72 + i * 22
      if (f[3]) { ctx.fillStyle = '#2a3340'; ctx.fillRect(SBX, y - 14, SBW, 20) }
      ctx.fillStyle = '#5fa6c8'
      ctx.font = '11px monospace'
      ctx.fillText(f[0], 14, y)
      ctx.fillStyle = f[2]
      ctx.fillText(f[1], 30, y)
    })

    // ===== Code area =====
    const CX = SBW, CW = W - SBW
    // Line number gutter
    const GX = CX, GW = 44
    ctx.fillStyle = '#1e2229'
    ctx.fillRect(GX, 34, GW, H - 34)
    // Editor bg
    ctx.fillStyle = '#1b1f27'
    ctx.fillRect(CX + GW, 34, CW - GW, H - 34)

    // Line numbers
    ctx.fillStyle = '#4a5560'
    ctx.font = '11px monospace'
    ctx.textAlign = 'right'
    for (let i = 1; i <= 22; i++) ctx.fillText(String(i), GX + GW - 8, 52 + (i - 1) * 18)
    ctx.textAlign = 'left'

    // Code — syntax-highlighted, line by line
    const code = [
      [[['import ', '#c5857a'], ['{ ', '#d4d4d4'], ['useMemo', '#8fdcf0'], [' } ', '#d4d4d4'], ['from ', '#c5857a'], ["'react'", '#9ad88a']]],
      [[['import ', '#c5857a'], ['{ RoundedBox } ', '#d4d4d4'], ['from ', '#c5857a'], ["'@react-three/drei'", '#9ad88a']]],
      [[['import ', '#c5857a'], ['{ Interactive } ', '#d4d4d4'], ['from ', '#c5857a'], ["'../Interactive'", '#9ad88a']]],
      [[]],
      [[['export function ', '#c5857a'], ['Bed', '#8fdcf0'], ['() {', '#d4d4d4']]],
      [[['  const ', '#c5857a'], ['{ boost } ', '#d4d4d4'], ['= useObjectHighlight', '#8fdcf0'], ['(', '#d4d4d4'], ["'about'", '#9ad88a'], [')', '#d4d4d4']]],
      [[['  const ', '#c5857a'], ['wood ', '#d4d4d4'], ['= useMemo', '#8fdcf0'], ['(() => woodTextures(), [])', '#d4d4d4']]],
      [[]],
      [[['  return (', '#d4d4d4']]],
      [[['    <Interactive ', '#7aadf0'], ['id=', '#c9a06a'], ['"about" ', '#9ad88a'], ['position=', '#c9a06a'], ['[...]', '#9ad88a'], ['>', '#7aadf0']]],
      [[['      <RoundedBox ', '#7aadf0'], ['radius=', '#c9a06a'], ['{0.04}', '#d4d4d4'], [' position=', '#c9a06a'], ['{[0,0.35,0]}>', '#7aadf0']]],
      [[['        <boxGeometry ', '#7aadf0'], ['args=', '#c9a06a'], ['{[3.4, 0.7, 4.4]}', '#d4d4d4'], [' />', '#7aadf0']]],
      [[['        <meshStandardMaterial ', '#7aadf0'], ['map=', '#c9a06a'], ['{wood.map}', '#d4d4d4']]],
      [[['          color=', '#c9a06a'], ['"#7a5230"', '#9ad88a'], [' roughness=', '#c9a06a'], ['{0.75}', '#d4d4d4'], [' />', '#7aadf0']]],
      [[['      </RoundedBox>', '#7aadf0']]],
      [[['    </Interactive>', '#7aadf0']]],
      [[['  )', '#d4d4d4']]],
      [[['}', '#d4d4d4']]],
      [[]],
      [[['// refine every detail ✨', '#5a6a5a']]],
    ]
    const lineY = 52, LH = 18, textX = GX + GW + 10
    code.forEach((segs, i) => {
      let x = textX
      segs[0].forEach(([txt, col]) => {
        ctx.fillStyle = col
        ctx.font = '12px monospace'
        ctx.fillText(txt, x, lineY + i * LH)
        x += ctx.measureText(txt).width
      })
    })
    // Active line highlight
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(GX + GW, lineY - 14 + 5 * LH, CW - GW, LH)
    // Blinking cursor on line 6
    ctx.fillStyle = '#8fdcf0'
    ctx.fillRect(textX + 318, lineY + 5 * LH - 12, 2, 14)

    // ===== Status bar =====
    ctx.fillStyle = '#3a5a7a'
    ctx.fillRect(0, H - 26, W, 26)
    ctx.fillStyle = '#d8e8f0'
    ctx.font = '11px monospace'
    ctx.fillText(' main', 12, H - 9)
    ctx.fillText('React TSX', 120, H - 9)
    ctx.fillText('Ln 6, Col 38', W - 200, H - 9)
    ctx.fillText('UTF-8', W - 90, H - 9)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [])

  return (
    <Interactive
      id="projects"
      position={[0, DESK_TOP_Y, -1.2]}
      labelAnchor={[0, 1.2, 0]}
    >
      {/* Monitor stand — base plate */}
      <mesh position={[0, 0.02, -0.12]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.03, 12]} />
        <meshStandardMaterial color="#2b2620" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, 0.12, -0.12]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.18, 8]} />
        <meshStandardMaterial color="#2b2620" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Monitor body — thin beveled dark frame */}
      <RoundedBox radius={0.015} smoothness={3} position={[0, 0.12 + MON_H / 2 + 0.02, -0.12]} castShadow>
        <boxGeometry args={[MON_W + 0.06, MON_H + 0.06, MON_T]} />
        <meshStandardMaterial color="#1c1916" roughness={0.35} metalness={0.5} />
      </RoundedBox>

      {/* Screen — emissive canvas texture */}
      <mesh position={[0, 0.12 + MON_H / 2 + 0.02, -0.12 + MON_T / 2 + 0.005]}>
        <planeGeometry args={[MON_W, MON_H]} />
        <meshStandardMaterial
          ref={screenMat}
          map={screenTex}
          emissiveMap={screenTex}
          emissive="#ffffff"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Webcam dot on top bezel */}
      <mesh position={[0, 0.12 + MON_H + 0.02, -0.12 + MON_T / 2 + 0.01]}>
        <circleGeometry args={[0.012, 12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Brand logo under screen */}
      <mesh position={[0, 0.16, -0.12 + MON_T / 2 + 0.01]}>
        <circleGeometry args={[0.02, 12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Keyboard — slim, with a hint of key rows */}
      <group position={[0, 0.02, 0.35]}>
        <RoundedBox radius={0.01} smoothness={2} castShadow>
          <boxGeometry args={[0.8, 0.03, 0.25]} />
          <meshStandardMaterial color="#3a3530" roughness={0.7} />
        </RoundedBox>
        {/* Key rows — faint grid of small boxes */}
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 14 }).map((_, c) => (
            <mesh
              key={`key-${r}-${c}`}
              position={[-0.36 + c * 0.054, 0.018, -0.09 + r * 0.055]}
            >
              <boxGeometry args={[0.044, 0.006, 0.044]} />
              <meshStandardMaterial color="#2a2620" roughness={0.6} />
            </mesh>
          ))
        )}
        {/* Spacebar */}
        <mesh position={[0, 0.018, 0.1]}>
          <boxGeometry args={[0.3, 0.006, 0.044]} />
          <meshStandardMaterial color="#2a2620" roughness={0.6} />
        </mesh>
      </group>

      {/* Mouse — ergonomic pebble shape */}
      <group position={[0.45, 0, 0.4]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.035, 0]} castShadow>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshStandardMaterial color="#3a3530" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Flatten the bottom by scaling — handled by a wider base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.055, 0.06, 0.04, 16]} />
          <meshStandardMaterial color="#2a2620" roughness={0.6} />
        </mesh>
        {/* Scroll wheel */}
        <mesh position={[0, 0.07, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 10]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.4} />
        </mesh>
      </group>

      {/* Glow — screen illuminates desk area */}
      <pointLight position={[0, 0.5, 0.4]} intensity={isActive ? 1.2 : 0.6} color="#7fb7c9" distance={3} decay={2} />
    </Interactive>
  )
}
