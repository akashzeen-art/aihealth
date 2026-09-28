import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assistantPath, type AssistantSlug } from '../../utils/assistants'

type Hotspot = {
  id: string
  slug: AssistantSlug
  label: string
  hint: string
  cx: number
  cy: number
  r: number
  pct: number
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'translator',
    slug: 'translator',
    label: 'Health Translator',
    hint: 'Plain-language medical terms',
    cx: 160,
    cy: 48,
    r: 14,
    pct: 92,
  },
  {
    id: 'health',
    slug: 'health',
    label: 'Health Companion',
    hint: 'General questions & care guidance',
    cx: 160,
    cy: 120,
    r: 16,
    pct: 87,
  },
  {
    id: 'first-aid',
    slug: 'first-aid',
    label: 'First-Aid Guide',
    hint: 'Safety-first emergency steps',
    cx: 102,
    cy: 155,
    r: 14,
    pct: 74,
  },
  {
    id: 'document-reader',
    slug: 'document-reader',
    label: 'Document Reader',
    hint: 'Explain reports & prescriptions',
    cx: 218,
    cy: 155,
    r: 14,
    pct: 68,
  },
  {
    id: 'mother-baby',
    slug: 'mother-baby',
    label: 'Mother & Baby',
    hint: 'Pregnancy & newborn education',
    cx: 160,
    cy: 178,
    r: 14,
    pct: 81,
  },
  {
    id: 'nutrition',
    slug: 'nutrition',
    label: 'Nutrition Coach',
    hint: 'Local foods & meal ideas',
    cx: 160,
    cy: 235,
    r: 14,
    pct: 76,
  },
]

export default function BodyMap() {
  const navigate = useNavigate()
  const [active, setActive] = useState<string | null>('health')
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const current = useMemo(
    () => HOTSPOTS.find((h) => h.id === active) ?? HOTSPOTS[1],
    [active],
  )

  return (
    <section className="glass-panel body-map is-interactive home-stagger" aria-label="Explore assistants on body map">
      <header className="body-map-head">
        <h2>Care map</h2>
        <p>Hover a glow, then open the assistant — educational only.</p>
      </header>

      <div
        className="body-map-stage"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8
          setTilt({ x, y })
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="body-map-scan" aria-hidden="true" />
        <div className="body-map-orbits" aria-hidden="true" />

        <svg
          className="body-map-svg"
          viewBox="0 0 320 360"
          style={{
            transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
          role="img"
          aria-label="Interactive body silhouette with six assistant hotspots"
        >
          <defs>
            <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#64748b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.55" />
            </linearGradient>
            <radialGradient id="hotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="1" />
              <stop offset="55%" stopColor="#f97316" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse cx="160" cy="46" rx="30" ry="36" fill="url(#bodyFill)" stroke="#e2e8f0" strokeWidth="1.5" />
          <path
            d="M116 86
               C108 98 102 120 98 150
               C94 188 96 232 102 272
               C106 298 116 322 128 342
               L148 342
               C146 300 148 268 150 248
               L170 248
               C172 268 174 300 172 342
               L192 342
               C204 322 214 298 218 272
               C224 232 226 188 222 150
               C218 120 212 98 204 86
               C192 76 172 72 160 72
               C148 72 128 76 116 86 Z"
            fill="url(#bodyFill)"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            filter="url(#softGlow)"
          />
          <path
            d="M116 98 C86 122 64 150 52 182 C44 205 42 228 48 248"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M204 98 C234 122 256 150 268 182 C276 205 278 228 272 248"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.5"
          />
          <ellipse cx="144" cy="124" rx="20" ry="24" fill="#38bdf8" opacity="0.4" className="body-map-organ" />
          <ellipse cx="176" cy="124" rx="20" ry="24" fill="#38bdf8" opacity="0.4" className="body-map-organ" />
          <ellipse cx="160" cy="156" rx="15" ry="13" fill="#fb7185" opacity="0.55" className="body-map-organ heart" />

          {HOTSPOTS.map((h) => {
            const isOn = active === h.id
            return (
              <g
                key={h.id}
                className={`body-map-node ${isOn ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(h.id)}
                onFocus={() => setActive(h.id)}
                onClick={() => navigate(assistantPath(h.slug))}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={h.cx} cy={h.cy} r={isOn ? h.r + 14 : h.r + 8} fill="url(#hotGlow)" className="body-map-glow" />
                <circle
                  cx={h.cx}
                  cy={h.cy}
                  r={h.r}
                  className="body-map-hotspot"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${h.label}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(assistantPath(h.slug))
                    }
                  }}
                />
                <text x={h.cx + (h.cx < 140 ? -28 : h.cx > 180 ? 28 : 0)} y={h.cy - h.r - 8} textAnchor="middle" className="body-map-pct">
                  {h.pct}%
                </text>
              </g>
            )
          })}
        </svg>

        <div className={`body-map-popover ${current ? 'is-open' : ''}`}>
          <p className="body-map-popover-kicker">Selected</p>
          <h3>{current.label}</h3>
          <p>{current.hint}</p>
          <Link to={assistantPath(current.slug)} className="body-map-popover-btn">
            Start Assistant
          </Link>
        </div>
      </div>
    </section>
  )
}
