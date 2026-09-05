// ---------------------------------------------------------------------------
// Ambience — synthesized breeze bed + a BGM track looping from /public/music/.
// Track selection now lives in the CottageOS music app (ScreenModal): the
// player calls nextTrack/prevTrack/togglePlay. The AudioContext only starts
// on a user gesture (first click inside the music app), per autoplay policy.
// ---------------------------------------------------------------------------

const TRACKS = [
  { src: '/music/atlasaudio-emotional-piano-510218.mp3', name: 'Emotional Piano' },
  { src: '/music/prettyjohn1-chill-chill-music-505125.mp3', name: 'Chill Chill' },
]

let ctx = null
let master = null
let bgmGain = null
let audioEl = null
let mediaSrc = null
let trackIndex = Math.floor(Math.random() * TRACKS.length)
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

function loadTrack(i, autoplay = true) {
  trackIndex = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length
  if (audioEl) {
    audioEl.pause()
    audioEl.onended = null
    try { audioEl.src = '' } catch {}
    audioEl = null
  }
  audioEl = new Audio(TRACKS[trackIndex].src)
  audioEl.loop = true
  audioEl.crossOrigin = 'anonymous'
  mediaSrc = ctx.createMediaElementSource(audioEl)
  mediaSrc.connect(bgmGain)
  if (autoplay) audioEl.play().catch(() => {}) // AbortError on rapid switches is benign
}

// muted = the user silenced ambience via the wooden plank (or the music
// app's own mute toggle). Track switching still updates the selection, but
// nothing may start playing until unmuted.
let muted = false

// change notification — React UIs (the sound plank, the music app) subscribe
// so they can re-render when ANOTHER UI flips the audio state
const listeners = new Set()
function notify() {
  for (const fn of listeners) fn()
}
export function onAudioChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function startAmbience() {
  ensureContext()
  if (ctx.state === 'suspended') ctx.resume()
  muted = false
  if (!running) {
    running = true
    startBreeze()
    loadTrack(trackIndex)
  }
  notify()
}

// --- CottageOS music-app controls ---------------------------------------
// All safe before startAmbience(): they ensure the context themselves.
// They respect `muted`: a muted room only rotates the track selection.

export function nextTrack() {
  ensureContext()
  if (!running && !muted) {
    startAmbience()
    loadTrack(trackIndex + 1)
    return
  }
  if (muted) {
    // just move the selection; no sound starts
    trackIndex = ((trackIndex + 1) % TRACKS.length + TRACKS.length) % TRACKS.length
    return
  }
  if (ctx.state === 'suspended') ctx.resume()
  if (!running) { running = true; startBreeze() }
  loadTrack(trackIndex + 1)
}

export function prevTrack() {
  ensureContext()
  if (!running && !muted) {
    startAmbience()
    loadTrack(trackIndex - 1)
    return
  }
  if (muted) {
    trackIndex = ((trackIndex - 1) % TRACKS.length + TRACKS.length) % TRACKS.length
    return
  }
  if (ctx.state === 'suspended') ctx.resume()
  if (!running) { running = true; startBreeze() }
  loadTrack(trackIndex - 1)
}

export function togglePlay() {
  ensureContext()
  if (!running || !audioEl) {
    if (muted) return false
    startAmbience()
    return true
  }
  if (audioEl.paused) {
    if (muted) return false
    if (ctx.state === 'suspended') ctx.resume()
    audioEl.play()
    return true
  }
  audioEl.pause()
  return false
}

export function musicState() {
  return {
    running,
    muted,
    track: TRACKS[trackIndex].name,
    trackIndex,
    count: TRACKS.length,
    playing: running && audioEl ? !audioEl.paused : false,
  }
}

// the music app's own mute toggle — mirrors the wooden plank so both UIs
// stay in sync (either one can mute or unmute)
export function toggleMute() {
  if (muted || !running) {
    // unmute: same path as the plank's play
    startAmbience()
    notify()
    return false
  }
  stopAmbience()
  notify()
  return true
}

export function stopAmbience() {
  running = false
  muted = true
  if (audioEl) { audioEl.pause(); audioEl = null }
  if (breezeNodes) {
    try { breezeNodes.src.stop(); breezeNodes.lfo.stop() } catch {}
    breezeNodes = null
  }
  if (ctx && ctx.state === 'running') ctx.suspend()
  notify()
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
    trackIndex,
    trackName: TRACKS[trackIndex].name,
  }
}
