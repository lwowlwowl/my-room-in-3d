import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, labelRef } from './store'
import { Scene } from './components/Scene'
import { ForestModal } from './components/ForestModal'
import { Loader } from './components/Loader'
import { ErrorBoundary } from './components/ErrorBoundary'
import { startAmbience, stopAmbience } from './audio'

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

  // ambience — muted until the user opts in (autoplay policy)
  const [soundOn, setSoundOn] = useState(false)
  const toggleSound = () => {
    if (soundOn) { stopAmbience(); setSoundOn(false) }
    else { startAmbience(); setSoundOn(true) }
  }

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

      {/* Day / night toggle — a wooden sign hanging on two ropes */}
      <button
        type="button"
        aria-label={night ? 'Switch to day mode' : 'Switch to night mode'}
        onClick={() => setNight(!night)}
        className="night-toggle select-none fixed right-6 top-4 z-20"
      >
        <span className="night-toggle-ropes" aria-hidden="true"><i /><i /></span>
        <span className="night-toggle-plank">
          <span className="night-toggle-knots" aria-hidden="true"><i /><i /></span>
          <span className="night-toggle-carve">
            {night ? (
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M26.5 19.5A11 11 0 1 1 12.5 5.5 8.8 8.8 0 0 0 26.5 19.5z" />
                <path d="M23 4l.7 2M25.5 8.5l2 .7M21 6.5l.3 1.6" />
                <path d="M5 27l.9-.9M7.5 24.5l.9.9" strokeWidth="1.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="16" cy="16" r="6" />
                <circle cx="16" cy="16" r="9.5" strokeWidth="1.4" strokeDasharray="1 4.6" />
                <path d="M16 1.5v3M16 27.5v3M1.5 16h3M27.5 16h3M5.6 5.6l2.1 2.1M24.3 24.3l2.1 2.1M26.4 5.6l-2.1 2.1M7.7 24.3l-2.1 2.1" />
              </svg>
            )}
          </span>
        </span>
      </button>

      {/* Sound toggle — another hanging plank, left of the day/night one.
          Muted until first click (browser autoplay policy). */}
      <button
        type="button"
        aria-label={soundOn ? 'Mute ambience' : 'Play ambience'}
        onClick={toggleSound}
        className="night-toggle sound-toggle select-none fixed right-24 top-4 z-20"
      >
        <span className="night-toggle-ropes" aria-hidden="true"><i /><i /></span>
        <span className="night-toggle-plank">
          <span className="night-toggle-knots" aria-hidden="true"><i /><i /></span>
          <span className="night-toggle-carve">
            {soundOn ? (
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12v8h5l6 5V7l-6 5H8z" />
                <path d="M23.5 11.5a7 7 0 0 1 0 9M26.5 8.5a11.5 11.5 0 0 1 0 15" strokeWidth="1.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12v8h5l6 5V7l-6 5H8z" />
                <path d="M23 13l6 6M29 13l-6 6" strokeWidth="2.2" />
              </svg>
            )}
          </span>
        </span>
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
