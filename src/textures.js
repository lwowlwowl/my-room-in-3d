import * as THREE from 'three'

// ============================================================================
// Procedural canvas textures — wood grain, wall plaster, fabric, etc.
// All generated at runtime so the project stays dependency-free for assets.
// ============================================================================

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function finalizeTexture(tex, { repeat = 1, repeatY, anisotropy = 8 } = {}) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeatY ?? repeat)
  tex.anisotropy = anisotropy
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

// --- Wood grain (oak, warm) — color + roughness map -------------------------
export function woodTextures() {
  const W = 512, H = 512
  const colorCanvas = makeCanvas(W, H)
  const roughCanvas = makeCanvas(W, H)
  const cc = colorCanvas.getContext('2d')
  const rc = roughCanvas.getContext('2d')

  // base
  cc.fillStyle = '#c89762'
  cc.fillRect(0, 0, W, H)
  rc.fillStyle = '#646464'
  rc.fillRect(0, 0, W, H)

  // grain lines
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * H + Math.sin(i * 2.3) * 6
    const alpha = 0.06 + Math.random() * 0.14
    const shade = Math.random() > 0.5 ? 18 : -22
    cc.strokeStyle = `rgba(${100 + shade},${70 + shade * 0.7},${40 + shade * 0.5},${alpha})`
    cc.lineWidth = 0.8 + Math.random() * 1.6
    cc.beginPath()
    cc.moveTo(0, y)
    for (let x = 0; x <= W; x += 16) {
      cc.lineTo(x, y + Math.sin(x * 0.04 + i) * 3 + Math.sin(x * 0.11) * 1.5)
    }
    cc.stroke()

    // roughness variation along grain
    rc.strokeStyle = `rgba(${30},${30},${30},${alpha * 1.4})`
    rc.lineWidth = cc.lineWidth
    rc.beginPath()
    rc.moveTo(0, y)
    for (let x = 0; x <= W; x += 16) {
      rc.lineTo(x, y + Math.sin(x * 0.04 + i) * 3)
    }
    rc.stroke()
  }

  // subtle knots
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 8 + Math.random() * 10
    const g = cc.createRadialGradient(x, y, 1, x, y, r)
    g.addColorStop(0, 'rgba(80,52,28,0.5)')
    g.addColorStop(1, 'rgba(80,52,28,0)')
    cc.fillStyle = g
    cc.beginPath(); cc.arc(x, y, r, 0, Math.PI * 2); cc.fill()
  }

  const color = new THREE.CanvasTexture(colorCanvas)
  const rough = new THREE.CanvasTexture(roughCanvas)
  finalizeTexture(color, { repeat: 2 })
  finalizeTexture(rough, { repeat: 2 })
  rough.colorSpace = THREE.NoColorSpace
  return { map: color, roughnessMap: rough }
}

// --- Dark wood (for furniture frames) ---------------------------------------
export function darkWoodTextures() {
  const W = 512, H = 512
  const colorCanvas = makeCanvas(W, H)
  const cc = colorCanvas.getContext('2d')
  cc.fillStyle = '#8a5e38'
  cc.fillRect(0, 0, W, H)
  for (let i = 0; i < 50; i++) {
    const y = (i / 50) * H
    const alpha = 0.05 + Math.random() * 0.12
    cc.strokeStyle = `rgba(${50 + Math.random()*20},${32 + Math.random()*14},${18 + Math.random()*10},${alpha})`
    cc.lineWidth = 0.6 + Math.random() * 1.2
    cc.beginPath()
    cc.moveTo(0, y)
    for (let x = 0; x <= W; x += 20) cc.lineTo(x, y + Math.sin(x * 0.05 + i * 1.7) * 4)
    cc.stroke()
  }
  const t = new THREE.CanvasTexture(colorCanvas)
  finalizeTexture(t, { repeat: 1 })
  return t
}

// --- Wall plaster (subtle noise) ---------------------------------------------
export function wallTexture() {
  const W = 256, H = 256
  const c = makeCanvas(W, H)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#f0e9dc'
  ctx.fillRect(0, 0, W, H)
  // fine noise
  const img = ctx.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
  // very faint larger blotches for plaster feel
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 20 + Math.random() * 40
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(200,188,168,0.06)')
    g.addColorStop(1, 'rgba(200,188,168,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  const t = new THREE.CanvasTexture(c)
  finalizeTexture(t, { repeat: 3 })
  return t
}

// --- Fabric (for bedding) — color + bump -------------------------------------
export function fabricTextures(baseColor = '#e8dcc4') {
  const W = 256, H = 256
  const colorCanvas = makeCanvas(W, H)
  const bumpCanvas = makeCanvas(W, H)
  const cc = colorCanvas.getContext('2d')
  const bc = bumpCanvas.getContext('2d')
  cc.fillStyle = baseColor
  cc.fillRect(0, 0, W, H)
  bc.fillStyle = '#808080'
  bc.fillRect(0, 0, W, H)
  // woven pattern
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const v = Math.random() * 30 - 15
      cc.fillStyle = `rgba(${v < 0 ? 0 : 255},${v < 0 ? 0 : 255},${v < 0 ? 0 : 255},${Math.abs(v) / 80})`
      cc.fillRect(x, y, 2, 1)
      bc.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},1)`
      bc.fillRect(x, y, 2, 1)
    }
  }
  const color = new THREE.CanvasTexture(colorCanvas)
  const bump = new THREE.CanvasTexture(bumpCanvas)
  finalizeTexture(color, { repeat: 4 })
  finalizeTexture(bump, { repeat: 4 })
  bump.colorSpace = THREE.NoColorSpace
  return { map: color, bumpMap: bump }
}

// --- Rug fabric ---------------------------------------------------------------
export function rugTexture(color = '#c97f5b') {
  const W = 256, H = 256
  const c = makeCanvas(W, H)
  const ctx = c.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, W, H)
  const img = ctx.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 24
    img.data[i] += n
    img.data[i + 1] += n * 0.8
    img.data[i + 2] += n * 0.6
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  finalizeTexture(t, { repeat: 6 })
  return t
}
