import { useEffect, useRef, useMemo, forwardRef } from 'react'
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, BrightnessContrast, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useStore, nightBlendRef } from '../store'
import { focusSpots, defaultCamera } from '../content'
import { CottageShell, CottageFurniture } from './Cottage'

// SpotLight whose target is properly mounted in the scene graph — a bare
// `target-position` prop does NOT work in R3F (the target object never gets
// its matrixWorld updated, so the light keeps aiming at the origin).
const AimedSpotLight = forwardRef(function AimedSpotLight({ position, target, ...props }, ref) {
  const targetObj = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (ref?.current) ref.current.target = targetObj
  }, [targetObj, ref])
  return (
    <>
      <primitive object={targetObj} position={target} />
      <spotLight ref={ref} position={position} {...props} />
    </>
  )
})

const DAY_BG = '#241d16'
const NIGHT_BG = '#0b1122'

// Crossfade table: [refKey, dayIntensity, nightIntensity]. Every light in both
// rigs is ALWAYS mounted; useFrame drives each intensity from nightBlendRef,
// so flipping `night` eases the whole scene through a dusk-like midpoint
// instead of hard-swapping.
const RIG = [
  ['dayHemi', 0.55, 0],
  ['dayAmb', 0.18, 0],
  ['sun', 2.2, 0],
  ['dayDirFill', 0.35, 0],
  ['dayFill1', 0.5, 0],
  ['dayFill2', 0.5, 0],
  ['dayFill3', 0.35, 0],
  ['dayFill4', 0.3, 0],
  ['nightHemi', 0, 0.25],
  ['nightAmb', 0, 0.08],
  ['moon', 0, 0.55],
  ['stumpOrb', 0, 1.3],
  ['screenGlow', 0, 1.1],
  ['signpostSpot', 0, 2.8],
  ['nightFill', 0, 1.2],
]

