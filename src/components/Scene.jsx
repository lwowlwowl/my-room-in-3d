import { useEffect, useRef, useMemo } from 'react'
import { OrbitControls, SoftShadows, ContactShadows, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, BrightnessContrast, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useStore } from '../store'
import { focusSpots, defaultCamera } from '../content'
import { CottageShell, CottageFurniture } from './Cottage'

// SpotLight whose target is properly mounted in the scene graph — a bare
// `target-position` prop does NOT work in R3F (the target object never gets
// its matrixWorld updated, so the light keeps aiming at the origin).
function AimedSpotLight({ position, target, ...props }) {
  const light = useRef()
  const targetObj = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (light.current) light.current.target = targetObj
  }, [targetObj])
  return (
    <>
      <primitive object={targetObj} position={target} />
      <spotLight ref={light} position={position} {...props} />
    </>
  )
}

export function Scene() {
  const controlsRef = useRef()
  const worldRef = useRef() // whole room — used for pointer parallax
  const shellRef = useRef() // room shell (walls/floor) — intro scale target
  const furnitureRef = useRef() // furniture wrapper — intro stagger targets
  const { camera, gl } = useThree()
  const active = useStore((s) => s.active)
  const revealed = useStore((s) => s.revealed)
  const night = useStore((s) => s.night)
  const setReady = useStore((s) => s.setReady)

  // Enable physically-correct lighting + ACES tone mapping for a cinematic look.
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.15
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

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
      <color attach="background" args={[night ? '#0b1122' : '#241d16']} />
      <fog attach="fog" args={[night ? '#0b1122' : '#241d16', 16, 40]} />

      {/* Soft shadow kernel — blurs shadow edges for a natural look */}
      <SoftShadows size={28} samples={16} focus={0.6} />

      {night ? (
        <>
          {/* ===== NIGHT RIG — replicated from blender night_scene.py ===== */}
          <hemisphereLight args={['#1a2340', '#05070d', 0.25]} />
          <ambientLight intensity={0.08} color="#33406b" />

          {/* Moon — cool key light from upper-front-right */}
          <directionalLight
            position={[8, 12, 9]}
            intensity={0.55}
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
          {/* ② stump-cabinet orb night light */}
          <pointLight position={[-3.1, 2.2, 1.4]} intensity={2.4} distance={5} decay={2} color="#ffd9a3" />
          {/* ④ computer screen glow — just in front of the green display,
              which faces into the room along +X. */}
          <pointLight position={[-3.55, 1.85, -2.15]} intensity={1.1} distance={3.2} decay={2} color="#9fd9a8" />
          {/* ③ signpost cool spotlight — signpost sits at world ≈ (4.4, 1.8, -3.6) */}
          <AimedSpotLight
            position={[6.5, 7, 0.8]}
            target={[4.4, 1.8, -3.6]}
            angle={0.7}
            penumbra={0.7}
            intensity={5}
            distance={9}
            decay={2}
            color="#b8c6ff"
          />
          {/* faint interior fill so corners never go pure black */}
          <pointLight position={[0.5, 6.3, 0]} intensity={1.2} distance={12} decay={2} color="#c9c2e8" />
        </>
      ) : (
        <>
          {/* ===== DAY RIG — warm "baked" lighting ===== */}
          <hemisphereLight args={['#fff0d8', '#5a4030', 0.55]} />
          <ambientLight intensity={0.18} color="#ffe8cc" />

          <directionalLight
            position={[7, 11, 5]}
            intensity={2.2}
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

          <directionalLight position={[-5, 4, -7]} intensity={0.35} color="#a8c4d8" />
          <pointLight position={[0, 4.5, 0.6]} intensity={0.5} color="#7ec0d8" distance={5} decay={2} />
          <pointLight position={[-4, 5.5, 1]} intensity={0.5} color="#ffc888" distance={7} decay={2} />
          <pointLight position={[0, 6.5, -4.5]} intensity={0.35} color="#ffe4c0" distance={8} decay={2} />
          <pointLight position={[4.5, 5.5, 1]} intensity={0.3} color="#ffdca0" distance={6} decay={2} />
        </>
      )}

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
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.47}
        minAzimuthAngle={-Math.PI * 0.6}
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
