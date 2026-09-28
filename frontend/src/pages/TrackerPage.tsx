import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/tools.css'
import TrendChart from '../components/tools/TrendChart'
import {
  addBp,
  addGlucose,
  bpCategory,
  bpStats,
  deleteBp,
  deleteGlucose,
  GLUCOSE_CONTEXT_LABELS,
  glucoseCategory,
  glucoseStats,
  type GlucoseContext,
} from '../local/healthTools'
import { useToolsData } from '../hooks/useToolsData'
import { assistantPath } from '../utils/assistants'
import { getErrorMessage } from '../utils/errors'

type Tab = 'bp' | 'glucose'

function nowLocalInput(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TrackerPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'glucose' ? 'glucose' : 'bp'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })

  return (
    <div className="page-pad cg-tools-page animate-fade-up">
      <header className="cg-tools-hero">
        <p className="cg-tools-kicker">Health Tracker</p>
        <h1>Track your readings</h1>
        <p className="cg-tools-lead">
          Log blood pressure and blood glucose, watch your trends, and ask a coach to explain them in
          plain language. Categories are general education — your clinician sets your personal
          targets.
        </p>
      </header>

      <div className="cg-tools-tabs" role="tablist" aria-label="Tracker">
        <button type="button" role="tab" aria-selected={tab === 'bp'} className={tab === 'bp' ? 'is-active' : ''} onClick={() => setTab('bp')}>
          Blood pressure
        </button>
        <button type="button" role="tab" aria-selected={tab === 'glucose'} className={tab === 'glucose' ? 'is-active' : ''} onClick={() => setTab('glucose')}>
          Blood glucose
        </button>
      </div>

      {tab === 'bp' ? <BpTracker /> : <GlucoseTracker />}
    </div>
  )
}

function BpTracker() {
  const navigate = useNavigate()
  const { bp } = useToolsData()
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [pulse, setPulse] = useState('')
  const [takenAt, setTakenAt] = useState(nowLocalInput)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [alert, setAlert] = useState('')

  const sorted = [...bp].sort((a, b) => b.takenAt.localeCompare(a.takenAt))
  const chartData = [...sorted].slice(0, 30).reverse()
  const s7 = bpStats(sorted, 7)
  const latest = sorted[0]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setAlert('')
    const s = Number(sys)
    const d = Number(dia)
    const p = pulse ? Number(pulse) : undefined
    if (!Number.isFinite(s) || !Number.isFinite(d) || s < 60 || s > 260 || d < 30 || d > 160 || s <= d) {
      setError('Enter a valid reading — systolic 60–260 and diastolic 30–160, with systolic higher.')
      return
    }
    if (p !== undefined && (p < 30 || p > 220)) {
      setError('Pulse should be between 30 and 220.')
      return
    }
    try {
      addBp({ systolic: s, diastolic: d, pulse: p, note: note.trim() || undefined, takenAt: new Date(takenAt).toISOString() })
      if (bpCategory(s, d).level === 'severe') {
        setAlert(
          'This reading is 180/120 or higher. Rest for 5 minutes and measure again. If it stays this high, or you have chest pain, shortness of breath, weakness, vision or speech changes, call emergency services now.',
        )
      }
      setSys('')
      setDia('')
      setPulse('')
      setNote('')
      setTakenAt(nowLocalInput())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save reading'))
    }
  }

  return (
    <>
      <div className="cg-tools-stats">
        <Stat label="Latest" value={latest ? `${latest.systolic}/${latest.diastolic}` : '—'} sub={latest ? bpCategory(latest.systolic, latest.diastolic).label : 'No readings'} />
        <Stat label="7-day average" value={s7.count ? `${s7.sys}/${s7.dia}` : '—'} sub={s7.count ? bpCategory(s7.sys, s7.dia).label : 'No recent readings'} />
        <Stat label="Readings (7 days)" value={String(s7.count)} sub={`${sorted.length} total`} />
      </div>

      <div className="cg-tools-grid">
        <section className="cg-tools-card" aria-labelledby="bp-new">
          <h2 id="bp-new">Log a reading</h2>
          <form className="cg-tools-form" onSubmit={handleSubmit}>
            <div className="cg-tools-row">
              <label>
                <span>Systolic (top)</span>
                <input inputMode="numeric" value={sys} onChange={(e) => setSys(e.target.value.replace(/\D/g, ''))} placeholder="120" required />
              </label>
              <label>
                <span>Diastolic (bottom)</span>
                <input inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, ''))} placeholder="80" required />
              </label>
              <label>
                <span>Pulse (optional)</span>
                <input inputMode="numeric" value={pulse} onChange={(e) => setPulse(e.target.value.replace(/\D/g, ''))} placeholder="72" />
              </label>
            </div>
            <div className="cg-tools-row">
              <label>
                <span>Date &amp; time</span>
                <input type="datetime-local" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} required />
              </label>
              <label>
                <span>Note (optional)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. after walk" maxLength={120} />
              </label>
            </div>
            {error ? <p className="cg-tools-error" role="alert">{error}</p> : null}
            {alert ? <p className="cg-tools-alert" role="alert">{alert}</p> : null}
            <button type="submit" className="cg-btn cg-btn-primary">Save reading</button>
          </form>
          <p className="cg-tools-muted cg-tools-tip">
            Tip: sit quietly for 5 minutes, back supported, feet flat, arm at heart level. Take two
            readings a minute apart.
          </p>
        </section>

        <section className="cg-tools-card" aria-labelledby="bp-trend">
          <div className="cg-tools-card-head">
            <h2 id="bp-trend">Trend</h2>
            <button
              type="button"
              className="cg-btn cg-btn-secondary cg-btn-sm"
              disabled={!sorted.length}
              onClick={() => navigate(assistantPath('blood-pressure'), { state: { starter: 'Please explain my blood pressure trends from my log.' } })}
            >
              Explain my trends
            </button>
          </div>
          <TrendChart
            unit="mmHg"
            labels={chartData.map((r) => shortDate(r.takenAt))}
            series={[
              { label: 'Systolic', color: '#e0445a', values: chartData.map((r) => r.systolic) },
              { label: 'Diastolic', color: '#1e6fd9', values: chartData.map((r) => r.diastolic) },
            ]}
            bands={[
              { from: 0, to: 120, color: 'rgba(22,163,106,0.06)' },
              { from: 140, to: 400, color: 'rgba(224,68,90,0.06)' },
            ]}
          />
        </section>
      </div>

      <ReadingsTable
        empty="No blood pressure readings yet."
        head={['When', 'Reading', 'Pulse', 'Category', 'Note', '']}
        rows={sorted.map((r) => {
          const cat = bpCategory(r.systolic, r.diastolic)
          return {
            id: r.id,
            cells: [
              fullDate(r.takenAt),
              <strong key="v">{`${r.systolic}/${r.diastolic}`}</strong>,
              r.pulse ?? '—',
              <span key="c" className={`cg-level is-${cat.level}`}>{cat.label}</span>,
              r.note ?? '',
            ],
            onDelete: () => deleteBp(r.id),
          }
        })}
      />
      <CoachLinks slug="blood-pressure" name="Blood Pressure Coach" />
    </>
  )
}

