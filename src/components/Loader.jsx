import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useStore } from '../store'

// Entry veil in two acts (border-frame loader pattern from mohitvirli's
// portfolio, adapted): Act 1 — the viewport frame draws itself while the
// scene warms up (no fake numbers: assets are procedural and load instantly,
// this is the one honest beat of anticipation). Act 2 — the veil parts like
// curtains, and the room's furniture intro starts the moment it becomes
// visible. Honors prefers-reduced-motion by skipping straight to the room.
export function Loader({ done }) {
  const setRevealed = useStore((s) => s.setRevealed)
  const rootRef = useRef(null)
  const strokeRef = useRef(null)
  const centerRef = useRef(null)
  const doorsRef = useRef(null)
  const doneRef = useRef(false)
  const drawnRef = useRef(false)
  const revealedRef = useRef(false)

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Fire the reveal once BOTH conditions hold: frame drawn AND scene ready.
  const maybeReveal = () => {
    if (revealedRef.current || !doneRef.current || !drawnRef.current) return
    revealedRef.current = true
    gsap
      .timeline()
      // text and frame step aside first
      .set(rootRef.current, { pointerEvents: 'none' }, 0)
      .to(centerRef.current, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 0)
      .to(strokeRef.current.parentNode, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 0.05)
      // doors part — the furniture intro fires on this same beat via `revealed`
      .to(
        doorsRef.current.children,
        {
          xPercent: (i) => (i === 0 ? -100 : 100),
          duration: 0.8,
          ease: 'power3.inOut',
          onStart: () => setRevealed(true),
        },
        0.25
      )
      .set(rootRef.current, { display: 'none' })
  }

  // Act 1 — the frame draws itself.
  useEffect(() => {
    if (reduced()) return
    const draw = gsap.timeline({
      onComplete: () => {
        drawnRef.current = true
        maybeReveal()
      },
    })
    draw.fromTo(
      strokeRef.current,
      { attr: { 'stroke-dashoffset': 100 } },
      { attr: { 'stroke-dashoffset': 0 }, duration: 1.1, ease: 'power2.inOut' }
    )
    return () => {
      draw.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    doneRef.current = done
    if (reduced()) {
      if (done) {
        gsap.set(rootRef.current, { display: 'none' })
        setRevealed(true)
      }
      return
    }
    maybeReveal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <div ref={rootRef} className="loader">
      {/* Doors — two halves that part like a curtain (slight overlap in the
          middle so no seam shows; identical gradients keep the join hidden) */}
      <div ref={doorsRef} className="absolute inset-0">
        <div className="loader-door" />
        <div className="loader-door loader-door-r" />
      </div>

      {/* Film grain — feTurbulence noise, zero GPU cost */}
      <div className="loader-grain" />

      {/* Frame — faint full border + the animated stroke on top of it.
          pathLength=100 normalizes the perimeter so dash math is unit-free. */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <rect
          className="loader-frame-faint"
          x="1%"
          y="1%"
          width="98%"
          height="98%"
          rx="2"
          pathLength="100"
          fill="none"
        />
        <rect
          ref={strokeRef}
          className="loader-frame-draw"
          x="1%"
          y="1%"
          width="98%"
          height="98%"
          rx="2"
          pathLength="100"
          fill="none"
          strokeDasharray="100"
          strokeDashoffset="100"
        />
      </svg>

      {/* Title */}
      <div ref={centerRef} className="relative z-10 select-none text-center">
        <div className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          My Room in 3D
        </div>
        <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.4em] opacity-60">
          Interactive Resume
        </div>
      </div>
    </div>
  )
}
