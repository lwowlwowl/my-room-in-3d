import { useEffect, useRef, useMemo } from 'react'
import { OrbitControls, SoftShadows, ContactShadows, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, BrightnessContrast, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useStore } from '../store'
import { focusSpots, defaultCamera } from '../content'
import { Room } from './Room'
import { Bed } from './objects/Bed'
import { Desk } from './objects/Desk'
import { Computer } from './objects/Computer'
import { Wardrobe } from './objects/Wardrobe'
import { Window } from './objects/Window'
import { MedicineCabinet } from './objects/MedicineCabinet'
import { DeskTrinket } from './objects/DeskTrinket'

export function Scene() {
  const controlsRef = useRef()
  const worldRef = useRef() // whole room — used for pointer parallax
  const shellRef = useRef() // room shell (walls/floor) — intro scale target
  const furnitureRef = useRef() // furniture wrapper — intro stagger targets
  const { camera, gl } = useThree()
  const active = useStore((s) => s.active)
  const revealed = useStore((s) => s.revealed)
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
      <color attach="background" args={['#241d16']} />
      <fog attach="fog" args={['#241d16', 16, 32]} />

      {/* Soft shadow kernel — blurs shadow edges for a natural look */}
      <SoftShadows size={28} samples={16} focus={0.6} />

      {/* ===== Warm "baked" lighting rig ===== */}
      {/* Sky: warm cream from above, warm earth from below */}
      <hemisphereLight args={['#fff0d8', '#5a4030', 0.55]} />
      {/* Ambient base so nothing is pure black */}
      <ambientLight intensity={0.18} color="#ffe8cc" />

      {/* Key light — warm evening sun streaming from upper-front-right */}
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

      {/* Fill — cool soft light from the window side (left-back) */}
      <directionalLight position={[-5, 4, -7]} intensity={0.35} color="#a8c4d8" />

      {/* Warm bounce near the desk — simulates indirect light from screen glow */}
      <pointLight position={[0, 1.6, 0.6]} intensity={0.5} color="#7ec0d8" distance={5} decay={2} />
      {/* Warm bounce near the bed area — brighter to kill dead-black corners */}
      <pointLight position={[-4, 2.5, -1]} intensity={0.5} color="#ffc888" distance={7} decay={2} />
      {/* Back wall fill — ensures the deep corners behind bed/wardrobe are visible */}
      <pointLight position={[0, 3.5, -4.5]} intensity={0.35} color="#ffe4c0" distance={8} decay={2} />
      {/* Wardrobe area fill */}
      <pointLight position={[4.5, 2.5, -1]} intensity={0.3} color="#ffdca0" distance={6} decay={2} />

      {/* World group — pointer-parallax tilt applies to everything inside */}
      <group ref={worldRef}>
        {/* Room shell — its own group so the intro can scale it in first */}
        <group ref={shellRef}>
          <Room />
        </group>

        {/* Furniture — each in its own wrapper group as an intro-stagger target */}
        <group ref={furnitureRef}>
          <group><Bed /></group>
          <group><Desk /></group>
          <group><Wardrobe /></group>
          <group><Window /></group>
          <group><Computer /></group>
          <group><MedicineCabinet /></group>
          <group><DeskTrinket /></group>
        </group>

        {/* Dust motes drifting in the window sunbeam (hugging the window,
            clear of the wardrobe and the display-board stand) */}
        <Sparkles
          count={70}
          scale={[2.0, 3.5, 2.0]}
          position={[5.7, 2.5, -3.8]}
          size={2}
          speed={0.25}
          opacity={0.35}
          color="#ffe3b0"
        />

        {/* Contact shadows = fake AO under furniture, gives soft ground contact */}
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={16}
          far={6}
          resolution={1024}
          blur={2.5}
          opacity={0.5}
          color="#3a2818"
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
        <Vignette eskil={false} offset={0.25} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
        {/* Film grain — subtle noise adds photographic texture */}
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.18} />
      </EffectComposer>
    </>
  )
}
