// ---------------------------------------------------------------------------
// Ambience — synthesized breeze bed + a randomly-picked BGM track looping
// from /public/music/. The AudioContext only starts on a user gesture (the
// sound toggle plank), per browser autoplay policy. Night mode is hooked for
// future per-mode tracks but currently plays the same song.
// ---------------------------------------------------------------------------

const TRACKS = [
  '/music/atlasaudio-emotional-piano-510218.mp3',
  '/music/prettyjohn1-chill-chill-music-505125.mp3',
]

let ctx = null
let master = null
let bgmGain = null
let audioEl = null
let running = false
let breezeNodes = null

function ensureContext() {
  if (ctx) return
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  bgmGain = ctx.createGain()
  bgmGain.gain.value = 0.5
  bgmGain.connect(master)
}

function startBreeze() {
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf; src.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 0.4
  const g = ctx.createGain()
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.012
  g.gain.value = 0.008
  lfo.connect(lfoGain); lfoGain.connect(g.gain)
  src.connect(lp); lp.connect(g); g.connect(master)
  src.start(); lfo.start()
  breezeNodes = { src, lfo, g }
}

function startBgm() {
  // pick a random track; route through Web Audio so volume sits under master
  const track = TRACKS[Math.floor(Math.random() * TRACKS.length)]
  audioEl = new Audio(track)
  audioEl.loop = true
  audioEl.crossOrigin = 'anonymous'
  const src = ctx.createMediaElementSource(audioEl)
  src.connect(bgmGain)
  audioEl.play()
}

export function startAmbience() {
  ensureContext()
  if (ctx.state === 'suspended') ctx.resume()
  if (running) return
  running = true
  startBreeze()
  startBgm()
}

export function stopAmbience() {
  running = false
  if (audioEl) { audioEl.pause(); audioEl = null }
  if (breezeNodes) {
    try { breezeNodes.src.stop(); breezeNodes.lfo.stop() } catch {}
    breezeNodes = null
  }
  if (ctx && ctx.state === 'running') ctx.suspend()
}

// no day/night music difference for now — kept for future per-mode tracks
export function setNight() {}

// test/inspection hook — RMS level from an analyser tapped on master,
// exposed on window for headless verification scripts.
let analyser = null
if (typeof window !== 'undefined') window.__ambienceState = () => ambienceState()
export function ambienceState() {
  if (!ctx) return { running, ctxState: 'none', level: 0, track: null }
  if (!analyser) {
    analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    master.connect(analyser)
  }
  const buf = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(buf)
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
  return {
    running,
    ctxState: ctx.state,
    level: +Math.sqrt(sum / buf.length).toFixed(4),
    track: audioEl ? audioEl.src.split('/').pop() : null,
    bgmPaused: audioEl ? audioEl.paused : null,
  }
}
