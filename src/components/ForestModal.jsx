import { useEffect } from 'react'
import { useStore } from '../store'
import { boards } from '../content'

// ---------------------------------------------------------------------------
// Forest-themed modal. One consistent "wooden sign nailed to the scene" style
// for all three signpost boards: wood-grain panel on ropes, a carved title
// plank, cream paper content sheet, leaf decorations.
// ---------------------------------------------------------------------------

// Simple line icons for the contact board (stroke style, hand-drawn feel)
function Icon({ name, className }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', className, viewBox: '0 0 24 24' }
  switch (name) {
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5.5" width="18" height="13" rx="3.5" />
          <path d="M4 8l6.6 5a2.4 2.4 0 0 0 2.8 0L20 8" />
        </svg>
      )
    case 'github':
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0-2.85 17.54c.45.08.61-.2.61-.44v-1.7c-2.5.55-3.03-1.06-3.03-1.06-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.38 2.11.98 2.63.75.08-.58.31-.98.57-1.2-2-.23-4.1-1-4.1-4.45 0-.98.35-1.79.93-2.42-.1-.23-.4-1.15.08-2.4 0 0 .76-.24 2.48.92a8.6 8.6 0 0 1 4.51 0c1.72-1.16 2.47-.92 2.47-.92.5 1.25.19 2.17.1 2.4.58.63.92 1.44.92 2.42 0 3.47-2.1 4.22-4.11 4.44.32.28.61.83.61 1.67v2.48c0 .24.16.53.62.44A9 9 0 0 0 12 3z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
          <path d="M8 10.5V16.5" />
          <circle cx="8" cy="7.6" r="0.5" fill="currentColor" />
          <path d="M12 16.5v-3.6c0-1.3.9-2.4 2.2-2.4s2.3 1 2.3 2.4v3.6" />
          <path d="M12 10.5v1.4" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common} strokeWidth={1.8}>
          <path d="M4 20C4 11 11 5 20 4c-.5 9-6 16-16 16z" />
          <path d="M4 20C8 14 12 10 17 7" />
        </svg>
      )
    default:
      return null
  }
}

export function ForestModal() {
  const board = useStore((s) => s.board)
  const setBoard = useStore((s) => s.setBoard)
  const setActive = useStore((s) => s.setActive)

  const close = () => { setBoard(null); setActive(null) }

  // Esc closes the modal
  useEffect(() => {
    if (!board) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [board]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!board) return null
  const data = boards[board]

  return (
    <div className="forest-veil" onClick={close} role="dialog" aria-modal="true" aria-label={data.title}>
      {/* ropes the sign hangs from */}
      <div className="forest-ropes" aria-hidden="true">
        <span /><span />
      </div>

      <div className="forest-sign" onClick={(e) => e.stopPropagation()}>
        {/* corner nails */}
        <span className="nail nail-tl" /><span className="nail nail-tr" />
        <span className="nail nail-bl" /><span className="nail nail-br" />

        <button type="button" aria-label="Close" onClick={close} className="forest-close">
          <span className="forest-close-nail" aria-hidden="true" />
          ✕
        </button>

        <div className="forest-title-plank">
          <span className="forest-title-carve">{data.title}</span>
          <span className="forest-title-sub">{data.carve}</span>
        </div>

        <div className="forest-paper">
          <Leaf corner="tl" />
          <Leaf corner="br" />

          {board === 'work' && <WorkBody data={data} />}
          {board === 'about' && <AboutBody data={data} />}
          {board === 'contact' && <ContactBody data={data} />}
        </div>

        {/* vine sprouting along the bottom edge */}
        <svg className="forest-vine" viewBox="0 0 220 46" aria-hidden="true">
          <path d="M4 40 C 40 30, 60 44, 90 36 S 150 24, 180 34 S 210 40, 216 32" fill="none" stroke="#5c7a4a" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="34" cy="35" rx="7" ry="3.4" fill="#71975b" transform="rotate(-18 34 35)" />
          <ellipse cx="86" cy="33" rx="7" ry="3.4" fill="#8aa86e" transform="rotate(14 86 33)" />
          <ellipse cx="140" cy="30" rx="7" ry="3.4" fill="#71975b" transform="rotate(-12 140 30)" />
          <ellipse cx="192" cy="33" rx="6" ry="3" fill="#8aa86e" transform="rotate(16 192 33)" />
          <circle cx="118" cy="26" r="4.6" fill="#c96f5f" />
          <circle cx="118" cy="26" r="2" fill="#f0d9a0" />
          <circle cx="63" cy="28" r="3.6" fill="#b08bc9" />
          <circle cx="63" cy="28" r="1.6" fill="#f0d9a0" />
        </svg>
      </div>
    </div>
  )
}

function Leaf({ corner }) {
  return <Icon name="leaf" className={`forest-leaf forest-leaf-${corner}`} />
}

function WorkBody({ data }) {
  return (
    <>
      <p className="forest-intro">{data.intro}</p>
      <div className="forest-projects">
        {data.projects.map((p, i) => (
          <a key={i} className="forest-project" href={p.link} onClick={(e) => e.preventDefault()}>
            <div className="forest-project-head">
              <span className="forest-project-name">{p.name}</span>
              <span className="forest-tag">{p.tag}</span>
            </div>
            <p className="forest-project-desc">{p.desc}</p>
            <span className="forest-project-link">wander over →</span>
          </a>
        ))}
      </div>
    </>
  )
}

function AboutBody({ data }) {
  return (
    <>
      {data.intro.map((t, i) => <p key={i} className="forest-intro">{t}</p>)}
      <div className="forest-meta">
        {data.meta.map((m, i) => (
          <div key={i} className="forest-meta-card">
            <Icon name="leaf" className="forest-meta-leaf" />
            <div>
              <div className="forest-meta-k">{m.k}</div>
              <div className="forest-meta-v">{m.v}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function ContactBody({ data }) {
  return (
    <>
      <p className="forest-intro forest-intro-center">{data.intro}</p>
      <div className="forest-links">
        {data.links.map((l, i) => (
          <a key={i} className="forest-link" href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.k} title={l.v}>
            <Icon name={l.icon} className="forest-link-icon" />
            <span className="forest-link-label">{l.k}</span>
          </a>
        ))}
      </div>
    </>
  )
}
