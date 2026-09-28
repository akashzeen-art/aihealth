import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import RevealSection from './RevealSection'
import { assistantIcons } from '../components/assistants/assistantIcons'
import {
  assistantPath,
  getAssistantBySlug,
  type AssistantCatalogItem,
  type AssistantSlug,
} from '../utils/assistants'

type Group = {
  id: string
  label: string
  items: { slug: AssistantSlug; color: string; image?: string }[]
}

const GROUPS: Group[] = [
  {
    id: 'everyday',
    label: 'Everyday care',
    items: [
      { slug: 'health', color: '#1e6fd9' },
      { slug: 'symptom-checker', color: '#e0445a' },
      { slug: 'first-aid', color: '#f0643c' },
      { slug: 'doctor-finder', color: '#0ea5b7' },
      { slug: 'translator', color: '#6d5bd0' },
    ],
  },
  {
    id: 'family',
    label: 'Family & wellbeing',
    items: [
      { slug: 'mother-baby', color: '#d9467e' },
      { slug: 'child-health', color: '#2f8fe0' },
      { slug: 'mental-wellness', color: '#7c5cd6' },
      { slug: 'nutrition', color: '#16a36a' },
      { slug: 'fitness', color: '#7cb342' },
    ],
  },
  {
    id: 'manage',
    label: 'Manage & track',
    items: [
      { slug: 'medication', color: '#5b6cdb' },
      { slug: 'diabetes', color: '#e4573d' },
      { slug: 'blood-pressure', color: '#c93b5b' },
      { slug: 'document-reader', color: '#3d6f8f' },
      { slug: 'reminders', color: '#0f9c8c' },
    ],
  },
]

export default function FeatureCards() {
  const navigate = useNavigate()
  const [groupId, setGroupId] = useState(GROUPS[0].id)
  const [active, setActive] = useState(0)
  const group = GROUPS.find((g) => g.id === groupId) ?? GROUPS[0]

  function open(item: AssistantCatalogItem) {
    navigate(assistantPath(item.slug))
  }

  return (
    <RevealSection id="features" variant="fade-up" className="lp-section lp-features">
      <div className="lp-shell">
        <header className="lp-section-head lp-section-head-center">
          <p className="lp-eyebrow">Features</p>
          <h2>15 AI health companions, one calm place</h2>
          <p className="lp-section-lead lp-feat-lead">
            From quick questions to tracking blood pressure — pick a card to see what each one does.
          </p>
        </header>

        <div className="lp-feat-tabs" role="tablist" aria-label="Feature groups">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={g.id === groupId}
              className={`lp-feat-tab${g.id === groupId ? ' is-active' : ''}`}
              onClick={() => {
                setGroupId(g.id)
                setActive(0)
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="lp-feat-options" role="tabpanel" aria-label={group.label}>
          {group.items.map((entry, i) => {
            const item = getAssistantBySlug(entry.slug)
            if (!item) return null
            const isActive = i === active
            return (
              <button
                key={item.slug}
                type="button"
                className={`lp-feat-option${isActive ? ' is-active' : ''}`}
                style={
                  {
                    '--feat-color': entry.color,
                    '--feat-bg': entry.image ? `url(${entry.image})` : undefined,
                  } as CSSProperties
                }
                aria-expanded={isActive}
                aria-label={isActive ? `Open ${item.name}` : item.name}
                onClick={() => (isActive ? open(item) : setActive(i))}
                onFocus={() => setActive(i)}
              >
                <span className="lp-feat-art" aria-hidden="true">
                  {assistantIcons[item.iconKey]}
                </span>
                <span className="lp-feat-top" aria-hidden={!isActive}>
                  <span className="lp-feat-desc">{item.description}</span>
                  <span className="lp-feat-cta">
                    Open assistant →
                  </span>
                </span>
                <span className="lp-feat-shadow" aria-hidden="true" />
                <span className="lp-feat-label">
                  <span className="lp-feat-icon" aria-hidden="true">
                    {assistantIcons[item.iconKey]}
                  </span>
                  <span className="lp-feat-info">
                    <span className="lp-feat-main">{item.name}</span>
                    <span className="lp-feat-sub">For {item.target}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </RevealSection>
  )
}
