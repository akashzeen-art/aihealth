import { Link } from 'react-router-dom'

const ACTIONS = [
  {
    title: 'Ask a general health question',
    detail: 'Get plain-language education and when to seek care.',
    impact: 'Guide',
    to: '/assistant/health',
    mark: 'H',
  },
  {
    title: 'Review first-aid steps',
    detail: 'Safety-first actions for common emergencies.',
    impact: 'Urgent',
    to: '/assistant/first-aid',
    mark: 'F',
  },
  {
    title: 'Plan a balanced plate',
    detail: 'Local-food ideas matched to your preferences.',
    impact: '+habits',
    to: '/assistant/nutrition',
    mark: 'N',
  },
]

export default function LifestyleActions() {
  return (
    <section className="glass-panel lifestyle-actions home-stagger" aria-label="Suggested next steps">
      <h2>Lifestyle actions</h2>
      <ul className="lifestyle-actions-list">
        {ACTIONS.map((a) => (
          <li key={a.to}>
            <Link to={a.to} className="lifestyle-action-item">
              <span className="lifestyle-action-icon" aria-hidden="true">
                {a.mark}
              </span>
              <span className="lifestyle-action-text">
                <strong>{a.title}</strong>
                <span>{a.detail}</span>
              </span>
              <span className="lifestyle-action-impact">{a.impact}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
