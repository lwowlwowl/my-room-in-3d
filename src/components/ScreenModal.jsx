import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { nextTrack, prevTrack, musicState, toggleMute } from '../audio'

// ---------------------------------------------------------------------------
// The computer screen — a cream-white retro monitor (matching the desk's
// monitor model) framing an interactive "CottageOS" desktop. Content is a
// placeholder playground (hello.txt typewriter + a plantable garden) until
// real content is decided; swap the app bodies below.
// ---------------------------------------------------------------------------

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// typewriter line-by-line intro
const HELLO_LINES = [
  '> hello, wanderer!',
  '> this screen is still growing…',
  '> for now, plant a little garden',
  '> (click the soil in the garden app)',
  '> more to come :)',
]

function HelloApp() {
  const [n, setN] = useState(0)
  const [chars, setChars] = useState(0)
  const [typed, setTyped] = useState('') // real-keyboard input, appended after the intro
  const introDone = n >= HELLO_LINES.length

  useEffect(() => {
    if (introDone) return
    const line = HELLO_LINES[n]
    if (chars < line.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 26)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => { setN((v) => v + 1); setChars(0) }, 320)
    return () => clearTimeout(t)
  }, [n, chars, introDone])

  // real keyboard → the screen: any printable char types into hello.txt,
  // Backspace erases, Enter starts a fresh "> " line. The intro finishes
  // first (typing during it just skips the animation to the end).
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') return // handled by the modal's own listener
      if (e.key === 'Backspace') {
        setTyped((s) => s.slice(0, -1))
        return
      }
      if (e.key === 'Enter') {
        setTyped((s) => (s.length ? s + '\n> ' : '> '))
        return
      }
      if (e.key.length === 1 && typed.length < 160) {
        setTyped((s) => s + e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [typed.length])

  return (
    <div className="screen-term">
      {HELLO_LINES.slice(0, n).map((l, i) => <p key={i}>{l}</p>)}
      {!introDone && <p>{HELLO_LINES[n].slice(0, chars)}<span className="screen-caret" /></p>}
      {introDone && (
        <>
          <p>{'> ' + typed}<span className="screen-caret" /></p>
          {typed === '' && <p className="screen-term-hint">(type on your keyboard…)</p>}
        </>
      )}
    </div>
  )
}

// click-to-plant toy: each click sprouts a leaf/flower at that spot
const PLANTS = ['#8FB88F', '#a5d6a7', '#e8a87c', '#c96f5f', '#b08bc9', '#f0d9a0']
function GardenApp() {
  const [sprouts, setSprouts] = useState([])
  const plant = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setSprouts((s) => [
      ...s.slice(-23),
      {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
        kind: Math.random() > 0.55 ? 'flower' : 'leaf',
        hue: PLANTS[Math.floor(Math.random() * PLANTS.length)],
        rot: Math.round((Math.random() - 0.5) * 50),
        size: 10 + Math.random() * 9,
      },
    ])
  }
  return (
    <div className="screen-garden" onClick={plant}>
      <div className="screen-garden-soil" />
      {sprouts.map((p, i) =>
        p.kind === 'flower' ? (
          <svg key={i} className="screen-sprout" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, transform: `translate(-50%,-100%) rotate(${p.rot}deg)` }} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill={p.hue} />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="12" cy="6.5" rx="2.4" ry="3.6" fill={p.hue} opacity="0.9" transform={`rotate(${a} 12 12)`} />
            ))}
          </svg>
        ) : (
          <svg key={i} className="screen-sprout" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, transform: `translate(-50%,-100%) rotate(${p.rot}deg)` }} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21C6 16 4 10 5 4c7 0 12 4 12 10 0 3-2 6-5 7z" fill={p.hue} opacity="0.9" />
            <path d="M12 21C9 15 9 9 12 4" stroke="#1A2A1A" strokeWidth="1.2" fill="none" />
          </svg>
        )
      )}
      {sprouts.length === 0 && <p className="screen-garden-hint">click the soil to plant something</p>}
    </div>
  )
}

// hand-drawn line icons for the music controls (matches the CottageOS
// note/leaf icon style — stroke-based, rounded, no emoji)
function MusicButton({ label, onClick, muted, children }) {
  return (
    <button
      type="button"
      className={muted ? 'muted' : ''}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const IconPrev = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 5.5v13L8 12z" /><path d="M6 5.5v13" />
  </svg>
)
const IconNext = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 5.5v13l10-6.5z" /><path d="M18 5.5v13" />
  </svg>
)
const IconSound = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" />
    <path d="M15.5 9.5a4 4 0 0 1 0 5" />
    <path d="M17.8 7.2a7 7 0 0 1 0 9.6" />
  </svg>
)
const IconMuted = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" />
    <path d="M16 9.5l5 5" /><path d="M21 9.5l-5 5" />
  </svg>
)

