export interface TrendSeries {
  label: string
  color: string
  values: number[]
}

interface TrendChartProps {
  series: TrendSeries[]
  labels: string[]
  bands?: { from: number; to: number; color: string }[]
  unit: string
}

const W = 640
const H = 220
const PAD = { top: 16, right: 16, bottom: 28, left: 40 }

export default function TrendChart({ series, labels, bands = [], unit }: TrendChartProps) {
  const all = series.flatMap((s) => s.values)
  if (all.length < 2) {
    return <p className="cg-tools-muted">Add at least two readings to see a trend chart.</p>
  }

  const min = Math.floor((Math.min(...all) - 10) / 10) * 10
  const max = Math.ceil((Math.max(...all) + 10) / 10) * 10
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = labels.length
  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - ((v - min) / (max - min)) * innerH
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round(min + ((max - min) * i) / 4))
  const labelEvery = Math.max(1, Math.ceil(n / 6))

  return (
    <figure className="cg-trend">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Trend chart in ${unit}`}>
        {bands.map((b) => {
          const top = y(Math.min(b.to, max))
          const bottom = y(Math.max(b.from, min))
          if (bottom <= top) return null
          return (
            <rect
              key={`${b.from}-${b.to}`}
              x={PAD.left}
              y={top}
              width={innerW}
              height={bottom - top}
              fill={b.color}
            />
          )
        })}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="cg-trend-grid" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="cg-trend-tick">
              {t}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={`${l}-${i}`} x={x(i)} y={H - 8} textAnchor="middle" className="cg-trend-tick">
              {l}
            </text>
          ) : null,
        )}
        {series.map((s) => (
          <g key={s.label}>
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2}>
                <title>{`${s.label}: ${v} ${unit} — ${labels[i]}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <figcaption className="cg-trend-legend">
        {series.map((s) => (
          <span key={s.label}>
            <i style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </span>
        ))}
        <span className="cg-tools-muted">{unit}</span>
      </figcaption>
    </figure>
  )
}
