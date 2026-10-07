import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dueReminders, markReminderFired, REMINDER_KIND_LABELS, type Reminder } from '../../local/healthTools'
import { BRAND } from '../../brand'
import '../../styles/tools.css'

const CHECK_INTERVAL_MS = 30_000

export default function ReminderAlerts() {
  const [alerts, setAlerts] = useState<Reminder[]>([])

  useEffect(() => {
    const check = () => {
      const due = dueReminders()
      if (!due.length) return
      const now = new Date()
      for (const r of due) {
        markReminderFired(r.id, now)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(`${BRAND.name}: ${REMINDER_KIND_LABELS[r.kind]} reminder`, {
              body: r.notes ? `${r.title}\n${r.notes}` : r.title,
              tag: r.id,
              icon: '/images/careplus-logo.png',
            })
          } catch {
            /* some browsers only allow notifications from a service worker */
          }
        }
      }
      setAlerts((prev) => [...prev, ...due.filter((d) => !prev.some((p) => p.id === d.id))])
    }
    check()
    const id = window.setInterval(check, CHECK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  if (!alerts.length) return null

  return (
    <div className="cg-reminder-alerts" role="region" aria-label="Due reminders" aria-live="assertive">
      {alerts.map((r) => (
        <div key={r.id} className={`cg-reminder-alert is-${r.kind}`}>
          <span className="cg-reminder-alert-kind">{REMINDER_KIND_LABELS[r.kind]} reminder</span>
          <strong>{r.title}</strong>
          {r.notes ? <p>{r.notes}</p> : null}
          <div className="cg-reminder-alert-actions">
            <button
              type="button"
              className="cg-btn cg-btn-primary cg-btn-sm"
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== r.id))}
            >
              {r.kind === 'medication' ? 'Taken' : 'Done'}
            </button>
            <Link
              to="/reminders"
              className="cg-btn cg-btn-ghost cg-btn-sm"
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== r.id))}
            >
              View reminders
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
