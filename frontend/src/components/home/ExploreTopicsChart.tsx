import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TOPICS = [
  { label: 'General care', value: 78, compare: 61, to: '/assistant/health' },
  { label: 'First aid', value: 64, compare: 52, to: '/assistant/first-aid' },
  { label: 'Nutrition', value: 71, compare: 58, to: '/assistant/nutrition' },
  { label: 'Documents', value: 55, compare: 44, to: '/document-reader' },
]

export default function ExploreTopicsChart() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  const active = TOPICS.find((t) => t.label === hover) ?? TOPICS[0]

  return (
    <section className="glass-panel explore-topics is-interactive home-stagger" aria-label="Topic focus">
      <header className="explore-topics-head">
        <div>
          <h2>Topic focus</h2>
          <p>Educational interest — not lab results.</p>
        </div>
        <div className="explore-topics-pills" aria-live="polite">
          <span>
            <strong>{active.value}</strong> / {active.compare}%
          </span>
        </div>
      </header>
      <div className="explore-topics-chart">
        {TOPICS.map((t) => {
          const on = hover === t.label
          return (
            <button
              key={t.label}
              type="button"
              className={`explore-topics-col ${on ? 'is-active' : ''}`}
              onMouseEnter={() => setHover(t.label)}
              onFocus={() => setHover(t.label)}
              onClick={() => navigate(t.to)}
            >
              <div className="explore-topics-bars">
                <div
                  className="explore-topics-bar primary"
                  style={{ height: ready ? `${on ? Math.min(t.value + 8, 100) : t.value}%` : '0%' }}
                />
                <div
                  className="explore-topics-bar secondary"
                  style={{ height: ready ? `${t.compare}%` : '0%' }}
                />
              </div>
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      <p className="explore-topics-hint">Hover a bar · click to open that guide</p>
    </section>
  )
}
