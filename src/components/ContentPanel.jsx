import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useStore } from '../store'

// The HTML content panel that slides in from the right when an object is focused.
export function ContentPanel({ data }) {
  const ref = useRef(null)
  const setActive = useStore((s) => s.setActive)

  // Slide-in animation each time the target changes.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('open')
    // content fade-up
    const ctx = gsap.context(() => {
      gsap.from('.panel-inner > *', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.15,
      })
    }, ref)
    return () => ctx.revert()
  }, [data.id])

  return (
    <aside
      ref={ref}
      className="content-panel border-l border-black/10 bg-cream/95 shadow-2xl backdrop-blur-md"
    >
      <div className="panel-inner p-7 pt-9">
        {/* Accent header */}
        <div
          className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-md"
          style={{ background: data.color }}
        >
          <span className="text-2xl">{data.icon}</span>
          <div>
            <h2 className="font-display text-xl font-bold leading-tight">
              {data.title}
            </h2>
            <p className="text-xs font-medium uppercase tracking-widest opacity-80">
              {data.label}
            </p>
          </div>
        </div>

        {/* Body paragraphs */}
        {data.body?.map((p, i) => (
          <p key={i} className="mb-4 text-sm leading-relaxed text-ink/80">
            {p}
          </p>
        ))}

        {/* Meta rows (About) */}
        {data.meta && (
          <dl className="mb-4 grid grid-cols-2 gap-3">
            {data.meta.map((m) => (
              <div key={m.k} className="rounded-xl bg-white/60 p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-woodDark">
                  {m.k}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{m.v}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Projects list */}
        {data.list && !data.links && (
          <div className="space-y-3">
            {data.list.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-ink">
                    {item.name}
                  </h3>
                  {item.tag && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: data.color }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">
                  {item.desc}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* Skills groups */}
        {data.groups && (
          <div className="space-y-4">
            {data.groups.map((g) => (
              <div key={g.name}>
                <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-woodDark">
                  {g.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-white/70 px-3 py-1 text-xs font-semibold text-ink shadow-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience timeline */}
        {data.timeline && (
          <div className="relative space-y-5 pl-5">
            <div className="absolute left-1.5 top-1 h-[calc(100%-0.5rem)] w-0.5 bg-wood/40" />
            {data.timeline.map((t, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[1.15rem] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-cream" style={{ background: data.color }} />
                <div className="text-xs font-bold uppercase tracking-wider text-woodDark">
                  {t.period}
                </div>
                <h3 className="font-display text-base font-bold text-ink">
                  {t.role}
                </h3>
                <div className="text-xs font-semibold text-ink/60">{t.company}</div>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">{t.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hobbies */}
        {data.id === 'hobbies' && data.list && (
          <div className="grid grid-cols-2 gap-2">
            {data.list.map((h, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/70 p-3 text-center text-sm font-semibold text-ink shadow-sm"
              >
                {h}
              </div>
            ))}
          </div>
        )}

        {/* Contact links */}
        {data.links && (
          <div className="space-y-2">
            {data.links.map((l) => (
              <a
                key={l.k}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-woodDark">
                  {l.k}
                </span>
                <span className="text-sm font-semibold text-ink">{l.v}</span>
              </a>
            ))}
          </div>
        )}

        <button
          onClick={() => setActive(null)}
          className="mt-7 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-cream shadow-lg transition hover:scale-[1.02] active:scale-95"
        >
          ← Back to room
        </button>
      </div>
    </aside>
  )
}