function GlucoseTracker() {
  const navigate = useNavigate()
  const { glucose } = useToolsData()
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState<'mgdl' | 'mmol'>('mgdl')
  const [context, setContext] = useState<GlucoseContext>('fasting')
  const [takenAt, setTakenAt] = useState(nowLocalInput)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [alert, setAlert] = useState('')

  const sorted = [...glucose].sort((a, b) => b.takenAt.localeCompare(a.takenAt))
  const chartData = [...sorted].slice(0, 30).reverse()
  const s7 = glucoseStats(sorted, 7)
  const latest = sorted[0]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setAlert('')
    const raw = Number(value)
    const mg = Math.round(unit === 'mmol' ? raw * 18 : raw)
    if (!Number.isFinite(raw) || mg < 20 || mg > 600) {
      setError(unit === 'mmol' ? 'Enter a value between 1.1 and 33 mmol/L.' : 'Enter a value between 20 and 600 mg/dL.')
      return
    }
    try {
      addGlucose({ value: mg, context, note: note.trim() || undefined, takenAt: new Date(takenAt).toISOString() })
      if (mg < 70) {
        setAlert(
          mg < 54
            ? 'This is a very low reading. Take fast-acting sugar now and get urgent help if you feel confused, drowsy or faint.'
            : 'This is a low reading. General guidance: take 15 g of fast-acting sugar (e.g. juice or glucose tablets), recheck in 15 minutes, and follow your care plan.',
        )
      } else if (mg > 300) {
        setAlert('This is a very high reading. Seek urgent care if you have vomiting, drowsiness, deep breathing or confusion, and contact your care team.')
      }
      setValue('')
      setNote('')
      setTakenAt(nowLocalInput())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save reading'))
    }
  }

  return (
    <>
      <div className="cg-tools-stats">
        <Stat label="Latest" value={latest ? `${latest.value}` : '—'} sub={latest ? `${GLUCOSE_CONTEXT_LABELS[latest.context]} · ${glucoseCategory(latest.value, latest.context).label}` : 'No readings'} />
        <Stat label="7-day average" value={s7.count ? String(s7.avg) : '—'} sub={s7.fasting ? `Fasting avg ${s7.fasting}` : 'mg/dL'} />
        <Stat label="Lows / highs (7 days)" value={`${s7.lows} / ${s7.highs}`} sub={`${s7.count} readings`} />
      </div>

      <div className="cg-tools-grid">
        <section className="cg-tools-card" aria-labelledby="glu-new">
          <h2 id="glu-new">Log a reading</h2>
          <form className="cg-tools-form" onSubmit={handleSubmit}>
            <div className="cg-tools-row">
              <label>
                <span>Glucose</span>
                <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ''))} placeholder={unit === 'mmol' ? '5.6' : '100'} required />
              </label>
              <label>
                <span>Unit</span>
                <select value={unit} onChange={(e) => setUnit(e.target.value as 'mgdl' | 'mmol')}>
                  <option value="mgdl">mg/dL</option>
                  <option value="mmol">mmol/L</option>
                </select>
              </label>
              <label>
                <span>When</span>
                <select value={context} onChange={(e) => setContext(e.target.value as GlucoseContext)}>
                  {(Object.keys(GLUCOSE_CONTEXT_LABELS) as GlucoseContext[]).map((c) => (
                    <option key={c} value={c}>{GLUCOSE_CONTEXT_LABELS[c]}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="cg-tools-row">
              <label>
                <span>Date &amp; time</span>
                <input type="datetime-local" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} required />
              </label>
              <label>
                <span>Note (optional)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. rice for lunch" maxLength={120} />
              </label>
            </div>
            {error ? <p className="cg-tools-error" role="alert">{error}</p> : null}
            {alert ? <p className="cg-tools-alert" role="alert">{alert}</p> : null}
            <button type="submit" className="cg-btn cg-btn-primary">Save reading</button>
          </form>
          <p className="cg-tools-muted cg-tools-tip">Readings are stored in mg/dL (1 mmol/L = 18 mg/dL).</p>
        </section>

        <section className="cg-tools-card" aria-labelledby="glu-trend">
          <div className="cg-tools-card-head">
            <h2 id="glu-trend">Trend</h2>
            <button
              type="button"
              className="cg-btn cg-btn-secondary cg-btn-sm"
              disabled={!sorted.length}
              onClick={() => navigate(assistantPath('diabetes'), { state: { starter: 'Please explain my glucose trends from my log.' } })}
            >
              Explain my trends
            </button>
          </div>
          <TrendChart
            unit="mg/dL"
            labels={chartData.map((r) => shortDate(r.takenAt))}
            series={[{ label: 'Glucose', color: '#16a36a', values: chartData.map((r) => r.value) }]}
            bands={[
              { from: 0, to: 70, color: 'rgba(224,68,90,0.07)' },
              { from: 70, to: 140, color: 'rgba(22,163,106,0.06)' },
              { from: 180, to: 700, color: 'rgba(224,68,90,0.06)' },
            ]}
          />
        </section>
      </div>

      <ReadingsTable
        empty="No glucose readings yet."
        head={['When', 'mg/dL', 'mmol/L', 'Timing', 'Category', 'Note', '']}
        rows={sorted.map((r) => {
          const cat = glucoseCategory(r.value, r.context)
          return {
            id: r.id,
            cells: [
              fullDate(r.takenAt),
              <strong key="v">{r.value}</strong>,
              (r.value / 18).toFixed(1),
              GLUCOSE_CONTEXT_LABELS[r.context],
              <span key="c" className={`cg-level is-${cat.level}`}>{cat.label}</span>,
              r.note ?? '',
            ],
            onDelete: () => deleteGlucose(r.id),
          }
        })}
      />
      <CoachLinks slug="diabetes" name="Diabetes Coach" />
    </>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="cg-tools-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{sub}</em>
    </div>
  )
}

function ReadingsTable({
  head,
  rows,
  empty,
}: {
  head: string[]
  rows: { id: string; cells: ReactNode[]; onDelete: () => void }[]
  empty: string
}) {
  return (
    <section className="cg-tools-card cg-tools-list-card" aria-label="Readings">
      <h2>History</h2>
      {rows.length === 0 ? (
        <p className="cg-tools-muted">{empty}</p>
      ) : (
        <div className="cg-tools-table-wrap">
          <table className="cg-tools-table">
            <thead>
              <tr>
                {head.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                  <td>
                    <button type="button" className="cg-btn cg-btn-ghost cg-btn-sm cg-tools-danger" onClick={row.onDelete}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function CoachLinks({ slug, name }: { slug: 'blood-pressure' | 'diabetes'; name: string }) {
  return (
    <p className="cg-tools-footer">
      <Link to={assistantPath(slug)} className="cg-tools-link">Chat with the {name} →</Link>
      <Link to="/reminders#measurement" className="cg-tools-link">Set a measurement reminder →</Link>
    </p>
  )
}
