import { useEffect, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listAssistants } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import DisclaimerBanner from '../components/common/DisclaimerBanner'
import ErrorMessage from '../components/common/ErrorMessage'
import ContentSkeleton from '../components/ai/ContentSkeleton'
import { assistantIcons } from '../components/assistants/assistantIcons'
import {
  ASSISTANT_CATALOG,
  assistantPath,
  type AssistantCatalogItem,
} from '../utils/assistants'
import { getExperience } from '../utils/assistantExperience'
import { useEngagementStore } from '../store/engagementStore'
import type { Assistant } from '../types'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'everyday', label: 'Everyday care' },
  { id: 'family', label: 'Family & mind' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'conditions', label: 'Conditions & meds' },
  { id: 'tools', label: 'Tools' },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

const CATEGORY_OF: Record<string, CategoryId> = {
  health: 'everyday',
  'symptom-checker': 'everyday',
  'first-aid': 'everyday',
  'doctor-finder': 'everyday',
  translator: 'everyday',
  'mother-baby': 'family',
  'child-health': 'family',
  'mental-wellness': 'family',
  nutrition: 'lifestyle',
  fitness: 'lifestyle',
  diabetes: 'conditions',
  'blood-pressure': 'conditions',
  medication: 'conditions',
  'document-reader': 'tools',
  reminders: 'tools',
}

const SEARCH_KEYWORDS: Record<string, string> = {
  health: 'general question body wellness prevention',
  'symptom-checker': 'pain fever cough headache sick symptoms triage',
  'first-aid': 'burn cut bleeding choking injury wound emergency',
  'doctor-finder': 'specialist clinic hospital appointment gp',
  translator: 'meaning term language translate hindi',
  'mother-baby': 'pregnancy pregnant newborn breastfeeding infant',
  'child-health': 'kid kids vaccine vaccination growth toddler',
  'mental-wellness': 'stress anxiety sleep mood depression calm',
  nutrition: 'food diet meal eating weight protein',
  fitness: 'exercise workout gym yoga walking training',
  diabetes: 'sugar glucose insulin hba1c blood sugar',
  'blood-pressure': 'bp hypertension heart pressure',
  medication: 'medicine pill tablet drug dose side effect',
  'document-reader': 'report lab prescription pdf upload scan',
  reminders: 'alarm schedule appointment refill notify',
}

const HERO_STATS = [
  { value: '15', label: 'Specialist assistants' },
  { value: '5', label: 'Languages' },
  { value: '24/7', label: 'Always available' },
  { value: '100%', label: 'Private to this browser' },
]

