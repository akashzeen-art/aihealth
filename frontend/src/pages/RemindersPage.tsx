import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/tools.css'
import {
  addReminder,
  addReminders,
  buildChildVisitReminders,
  deleteReminder,
  nextOccurrence,
  REMINDER_KIND_LABELS,
  toggleReminder,
  toYmd,
  type Reminder,
  type ReminderKind,
  type ReminderRepeat,
} from '../local/healthTools'
import { useToolsData } from '../hooks/useToolsData'
import VaccinationChart from '../components/tools/VaccinationChart'
import { assistantPath } from '../utils/assistants'
import { getErrorMessage } from '../utils/errors'

const KINDS = Object.keys(REMINDER_KIND_LABELS) as ReminderKind[]

const TITLE_PLACEHOLDER: Record<ReminderKind, string> = {
  medication: 'e.g. Metformin 500 mg — 1 tablet',
  appointment: 'e.g. Follow-up with Dr. Rao',
  vaccination: "e.g. Aarav's 9-month vaccination",
  measurement: 'e.g. Check blood pressure',
  other: 'e.g. Drink water',
}

function formatNext(r: Reminder): string {
  const next = nextOccurrence(r)
  if (!next) return r.lastFiredAt ? 'Done' : 'Passed'
  return next.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function repeatLabel(r: Reminder): string {
  if (r.repeat === 'daily') return `Daily at ${r.time}`
  if (r.repeat === 'weekly') {
    const day = new Date(`${r.date}T00:00`).toLocaleDateString(undefined, { weekday: 'long' })
    return `Every ${day} at ${r.time}`
  }
  return `Once — ${r.date} at ${r.time}`
}

export default function RemindersPage() {
  const { hash } = useLocation()
  const initialKind = (KINDS.find((k) => `#${k}` === hash) ?? 'medication') as ReminderKind
  const { reminders } = useToolsData()

  const [kind, setKind] = useState<ReminderKind>(initialKind)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('08:00')
  const [date, setDate] = useState(() => toYmd(new Date()))
  const [repeat, setRepeat] = useState<ReminderRepeat>(initialKind === 'medication' ? 'daily' : 'once')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const [childName, setChildName] = useState('')
  const [childDob, setChildDob] = useState('')
  const [childStatus, setChildStatus] = useState('')

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )

  useEffect(() => {
    const target = hash === '#vaccination' ? 'child-schedule' : hash === '#vaccination-chart' ? 'vaccination-chart' : null
    if (target) {
      window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 150)
    }
  }, [hash])

  const grouped = useMemo(() => {
    const sorted = [...reminders].sort((a, b) => {
      const na = nextOccurrence(a)?.getTime() ?? Infinity
      const nb = nextOccurrence(b)?.getTime() ?? Infinity
      return na - nb
    })
    return KINDS.map((k) => ({ kind: k, items: sorted.filter((r) => r.kind === k) })).filter(
      (g) => g.items.length > 0,
    )
  }, [reminders])

  function handleKind(next: ReminderKind) {
    setKind(next)
    setRepeat(next === 'medication' || next === 'measurement' ? 'daily' : 'once')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('')
    if (title.trim().length < 2) {
      setError('Please add a short title for this reminder.')
      return
    }
    try {
      addReminder({ kind, title, time, date, repeat, notes })
      setTitle('')
      setNotes('')
      setStatus('Reminder saved.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save reminder'))
    }
  }

  function handleChildSchedule(e: FormEvent) {
    e.preventDefault()
    setChildStatus('')
    if (!childDob) {
      setChildStatus("Please enter the child's date of birth.")
      return
    }
    const items = buildChildVisitReminders(childName, childDob)
    if (!items.length) {
      setChildStatus('All standard visit ages for this birth date have already passed.')
      return
    }
    addReminders(items)
    setChildStatus(`Added ${items.length} upcoming vaccination visit reminders.`)
  }

  async function enableNotifications() {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  return (
    <div className="page-pad cg-tools-page animate-fade-up">
      <header className="cg-tools-hero">
        <p className="cg-tools-kicker">Health Reminder</p>
        <h1>Reminders</h1>
        <p className="cg-tools-lead">
          Medication, appointment, vaccination and measurement reminders for you and your family.
          Reminders pop up while Care+ is open in your browser.
        </p>
        <div className="cg-tools-hero-actions">
          {permission === 'granted' ? (
            <span className="cg-tools-pill is-ok">Browser notifications on</span>
          ) : permission === 'unsupported' ? (
            <span className="cg-tools-pill">In-app reminders only (notifications unsupported)</span>
          ) : permission === 'denied' ? (
            <span className="cg-tools-pill is-warn">
              Notifications blocked — allow them in your browser settings
            </span>
          ) : (
            <button type="button" className="cg-btn cg-btn-primary cg-btn-sm" onClick={() => void enableNotifications()}>
              Enable browser notifications
            </button>
          )}
          <Link to={assistantPath('reminders')} className="cg-btn cg-btn-secondary cg-btn-sm">
            Plan with the Reminder assistant
          </Link>
        </div>
      </header>

      <div className="cg-tools-grid">
        <section className="cg-tools-card" aria-labelledby="new-reminder">
          <h2 id="new-reminder">New reminder</h2>
          <div className="cg-tools-segment" role="radiogroup" aria-label="Reminder type">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                className={kind === k ? 'is-active' : ''}
                onClick={() => handleKind(k)}
              >
                {REMINDER_KIND_LABELS[k]}
              </button>
            ))}
          </div>

          <form className="cg-tools-form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={TITLE_PLACEHOLDER[kind]}
                maxLength={120}
              />
            </label>
            <div className="cg-tools-row">
              <label>
                <span>Time</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </label>
              <label>
                <span>Repeat</span>
                <select value={repeat} onChange={(e) => setRepeat(e.target.value as ReminderRepeat)}>
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              <label>
                <span>{repeat === 'once' ? 'Date' : 'Starting'}</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </label>
            </div>
            <label>
              <span>Notes (optional)</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={kind === 'medication' ? 'e.g. Take after food' : 'Anything to remember'}
                maxLength={200}
              />
            </label>
            {error ? <p className="cg-tools-error" role="alert">{error}</p> : null}
            {status ? <p className="cg-tools-status" role="status">{status}</p> : null}
            <button type="submit" className="cg-btn cg-btn-primary">
              Save reminder
            </button>
          </form>
        </section>

        <section id="child-schedule" className="cg-tools-card" aria-labelledby="child-visits">
          <h2 id="child-visits">Child vaccination visits</h2>
          <p className="cg-tools-muted">
            Enter your child&apos;s date of birth to see the dates on the vaccination chart below and
            add reminders for each upcoming visit. Schedules vary by country — always follow your
            clinic&apos;s vaccination card.
          </p>
          <form className="cg-tools-form" onSubmit={handleChildSchedule}>
            <div className="cg-tools-row">
              <label>
                <span>Child&apos;s name</span>
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Aarav"
                  maxLength={40}
                />
              </label>
              <label>
                <span>Date of birth</span>
                <input
                  type="date"
                  value={childDob}
                  max={toYmd(new Date())}
                  onChange={(e) => setChildDob(e.target.value)}
                />
              </label>
            </div>
            {childStatus ? <p className="cg-tools-status" role="status">{childStatus}</p> : null}
            <button type="submit" className="cg-btn cg-btn-secondary">
              Add visit reminders
            </button>
          </form>
          <Link to={assistantPath('child-health')} className="cg-tools-link">
            Ask the Child Health assistant about vaccinations →
          </Link>
        </section>
      </div>

      <section id="vaccination-chart" className="cg-tools-card" aria-labelledby="vaccination-chart-title">
        <h2 id="vaccination-chart-title">Child vaccination chart — birth to 5 years</h2>
        <p className="cg-tools-muted">
          {childDob
            ? `Showing approximate dates for ${childName.trim() || 'your child'}. Tap an age to jump to it.`
            : 'Follow the flow from birth to 5 years. Add a date of birth above to see dates and what is due now.'}
        </p>
        <VaccinationChart birthDate={childDob} childName={childName} />
      </section>

      <section className="cg-tools-card cg-tools-list-card" aria-labelledby="your-reminders">
        <h2 id="your-reminders">Your reminders</h2>
        {grouped.length === 0 ? (
          <p className="cg-tools-muted">No reminders yet. Add your first one above.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.kind} className="cg-tools-group">
              <h3>{REMINDER_KIND_LABELS[group.kind]}</h3>
              <ul className="cg-reminder-list">
                {group.items.map((r) => (
                  <li key={r.id} className={r.active ? '' : 'is-paused'}>
                    <div className="cg-reminder-main">
                      <strong>{r.title}</strong>
                      <span>{repeatLabel(r)}</span>
                      {r.notes ? <em>{r.notes}</em> : null}
                    </div>
                    <div className="cg-reminder-next">
                      <span>Next</span>
                      <strong>{r.active ? formatNext(r) : 'Paused'}</strong>
                    </div>
                    <div className="cg-reminder-actions">
                      <button
                        type="button"
                        className="cg-btn cg-btn-ghost cg-btn-sm"
                        onClick={() => toggleReminder(r.id)}
                      >
                        {r.active ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        type="button"
                        className="cg-btn cg-btn-ghost cg-btn-sm cg-tools-danger"
                        onClick={() => deleteReminder(r.id)}
                        aria-label={`Delete ${r.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
