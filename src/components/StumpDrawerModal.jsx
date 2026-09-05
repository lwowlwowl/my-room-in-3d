import { useEffect } from 'react'
import { useStore } from '../store'
import { collections } from '../content'

// ---------------------------------------------------------------------------
// The stump cabinet's "my collection" drawer — a wooden drawer (pulled out
// of the stump in 3D by StumpDrawer) with cubbies for hobbies, keepsakes,
// and skill badges. Content lives in content.js `collections`.
// ---------------------------------------------------------------------------

function Icon({ name, className }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', className, viewBox: '0 0 24 24' }
  switch (name) {
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M4 20C4 11 11 5 20 4c-.5 9-6 16-16 16z" />
          <path d="M4 20C8 14 12 10 17 7" />
        </svg>
      )
    case 'acorn':
      return (
        <svg {...common}>
          <path d="M12 6c-3 0-5 2-5 2s1 3 5 3 5-3 5-3-2-2-5-2z" />
          <path d="M7 8c0 6 2 11 5 12 3-1 5-6 5-12" />
          <path d="M10 6c0-1.5.8-3 2-3s2 1.5 2 3" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 3l2.6 5.6 6 .7-4.4 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.4 9.3l6-.7z" />
        </svg>
      )
    default:
      return null
  }
}

export function StumpDrawerModal() {
  const drawer = useStore((s) => s.drawer)
  const setDrawer = useStore((s) => s.setDrawer)
  const setActive = useStore((s) => s.setActive)

  const close = () => { setDrawer(false); setActive(null) }

  useEffect(() => {
    if (!drawer) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!drawer) return null

  return (
    <div className="drawer-veil" onClick={close} role="dialog" aria-modal="true" aria-label={collections.title}>
      {/* the drawer box itself — wood front + deep inside */}
      <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
        <span className="nail nail-tl" aria-hidden="true" />

        <button type="button" aria-label="Close" onClick={close} className="forest-close drawer-close">
          <span className="forest-close-nail" aria-hidden="true" />
          ✕
        </button>

        <div className="drawer-front">
          <span className="drawer-title">{collections.title}</span>
          <span className="drawer-sub">{collections.sub}</span>
          <span className="drawer-handle" aria-hidden="true" />
        </div>

        <div className="drawer-inside">
          {/* hobbies cubby */}
          <div className="drawer-cubby drawer-hobbies">
            <div className="drawer-cubby-label">
              <Icon name="leaf" />
              <span>{collections.hobbies.label}</span>
            </div>
            <div className="drawer-chips">
              {collections.hobbies.items.map((h, i) => (
                <span key={i} className="drawer-chip">{h}</span>
              ))}
            </div>
          </div>

          {/* keepsakes cubby */}
          <div className="drawer-cubby drawer-keepsakes">
            <div className="drawer-cubby-label">
              <Icon name="acorn" />
              <span>{collections.keepsakes.label}</span>
            </div>
            <ul className="drawer-keepsake-list">
              {collections.keepsakes.items.map((k, i) => (
                <li key={i}>
                  <span className="drawer-keepsake-name">{k.name}</span>
                  <span className="drawer-keepsake-desc">{k.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* skill badges cubby */}
          <div className="drawer-cubby drawer-skills">
            <div className="drawer-cubby-label">
              <Icon name="star" />
              <span>{collections.skills.label}</span>
            </div>
            <div className="drawer-badges">
              {collections.skills.items.map((s, i) => (
                <span key={i} className="drawer-badge" title={s.name}>{s.short}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