export default function AssistantsPage() {
  const navigate = useNavigate()
  const previewId = useId()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string>(ASSISTANT_CATALOG[0]?.slug ?? 'health')
  const [category, setCategory] = useState<CategoryId>('all')
  const [query, setQuery] = useState('')
  const favoriteAssistants = useEngagementStore((s) => s.favoriteAssistants)
  const toggleFavorite = useEngagementStore((s) => s.toggleFavoriteAssistant)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const data = await listAssistants({ signal: controller.signal })
        if (!controller.signal.aborted) setAssistants(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getErrorMessage(err, 'Could not load assistants'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  const catalogItems: AssistantCatalogItem[] = ASSISTANT_CATALOG
  const needle = query.trim().toLowerCase()
  const visibleItems = catalogItems.filter((item) => {
    if (category !== 'all' && CATEGORY_OF[item.slug] !== category) return false
    if (!needle) return true
    return [
      item.name,
      item.description,
      item.target,
      getExperience(item.slug).purpose,
      SEARCH_KEYWORDS[item.slug] ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  })
  const selected =
    visibleItems.find((c) => c.slug === selectedSlug) ??
    visibleItems[0] ??
    catalogItems.find((c) => c.slug === selectedSlug) ??
    catalogItems[0]
  const experience = getExperience(selected.slug)
  const selectedIcon =
    assistantIcons[selected.iconKey] ?? assistantIcons['heart-pulse']
  const isFavorite = favoriteAssistants.includes(selected.id)

  function startConversation(item: AssistantCatalogItem, starter?: string) {
    const path = assistantPath(item.slug)
    if (starter) {
      navigate(path, { state: { starter } })
      return
    }
    navigate(path)
  }

  function countFor(id: CategoryId) {
    if (id === 'all') return catalogItems.length
    return catalogItems.filter((item) => CATEGORY_OF[item.slug] === id).length
  }

  return (
    <div className="page-pad cg-asst-page animate-fade-up">
      <header className="cg-asst-hero">
        <div className="cg-asst-hero-orbs" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="cg-asst-hero-main">
          <p className="cg-asst-kicker">
            <span className="cg-asst-kicker-dot" aria-hidden="true" />
            Assistant ecosystem
          </p>
          <h1>
            Choose how you&apos;d like to <em>explore</em>
          </h1>
          <p className="cg-asst-lead">
            Fifteen focused AI companions — each one an expert in a single area of your health,
            all with the same calm, educational boundaries.
          </p>

          <label className="cg-asst-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Search assistants</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search — e.g. sugar, pregnancy, sleep, workout…"
            />
          </label>
        </div>

        <ul className="cg-asst-stats">
          {HERO_STATS.map((stat) => (
            <li key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </header>

      <DisclaimerBanner />

      {loading ? <ContentSkeleton variant="cards" /> : null}
      <ErrorMessage>{error}</ErrorMessage>

      {!loading && !error ? (
        <>
          <div className="cg-asst-filters" role="tablist" aria-label="Assistant categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`cg-asst-filter${category === cat.id ? ' is-active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
                <span>{countFor(cat.id)}</span>
              </button>
            ))}
          </div>

          <div className="cg-asst-layout">
            {visibleItems.length === 0 ? (
              <div className="cg-asst-empty">
                <strong>No assistant matches “{query}”.</strong>
                <span>Try another word, or ask the Health Assistant.</span>
                <button
                  type="button"
                  className="cg-btn cg-btn-secondary"
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                  }}
                >
                  Show all assistants
                </button>
              </div>
            ) : (
              <div className="cg-asst-grid" role="list" aria-label="CareGuide assistants">
                {visibleItems.map((item, index) => {
                  const live = assistants.find((a) => a.id === item.id)
                  const icon = assistantIcons[item.iconKey] ?? assistantIcons['heart-pulse']
                  const isSelected = selected.slug === item.slug
                  const purpose = getExperience(item.slug).purpose
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="listitem"
                      className={[
                        'cg-asst-card',
                        `accent-${item.accent}`,
                        isSelected ? 'is-selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ animationDelay: `${index * 35}ms` }}
                      aria-pressed={isSelected}
                      aria-controls={previewId}
                      onClick={() => setSelectedSlug(item.slug)}
                      onDoubleClick={() => startConversation(item)}
                    >
                      <span className="cg-asst-card-top">
                        <span className="cg-asst-card-icon" aria-hidden="true">
                          {icon}
                        </span>
                        <span className="cg-asst-card-for">{item.target}</span>
                      </span>
                      <strong className="cg-asst-card-name">{item.name}</strong>
                      <span className="cg-asst-card-purpose">{purpose}</span>
                      <span className="cg-asst-card-foot">
                        {live?.supportsDocuments || item.supportsDocuments ? (
                          <em className="cg-asst-card-tag">Uploads</em>
                        ) : null}
                        {item.tool ? <em className="cg-asst-card-tag">Tracker tool</em> : null}
                        {favoriteAssistants.includes(item.id) ? (
                          <em className="cg-asst-card-tag is-fav">★ Favorite</em>
                        ) : null}
                        <span className="cg-asst-card-arrow" aria-hidden="true">
                          →
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <aside
              id={previewId}
              key={selected.slug}
              className={`cg-asst-preview accent-${selected.accent}`}
              aria-live="polite"
            >
              <div className="cg-asst-preview-band">
                <span className="cg-asst-preview-icon" aria-hidden="true">
                  {selectedIcon}
                </span>
                <div className="cg-asst-preview-title">
                  <p className="cg-asst-preview-label">For {selected.target.toLowerCase()}</p>
                  <h2>{selected.name}</h2>
                </div>
                <button
                  type="button"
                  className={`cg-asst-fav${isFavorite ? ' is-active' : ''}`}
                  onClick={() => toggleFavorite(selected.id)}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? '★' : '☆'}
                </button>
              </div>

              <div className="cg-asst-preview-body">
                <p className="cg-asst-preview-purpose">{experience.purpose}</p>
                <p className="cg-asst-preview-desc">{selected.description}</p>

                <div className="cg-asst-starters">
                  <h3>Try asking</h3>
                  <ul>
                    {experience.starters.map((starter) => (
                      <li key={starter}>
                        <button
                          type="button"
                          className="cg-asst-starter"
                          onClick={() => startConversation(selected, starter)}
                        >
                          <span className="cg-asst-starter-q" aria-hidden="true">
                            ?
                          </span>
                          <span className="cg-asst-starter-text">{starter}</span>
                          <span className="cg-asst-starter-go" aria-hidden="true">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="cg-asst-safety">
                  <span aria-hidden="true">🛡</span>
                  {selected.safetyInfo}
                </p>

                <div className="cg-asst-actions">
                  <button
                    type="button"
                    className="cg-asst-cta"
                    onClick={() => startConversation(selected)}
                  >
                    Start conversation
                    <span aria-hidden="true">→</span>
                  </button>
                  {selected.tool ? (
                    <Link to={selected.tool.to} className="cg-btn cg-btn-secondary cg-btn-block">
                      {selected.tool.label}
                    </Link>
                  ) : selected.supportsDocuments ? (
                    <Link to="/document-reader" className="cg-btn cg-btn-secondary cg-btn-block">
                      Open Document Reader
                    </Link>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : null}

      <p className="cg-asst-footnote">
        Tip: double-click any card to jump straight into a conversation. Prefer documents?{' '}
        <Link to="/document-reader" className="cg-asst-footnote-link">
          Open Document Reader
        </Link>
      </p>
    </div>
  )
}