export function Scene() {
  const controlsRef = useRef()
  const worldRef = useRef() // whole room — used for pointer parallax
  const shellRef = useRef() // room shell (walls/floor) — intro scale target
  const furnitureRef = useRef() // furniture wrapper — intro stagger targets
  const rigRefs = useRef({}) // both light rigs — intensity crossfade targets
  const { camera, gl, scene } = useThree()
  const active = useStore((s) => s.active)
  const revealed = useStore((s) => s.revealed)
  const night = useStore((s) => s.night)
  const setReady = useStore((s) => s.setReady)

  const setRigRef = (key) => (el) => { rigRefs.current[key] = el }
  const bgDay = useMemo(() => new THREE.Color(DAY_BG), [])
  const bgNight = useMemo(() => new THREE.Color(NIGHT_BG), [])

  // Enable physically-correct lighting + ACES tone mapping for a cinematic look.
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.15
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

  // Day/night crossfade: tween the shared blend value, and drive every rig
  // light + background/fog colors from it each frame (see useFrame below).
  useEffect(() => {
    nightBlendRef.current = night ? 1 : 0
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    gsap.killTweensOf(nightBlendRef)
    gsap.to(nightBlendRef, {
      current: night ? 1 : 0,
      duration: 1.6,
      ease: 'power2.inOut',
    })
  }, [night])

  // Per-frame crossfade — light intensities, visibility (skips shadow-map
  // rendering for lights pinned at 0), background, fog, and tone-mapping
  // exposure (night reads best slightly brighter to keep the shadows airy).
  const bgTmp = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    const b = nightBlendRef.current
    for (const [key, dayI, nightI] of RIG) {
      const l = rigRefs.current[key]
      if (!l) continue
      l.intensity = THREE.MathUtils.lerp(dayI, nightI, b)
      // lights that are 0 at one end should not render their shadow map
      l.visible = l.intensity > 0.01 || (dayI > 0 && nightI > 0)
    }
    bgTmp.copy(bgDay).lerp(bgNight, b)
    scene.background = bgTmp
    scene.fog.color.copy(bgTmp)
  })

  // Camera + controls tween on focus change.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const dest = active ? focusSpots[active] : defaultCamera
    const camPos = new THREE.Vector3(...dest.camera)
    const tgt = new THREE.Vector3(...dest.target)
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)
    const tl = gsap.timeline()
    tl.to(camera.position, { x: camPos.x, y: camPos.y, z: camPos.z, duration: 1.4, ease: 'power3.inOut' }, 0)
    tl.to(controls.target, { x: tgt.x, y: tgt.y, z: tgt.z, duration: 1.4, ease: 'power3.inOut', onUpdate: () => controls.update() }, 0)
    return () => { gsap.killTweensOf(camera.position); gsap.killTweensOf(controls.target) }
  }, [active, camera])

  // The computer sits deep on the desk and OrbitControls' minDistance (4.5)
  // caps how close the dolly can get — pinch the FOV alongside the dolly for
  // a "lean in" lens zoom so the screen fills the frame. All other focuses
  // (and the overview) keep the default 40.
  useEffect(() => {
    const destFov = active === 'computer' ? 26 : 40
    gsap.killTweensOf(camera)
    gsap.to(camera, {
      fov: destFov, duration: 1.4, ease: 'power3.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
    })
    return () => { gsap.killTweensOf(camera) }
  }, [active, camera])

  // Hover → pointer cursor
  useEffect(() => {
    const unsub = useStore.subscribe((s) => { gl.domElement.style.cursor = s.hovered ? 'pointer' : 'auto' })
    return unsub
  }, [gl])

  const flagged = useRef(false)
  useFrame(() => { if (!flagged.current) { flagged.current = true; setReady(true) } })

  // Intro "grows the room": shell first, then each furniture piece pops in
  // back-to-front with a back.out overshoot (pattern from 3d-room-portfolio's
  // startIntroAnimation). Gated on `revealed` — the loader's doors — so the
  // intro plays as the room becomes visible, not behind the closed veil.
  const introduced = useRef(false)
  useEffect(() => {
    if (!revealed || introduced.current) return
    introduced.current = true
    const kids = furnitureRef.current ? [...furnitureRef.current.children] : []
    kids.forEach((k) => k.scale.setScalar(0.001))
    const tl = gsap.timeline()
    tl.fromTo(
      shellRef.current.scale,
      { x: 0.001, y: 0.001, z: 0.001 },
      { x: 1, y: 1, z: 1, duration: 0.9, ease: 'power3.out' },
      0
    )
    kids.forEach((k, i) => {
      tl.to(k.scale, { x: 1, y: 1, z: 1, duration: 0.65, ease: 'back.out(1.7)' }, 0.45 + i * 0.1)
    })
    return () => { tl.kill() }
  }, [revealed])

  // Pointer parallax — the whole room leans ever so slightly toward the cursor
  // (frame-rate independent via lerp, pattern from mohitvirli's camera rig).
  // Pauses while an object is focused so the camera tween reads cleanly.
  useFrame((state) => {
    if (!worldRef.current) return
    const rest = active ? 0 : 1
    worldRef.current.rotation.x = THREE.MathUtils.lerp(
      worldRef.current.rotation.x, -state.pointer.y * 0.012 * rest, 0.045
    )
    worldRef.current.rotation.y = THREE.MathUtils.lerp(
      worldRef.current.rotation.y, -state.pointer.x * 0.02 * rest, 0.045
    )
  })

  return (
    <>
      {/* Background + fog colors are written per-frame from nightBlendRef
          (see the crossfade useFrame above) — no JSX color needed. */}
      <fog attach="fog" args={[DAY_BG, 16, 40]} />

      {/* ===== DAY RIG — warm "baked" lighting (crossfaded out at night) ===== */}
      <hemisphereLight ref={setRigRef('dayHemi')} args={['#fff0d8', '#5a4030']} />
      <ambientLight ref={setRigRef('dayAmb')} color="#ffe8cc" />

      <directionalLight
        ref={setRigRef('sun')}
        position={[7, 11, 5]}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-radius={6}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.5, 30]} />
      </directionalLight>

      <directionalLight ref={setRigRef('dayDirFill')} position={[-5, 4, -7]} color="#a8c4d8" />
      <pointLight ref={setRigRef('dayFill1')} position={[0, 4.5, 0.6]} color="#7ec0d8" distance={5} decay={2} />
      <pointLight ref={setRigRef('dayFill2')} position={[-4, 5.5, 1]} color="#ffc888" distance={7} decay={2} />
      <pointLight ref={setRigRef('dayFill3')} position={[0, 6.5, -4.5]} color="#ffe4c0" distance={8} decay={2} />
      <pointLight ref={setRigRef('dayFill4')} position={[4.5, 5.5, 1]} color="#ffdca0" distance={6} decay={2} />

      {/* ===== NIGHT RIG — replicated from blender night_scene.py ===== */}
      <hemisphereLight ref={setRigRef('nightHemi')} args={['#1a2340', '#05070d']} />
      <ambientLight ref={setRigRef('nightAmb')} color="#33406b" />

      {/* Moon — cool key light from upper-front-right */}
      <directionalLight
        ref={setRigRef('moon')}
        position={[8, 12, 9]}
        color="#8ca3ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.5, 40]} />
      </directionalLight>

      {/* ① desk lamp warm glow lives INSIDE LampGlow (Cottage.jsx) so the
          light pool always follows the bulb sphere position */}
      {/* ② stump-cabinet orb night light — on the glass ball next to the
          stump. castShadow gives nearby books real shadows; the light sits
          just ABOVE the ball (same lesson as the desk lamp: a shadow-casting
          pointLight inside a mesh self-shadows and swallows its own glow). */}
      <pointLight
        ref={setRigRef('stumpOrb')}
        name="dbg:stumpOrb"
        position={[-1.9, 2.75, 1.4]}
        distance={5}
        decay={2}
        color="#ffd9a3"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
        shadow-normalBias={0.02}
      />
      {/* ④ computer screen glow — just in front of the green display,
          which faces into the room along +X. */}
      <pointLight ref={setRigRef('screenGlow')} name="dbg:screenGlow" position={[-3.55, 1.85, -2.15]} distance={3.2} decay={2} color="#9fd9a8" />
      {/* ③ signpost fill — the signpost sits at world ≈ (4.4, 1.8, -3.6).
          Keep the cone on its boards so its shared grass-and-stone base
          stays in the same moonlit range as the surrounding ground. */}
      <AimedSpotLight
        ref={setRigRef('signpostSpot')}
        name="dbg:signpostSpot"
        position={[5.6, 4.8, -0.4]}
        target={[4.4, 1.85, -3.6]}
        angle={0.38}
        penumbra={0.65}
        distance={6}
        decay={2}
        color="#ccd5f2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
        shadow-normalBias={0.02}
      />
      {/* faint interior fill so corners never go pure black */}
      <pointLight ref={setRigRef('nightFill')} name="dbg:nightFill" position={[0.5, 6.3, 0]} distance={12} decay={2} color="#c9c2e8" />

      {/* World group — pointer-parallax tilt applies to everything inside */}
      <group ref={worldRef}>
        {/* Cottage GLB — shell (skeleton/moss/vines) + interactive furniture.
            The intro stagger animates furnitureRef children (one per group). */}
        <group ref={shellRef}>
          <CottageShell />
        </group>
        <group ref={furnitureRef}>
          <CottageFurniture />
        </group>

        {/* Dust motes drifting near the window */}
        <Sparkles
          count={70}
          scale={[2.0, 3.5, 2.0]}
          position={[1.3, 4.2, -2.2]}
          size={2}
          speed={0.25}
          opacity={0.35}
          color={night ? '#9fe3b0' : '#ffe3b0'}
        />

        {/* Contact shadows = fake AO, small `far` so walls/roof beams don't
            project giant soft blobs onto the floor (that was the flicker) */}
        <ContactShadows
          position={[0, 0.02, 0]}
          scale={16}
          far={1.3}
          resolution={1024}
          blur={2}
          opacity={0.4}
          color={night ? '#050810' : '#3a2818'}
        />
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4.5}
        maxDistance={18}
        minPolarAngle={Math.PI * 0.285}
        maxPolarAngle={Math.PI * 0.47}
        minAzimuthAngle={Math.PI * 0.1}
        maxAzimuthAngle={Math.PI * 0.6}
        target={[0, 1.1, 0]}
      />

      {/* ===== Post-processing ===== */}
      <EffectComposer>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <BrightnessContrast brightness={0.02} contrast={0.08} />
        <Vignette eskil={false} offset={0.3} darkness={0.45} blendFunction={BlendFunction.NORMAL} />
        {/* Film grain — subtle noise adds photographic texture (kept faint:
            at high opacity the per-frame noise reads as flicker) */}
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.07} />
      </EffectComposer>
    </>
  )
}
