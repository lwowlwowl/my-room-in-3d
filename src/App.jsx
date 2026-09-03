import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, labelRef } from './store'
import { Scene } from './components/Scene'
import { ForestModal } from './components/ForestModal'
import { Loader } from './components/Loader'
import { ErrorBoundary } from './components/ErrorBoundary'

// hover labels for the few interactive things (boards + lamp easter egg)
const HOVER_LABELS = {
  work: 'My Work',
  about: 'About',
  contact: 'Contact',
  lamp: 'Toggle Night Mode',
}

export default function App() {
  const active = useStore((s) => s.active)
  const board = useStore((s) => s.board)
  const hovered = useStore((s) => s.hovered)
  const ready = useStore((s) => s.ready)
  const night = useStore((s) => s.night)
  const setNight = useStore((s) => s.setNight)
  const setActive = useStore((s) => s.setActive)
  const setReady = useStore((s) => s.setReady)

  // Adaptive resolution — start at 1.5, climb to 2 on headroom, drop to 1
  // when frames are missed (pattern from VinayMatta63/threejs-portfolio).
  const [dpr, setDpr] = useState(1.5)

  // Fallback: if the scene hasn't signalled ready within 6s (e.g. a slow
  // device or a silently failed WebGL context), dismiss the loader anyway
  // so the user isn't stuck staring at "Building the room…".
  useEffect(() => {
    if (ready) return
    const t = setTimeout(() => setReady(true), 6000)
    return () => clearTimeout(t)
  }, [ready, setReady])

  // Esc key → back to overview
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setActive])

  const hoveredLabel = hovered ? HOVER_LABELS[hovered] : ''

  return (
    <>
      <Loader done={ready} />

      <div className={`canvas-wrap ${hovered ? 'grab' : ''}`}>
        <ErrorBoundary>
          <Canvas
            dpr={dpr}
            shadows
            camera={{ position: [12, 10, 18.5], fov: 40, near: 0.1, far: 100 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.15
            }}
            onPointerMissed={() => setActive(null)}
          >
            <PerformanceMonitor
              onIncline={() => setDpr(2)}
              onDecline={() => setDpr(1)}
              flipflops={3}
              onFallback={() => setDpr(1)}
            />
            <Suspense fallback={null}>
              <Scene />
              <Preload all />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Day / night toggle — top-right, like a sun/moon dial */}
      <button
        type="button"
        aria-label={night ? 'Switch to day mode' : 'Switch to night mode'}
        onClick={() => setNight(!night)}
        className="night-toggle select-none fixed right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-xl shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
      >
        {night ? '🌙' : '☀️'}
      </button>

      {/* Title chip */}
      <div className="title-chip select-none rounded-2xl bg-white/70 px-4 py-2 text-center shadow-lg backdrop-blur-md">
        <div className="font-display text-lg font-bold tracking-tight text-ink">
          My Room in 3D
        </div>
        <div className="text-[11px] font-medium uppercase tracking-widest text-woodDark/70">
          Interactive Resume
        </div>
      </div>

      {/* Hover label — positioned by the 3D loop via labelRef */}
      <div
        ref={(el) => { labelRef.current = el }}
        className="hover-label rounded-lg bg-ink/85 px-3 py-1.5 text-sm font-semibold text-cream shadow-lg"
        style={{ opacity: hovered ? 1 : 0, left: 0, top: 0 }}
      >
        {hoveredLabel}
      </div>

      {/* Hint bar */}
      <div className="hint-bar select-none rounded-full bg-white/60 px-4 py-1.5 text-center text-xs font-medium text-woodDark shadow backdrop-blur-md">
        {board
          ? 'Click ✕ or outside the sign to close'
          : active
            ? 'Click ✕ or empty space to return'
            : 'Drag to rotate · Scroll to zoom · Click the signpost to explore'}
      </div>

      {/* Back button */}
      {active && !board && (
        <button
          onClick={() => setActive(null)}
          className="back-btn flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-lg transition hover:scale-105 active:scale-95"
        >
          <span className="text-base leading-none">✕</span> Back
        </button>
      )}

      {/* Forest modal (signpost boards) */}
      <ForestModal />
    </>
  )
}
