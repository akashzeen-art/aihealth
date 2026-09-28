import { useEffect, useMemo, useState } from 'react'

const TABS = ['Today', 'Yesterday', 'Last week', 'Last month'] as const

const TAB_SCORES: Record<(typeof TABS)[number], number> = {
  Today: 1,
  Yesterday: 2,
  'Last week': 4,
  'Last month': 5,
}

export default function ProgressGauge({
  current,
  total = 6,
  name,
}: {
  current: number
  total?: number
  name: string
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Today')
  const [animated, setAnimated] = useState(0)
  const [pulse, setPulse] = useState(false)
  const safeTotal = Math.max(total, 1)

  const target = useMemo(() => {
    const base = Math.min(Math.max(current, 0), safeTotal)
    // Mix real explore count with tab demo intensity for interactivity
    return Math.min(safeTotal, Math.max(base, TAB_SCORES[tab]))
  }, [current, safeTotal, tab])

  const pct = target / safeTotal
  const r = 78
  const cx = 100
  const cy = 100
  const circumference = Math.PI * r
  const dash = circumference * pct
  const needleAngle = Math.PI - pct * Math.PI
  const needleX = cx + Math.cos(needleAngle) * (r - 6)
  const needleY = cy - Math.sin(needleAngle) * (r - 6)

  useEffect(() => {
    setAnimated(0)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(dash))
    })
    return () => cancelAnimationFrame(id)
  }, [dash, tab])

  return (
    <section
      className={`glass-panel progress-gauge is-interactive home-stagger ${pulse ? 'is-pulse' : ''}`}
      aria-label="Overall progress"
      onClick={() => {
        setPulse(true)
        window.setTimeout(() => setPulse(false), 450)
      }}
    >
      <div className="progress-gauge-tabs" role="tablist" aria-label="Time range">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'is-active' : ''}
            onClick={(e) => {
              e.stopPropagation()
              setTab(t)
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="progress-gauge-lead">
        {name}, your explore progress is
      </p>

      <div className="progress-gauge-chart">
        <svg viewBox="0 0 200 120" className="progress-gauge-svg" aria-hidden="true">
          <defs>
            <linearGradient id="gaugeGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            className="progress-gauge-track"
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            className="progress-gauge-fill"
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="url(#gaugeGlow)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${animated} ${circumference}`}
          />
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = Math.PI - (i / 10) * Math.PI
            const x1 = cx + Math.cos(angle) * (r + 10)
            const y1 = cy - Math.sin(angle) * (r + 10)
            const x2 = cx + Math.cos(angle) * (r + 17)
            const y2 = cy - Math.sin(angle) * (r + 17)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="progress-gauge-tick" />
          })}
          <circle cx={needleX} cy={needleY} r="5" className="progress-gauge-needle" />
        </svg>
        <div className="progress-gauge-score">
          <span className="progress-gauge-dot" aria-hidden="true" />
          <p>
            <strong>{target}</strong>
            <span>/{safeTotal}</span>
          </p>
          <span className="progress-gauge-caption">assistants explored · tap tabs</span>
        </div>
      </div>
    </section>
  )
}
