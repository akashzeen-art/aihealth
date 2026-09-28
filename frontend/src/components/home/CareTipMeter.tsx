import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'

export default function CareTipMeter({ explored }: { explored: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(() => Math.max(explored / 6, 0.12))
  const dragging = useRef(false)

  function setFromClientX(clientX: number) {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setValue(next)
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    setFromClientX(e.clientX)
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const label =
    value < 0.34 ? 'Learning mode' : value < 0.67 ? 'Balanced care' : 'Ready to apply'

  return (
    <section className="glass-panel home-metric-card is-interactive home-stagger">
      <div className="home-metric-top">
        <h2>Care tip</h2>
        <span className="home-metric-badge">Guide</span>
      </div>
      <p className="home-metric-value">6</p>
      <p className="home-metric-unit">specialized companions</p>
      <p className="home-metric-live">{label}</p>
      <div className="home-metric-range">
        <span>Learn</span>
        <div
          ref={trackRef}
          className="home-metric-track is-draggable"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value * 100)}
          aria-label="Learning to apply balance"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setValue((v) => Math.min(1, v + 0.05))
            if (e.key === 'ArrowLeft') setValue((v) => Math.max(0, v - 0.05))
          }}
        >
          <div className="home-metric-fill" style={{ width: `${value * 100}%` }} />
          <span className="home-metric-knob" style={{ left: `${value * 100}%` }} />
        </div>
        <span>Apply</span>
      </div>
      <Link to="/assistants" className="home-metric-link">
        View all assistants →
      </Link>
    </section>
  )
}