// music player — shows the current BGM track and flips between the two
// tracks in /public/music (audio.js). The mute state is shared with the
// wooden sound plank (App.jsx): muting from either side silences both, and
// track switching while muted only rotates the selection (no sound starts).
function MusicApp() {
  const [state, setState] = useState(() => musicState())
  const refresh = () => setState(musicState())
  const step = (dir) => {
    if (dir > 0) nextTrack(); else prevTrack()
    setTimeout(refresh, 50)
  }
  const mute = () => {
    toggleMute()
    setTimeout(refresh, 50)
  }
  // any silence — explicitly muted OR never started — shows the red muted
  // state, so the button's look always matches "sound is off right now"
  const silent = state.muted || !state.running
  return (
    <div className="screen-music">
      <div className={`screen-music-disc ${state.playing ? '' : 'paused'}`} aria-hidden="true">
        <i />
      </div>
      <div className="screen-music-info">
        <span className="screen-music-name">{state.track}</span>
        <span className="screen-music-sub">
          {silent ? '~ the forest sleeps ~' : '♪ now playing'}
        </span>
      </div>
      <div className="screen-music-controls">
        <MusicButton label="Previous track" onClick={() => step(-1)}>{IconPrev}</MusicButton>
        <MusicButton label={silent ? 'Unmute' : 'Mute'} muted={silent} onClick={mute}>
          {silent ? IconMuted : IconSound}
        </MusicButton>
        <MusicButton label="Next track" onClick={() => step(1)}>{IconNext}</MusicButton>
      </div>
      <p className="screen-music-hint">
        track {state.trackIndex + 1} / {state.count}
        {silent ? ' — silent: switching tracks stays quiet until unmuted' : ' — the wooden plank (top-right) also mutes'}
      </p>
    </div>
  )
}

const APPS = {
  hello: { title: 'hello.txt', body: HelloApp, icon: 'note' },
  garden: { title: 'garden', body: GardenApp, icon: 'leaf' },
  music: { title: 'music', body: MusicApp, icon: 'music' },
}

function AppIcon({ name }) {
  if (name === 'note') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h6M9 16h6" />
      </svg>
    )
  }
  if (name === 'music') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20C4 11 11 5 20 4c-.5 9-6 16-16 16z" /><path d="M4 20C8 14 12 10 17 7" />
    </svg>
  )
}

function Desktop() {
  const [open, setOpen] = useState('hello')
  const clock = useClock()
  const app = APPS[open]
  const Body = app.body
  return (
    <div className="screen-desktop">
      <div className="screen-menubar">
        <span className="screen-menubar-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="screen-menubar-title">CottageOS</span>
        <span className="screen-menubar-clock">{clock}</span>
      </div>

      <div className="screen-icons">
        {Object.entries(APPS).map(([id, a]) => (
          <button key={id} type="button" className={`screen-icon ${open === id ? 'on' : ''}`} onClick={() => setOpen(id)}>
            <AppIcon name={a.icon} />
            <span>{a.title}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="screen-window">
          <div className="screen-window-bar">
            <span>{app.title}</span>
          </div>
          <div className="screen-window-body"><Body /></div>
        </div>
      )}

      <div className="screen-taskbar">
        <span>{open ? app.title : 'desktop'}</span>
        <span className="screen-taskbar-glow" aria-hidden="true" />
      </div>
    </div>
  )
}

export function ScreenModal() {
  const screen = useStore((s) => s.screen)
  const setScreen = useStore((s) => s.setScreen)
  const setActive = useStore((s) => s.setActive)

  const close = () => { setScreen(false); setActive(null) }

  useEffect(() => {
    if (!screen) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!screen) return null

  return (
    <div className="screen-veil" onClick={close} role="dialog" aria-modal="true" aria-label="Computer screen">
      {/* the cream-white monitor — same body colour as the desk's monitor model */}
      <div className="screen-monitor" onClick={(e) => e.stopPropagation()}>
        <span className="screen-nail screen-nail-tl" aria-hidden="true" />
        <span className="screen-nail screen-nail-tr" aria-hidden="true" />
        <button type="button" aria-label="Close" onClick={close} className="screen-close">✕</button>

        <div className="screen-bezel">
          <div className="screen-display">
            <Desktop />
            <span className="screen-glare" aria-hidden="true" />
          </div>
        </div>

        <div className="screen-chin">
          <i className="screen-chin-led" aria-hidden="true" />
          <span>cottage&nbsp;·&nbsp;puter</span>
        </div>
      </div>
    </div>
  )
}
