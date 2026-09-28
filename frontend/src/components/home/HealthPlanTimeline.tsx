import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AssistantSlug } from '../../utils/assistants'
import { assistantPath } from '../../utils/assistants'

type PlanItem = {
  id: string
  label: string
  start: number
  duration: number
  track: number
  accent: string
  slug: AssistantSlug
}

const HOURS_START = 7
const HOURS_END = 11
const TOTAL_MIN = (HOURS_END - HOURS_START) * 60

const PLAN_ITEMS: PlanItem[] = [
  { id: '1', label: 'Water tip', start: 15, duration: 50, track: 0, accent: 'blue', slug: 'nutrition' },
  { id: '2', label: 'Caffeine note', start: 80, duration: 45, track: 0, accent: 'green', slug: 'health' },
  { id: '3', label: 'Natural light', start: 35, duration: 55, track: 1, accent: 'amber', slug: 'mother-baby' },
  { id: '4', label: 'Breakfast ideas', start: 100, duration: 55, track: 1, accent: 'sky', slug: 'nutrition' },
  { id: '5', label: 'Gentle movement', start: 55, duration: 65, track: 2, accent: 'rose', slug: 'first-aid' },
  { id: '6', label: 'Read a report', start: 140, duration: 55, track: 2, accent: 'violet', slug: 'document-reader' },
  { id: '7', label: 'Translate a term', start: 190, duration: 50, track: 0, accent: 'cyan', slug: 'translator' },
]

const TICKS = Array.from({ length: (HOURS_END - HOURS_START) * 4 + 1 }, (_, i) => {
  const mins = HOURS_START * 60 + i * 15
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

export default function HealthPlanTimeline({ count = 12 }: { count?: number }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState(0.12)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const dragging = useRef(false)
  const scrollerDrag = useRef<{ active: boolean; startX: number; startScroll: number }>({
    active: false,
    startX: 0,
    startScroll: 0,
  })

  function applyPan(next: number) {
    const clamped = Math.min(1, Math.max(0, next))
    setPan(clamped)
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    el.scrollLeft = max * clamped
  }

  function onSliderDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    applyPan((e.clientX - rect.left) / rect.width)
  }

  function onSliderMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    applyPan((e.clientX - rect.left) / rect.width)
  }

  function onSliderUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const today = new Date()
  const dateLabel = today.toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })

  return (
    <section className="glass-panel health-plan is-interactive home-stagger" aria-label="Health plan">
      <header className="health-plan-head">
        <div className="health-plan-title-row">
          <h2>Health Plan</h2>
          <span className="health-plan-badge" aria-label={`${count} tips`}>
            {count}
          </span>
        </div>
        <div className="health-plan-dates">
          <span>{dateLabel}</span>
          <span aria-hidden="true">—</span>
          <span>{dateLabel}</span>
        </div>
      </header>

      <div
        className="health-plan-scroller is-grab"
        ref={scrollerRef}
        onScroll={(e) => {
          const el = e.currentTarget
          const max = el.scrollWidth - el.clientWidth
          if (max > 0) setPan(el.scrollLeft / max)
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('a')) return
          scrollerDrag.current = {
            active: true,
            startX: e.clientX,
            startScroll: scrollerRef.current?.scrollLeft ?? 0,
          }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!scrollerDrag.current.active || !scrollerRef.current) return
          const dx = e.clientX - scrollerDrag.current.startX
          scrollerRef.current.scrollLeft = scrollerDrag.current.startScroll - dx
        }}
        onPointerUp={(e) => {
          scrollerDrag.current.active = false
          e.currentTarget.releasePointerCapture(e.pointerId)
        }}
      >
        <div className="health-plan-inner" style={{ width: `${TOTAL_MIN * 2.4}px` }}>
          <div className="health-plan-ticks" aria-hidden="true">
            {TICKS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="health-plan-tracks">
            {[0, 1, 2].map((track) => (
              <div key={track} className="health-plan-track">
                {PLAN_ITEMS.filter((item) => item.track === track).map((item) => (
                  <Link
                    key={item.id}
                    to={assistantPath(item.slug)}
                    className={`health-plan-chip accent-${item.accent} ${hoverId === item.id ? 'is-hot' : ''}`}
                    style={{
                      left: `${(item.start / TOTAL_MIN) * 100}%`,
                      width: `${(item.duration / TOTAL_MIN) * 100}%`,
                    }}
                    onMouseEnter={() => setHoverId(item.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <span className="health-plan-chip-bar" aria-hidden="true" />
                    <span className="health-plan-chip-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div
            className="health-plan-now"
            style={{ left: `${((8 * 60 - HOURS_START * 60) / TOTAL_MIN) * 100}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div
        className="health-plan-slider"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pan * 100)}
        aria-label="Scroll health plan timeline"
        tabIndex={0}
        onPointerDown={onSliderDown}
        onPointerMove={onSliderMove}
        onPointerUp={onSliderUp}
        onPointerCancel={onSliderUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') applyPan(pan + 0.05)
          if (e.key === 'ArrowLeft') applyPan(pan - 0.05)
        }}
      >
        <div className="health-plan-slider-thumb" style={{ left: `${pan * 100}%` }} />
      </div>
      <p className="health-plan-hint">Drag the timeline or blue scrubber · click a tip to open</p>
    </section>
  )
}
