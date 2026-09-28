import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSystemStatus, listConversations, listDocuments } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import DisclaimerBanner from '../components/common/DisclaimerBanner'
import ContentSkeleton from '../components/ai/ContentSkeleton'
import EmptyState from '../components/ai/EmptyState'
import FeatureCards from '../landing/FeatureCards'
import HowItWorks from '../landing/HowItWorks'
import LanguageShowcase from '../landing/LanguageShowcase'
import SafetySection from '../landing/SafetySection'
import { BRAND } from '../brand'
import { useAuthStore } from '../store/authStore'
import { useEngagementStore } from '../store/engagementStore'
import { assistantPath, getAssistantById, type AssistantSlug } from '../utils/assistants'
import {
  dayAtmosphere,
  displayConversationTitle,
  greetingForNow,
  languageLabel,
} from '../utils/assistantExperience'
import { weeklyRecapStats } from '../utils/engagement'
import { GUIDED_JOURNEYS } from '../utils/journeys'
import { formatDate } from '../utils/format'
import { DashIcon } from '../components/dashboard/dashIcons'
import type { ConversationSummary, DocumentItem } from '../types'
import type { SystemStatus } from '../services/systemService'

const QUICK_ACTIONS = [
  {
    label: 'Explain simply',
    to: '/assistant/health',
    starter: 'Explain a health term simply',
    icon: 'spark' as const,
  },
  {
    label: 'Translate a term',
    to: '/assistant/translator',
    starter: 'Explain this medical term',
    icon: 'translate' as const,
  },
  {
    label: 'Understand a document',
    to: '/document-reader',
    icon: 'document' as const,
  },
  {
    label: 'Browse assistants',
    to: '/assistants',
    icon: 'grid' as const,
  },
] as const

const JOURNEY_ICONS = {
  'lab-terms': 'document',
  'clinician-questions': 'chat',
  'fever-ask': 'compass',
  'rx-label': 'document',
  'local-foods': 'spark',
  'first-aid-basics': 'shield',
} as const

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([])
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')

  const bookmarks = useEngagementStore((s) => s.bookmarks)
  const pinnedConversations = useEngagementStore((s) => s.pinnedConversations)
  const documentInsights = useEngagementStore((s) => s.documentInsights)
  const checklistProgress = useEngagementStore((s) => s.checklistProgress)
  const completeChecklist = useEngagementStore((s) => s.completeChecklist)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const [conversationData, documentData, system] = await Promise.all([
          listConversations(undefined, { signal: controller.signal }),
          listDocuments({ signal: controller.signal }),
          getSystemStatus({ signal: controller.signal }),
        ])
        if (!controller.signal.aborted) {
          setConversations(conversationData)
          setAllDocuments(documentData)
          setDocuments(documentData.slice(0, 4))
          setStatus(system)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getErrorMessage(err, 'Could not load your CareGuide space'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  const displayName = user?.name?.trim()
  const firstName = displayName?.split(/\s+/)[0]
  const welcomeLine = firstName
    ? `${greetingForNow()}, ${firstName}`
    : greetingForNow()
  const lang = user?.preferredLanguage || 'en'
  const atmosphere = dayAtmosphere()
  const progress = checklistProgress()

  const continueItems = useMemo(() => {
    const pinned = pinnedConversations
      .map((id) => conversations.find((c) => c.id === id))
      .filter(Boolean) as ConversationSummary[]
    const rest = conversations.filter((c) => !pinnedConversations.includes(c.id))
    return [...pinned, ...rest].slice(0, 5)
  }, [conversations, pinnedConversations])

  const recap = useMemo(
    () =>
      weeklyRecapStats({
        conversations,
        documents: allDocuments,
        bookmarksCount: bookmarks.length,
      }),
    [conversations, allDocuments, bookmarks.length],
  )

  function conversationTo(c: ConversationSummary) {
    const catalog = getAssistantById(c.assistantType)
    return catalog
      ? assistantPath(catalog.slug, c.id)
      : `/assistant/${c.assistantType.toLowerCase()}/${c.id}`
  }

  function handleComposer(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) {
      navigate('/assistant/health')
      return
    }
    navigate('/assistant/health', { state: { starter: text } })
  }

  function startQuick(action: (typeof QUICK_ACTIONS)[number]) {
    if ('starter' in action && action.starter) {
      navigate(action.to, { state: { starter: action.starter } })
      return
    }
    navigate(action.to)
  }

  function startJourney(id: string) {
    const journey = GUIDED_JOURNEYS.find((j) => j.id === id)
    if (!journey) return
    completeChecklist('journey')
    navigate(assistantPath(journey.assistantSlug), {
      state: { starter: journey.starter },
    })
  }

  return (
    <>
    <div className={`page-pad cg-dash cg-dash-${atmosphere} animate-fade-up`}>
      <div className="cg-dash-scene" aria-hidden="true">
        <div className="cg-dash-scene-photo" />
        <div className="cg-dash-scene-wash" />
        <div className="cg-dash-scene-orb cg-dash-scene-orb-a" />
        <div className="cg-dash-scene-orb cg-dash-scene-orb-b" />
      </div>

      <header className="cg-dash-hero">
        <div className="cg-dash-hero-copy">
          <p className="cg-dash-kicker">
            <span className="cg-dash-kicker-dot" aria-hidden="true" />
            {welcomeLine}
          </p>
          <h1>What would you like to understand?</h1>
          <p className="cg-dash-lead">
            Your {BRAND.shortName} space for plain-language health education — not a clinic or
            diagnosis tool.
          </p>
        </div>

        <div className="cg-dash-hero-visual" aria-hidden="true">
          <div className="cg-dash-hero-frame">
            <img
              src="/images/dash-hero-bg.png"
              alt=""
              width={640}
              height={360}
              decoding="async"
            />
            <div className="cg-dash-hero-frame-shine" />
            <span className="cg-dash-hero-badge">
              <DashIcon name="compass" />
              Clarity first
            </span>
          </div>
        </div>

        <div className="cg-dash-hero-meta">
          <Link
            to="/profile"
            className="cg-dash-pill"
            onClick={() => completeChecklist('language')}
          >
            <span>Language</span>
            <strong>{languageLabel(lang)}</strong>
          </Link>
          {status ? (
            <span
              className={`cg-dash-pill cg-dash-status${status.openaiConfigured ? '' : ' is-warn'}`}
              title={
                status.openaiConfigured
                  ? `Model: ${status.model}`
                  : 'Add VITE_OPENAI_API_KEY to enable chat'
              }
            >
              <span className="cg-dash-status-dot" aria-hidden="true" />
              <strong>
                {status.openaiConfigured
                  ? `${status.assistantsAvailable} assistants ready`
                  : 'Chat needs API key'}
              </strong>
            </span>
          ) : null}
        </div>
      </header>

      <section className="cg-dash-ask" aria-labelledby="dash-ask-heading">
        <h2 id="dash-ask-heading" className="sr-only">
          Ask CareGuide
        </h2>
        <form className="cg-dash-composer" onSubmit={handleComposer}>
          <span className="cg-dash-composer-ico" aria-hidden="true">
            <DashIcon name="spark" />
          </span>
          <label className="sr-only" htmlFor="cg-dash-composer">
            Ask CareGuide
          </label>
          <input
            id="cg-dash-composer"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything you're curious about…"
            autoComplete="off"
          />
          <button type="submit" className="cg-dash-ask-btn">
            Ask
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <div className="cg-dash-chips" role="group" aria-label="Quick starts">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className="cg-dash-chip"
              onClick={() => startQuick(action)}
            >
              <DashIcon name={action.icon} />
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <DisclaimerBanner />

      {error && (
        <div className="cg-error-panel" role="alert">
          <p className="cg-error-title">Your workspace could not load.</p>
          <p className="cg-error-copy">{error}</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {loading && <ContentSkeleton variant="dashboard" />}

      {!loading && !error && (
        <div className="cg-dash-body">
          {progress.done < progress.total ? (
            <section className="cg-dash-panel cg-engage-checklist" aria-labelledby="checklist-heading">
              <div className="cg-dash-panel-head">
                <h2 id="checklist-heading">
                  <DashIcon name="checklist" className="cg-dash-panel-ico" />
                  Get started
                </h2>
                <span className="cg-engage-progress">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className="cg-engage-progress-bar" aria-hidden="true">
                <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <ul className="cg-engage-checklist-list">
                {progress.items.map((item) => (
                  <li key={item.id} className={item.done ? 'is-done' : ''}>
                    <span aria-hidden="true">{item.done ? '✓' : '○'}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="cg-dash-panel cg-engage-recap" aria-labelledby="recap-heading">
            <div className="cg-dash-panel-head">
              <h2 id="recap-heading">
                <DashIcon name="week" className="cg-dash-panel-ico" />
                This week
              </h2>
              <span className="cg-engage-recap-note">Learning activity</span>
            </div>
            <ul className="cg-engage-recap-grid">
              <li>
                <DashIcon name="chat" />
                <strong>{recap.chats}</strong>
                <span>chats</span>
              </li>
              <li>
                <DashIcon name="document" />
                <strong>{recap.documents}</strong>
                <span>documents</span>
              </li>
              <li>
                <DashIcon name="grid" />
                <strong>{recap.assistants}</strong>
                <span>assistants</span>
              </li>
              <li>
                <DashIcon name="bookmark" />
                <strong>{recap.bookmarks}</strong>
                <span>saved</span>
              </li>
            </ul>
          </section>

          <section className="cg-dash-panel cg-dash-continue" aria-labelledby="continue-heading">
            <div className="cg-dash-panel-head">
              <h2 id="continue-heading">
                <DashIcon name="continue" className="cg-dash-panel-ico" />
                Continue
              </h2>
              <Link to="/history">History</Link>
            </div>
            {continueItems.length === 0 ? (
              <EmptyState
                title="Nothing to continue yet"
                description="Start a question and it will show up here when you return."
                action={
                  <Link to="/assistants" className="btn btn-secondary btn-sm">
                    Explore assistants
                  </Link>
                }
              />
            ) : (
              <ul className="cg-dash-continue-list">
                {continueItems.map((c) => {
                  const catalog = getAssistantById(c.assistantType)
                  const pinned = pinnedConversations.includes(c.id)
                  return (
                    <li key={c.id}>
                      <Link to={conversationTo(c)} className="cg-dash-continue-row">
                        <span
                          className={`cg-dash-dot accent-${catalog?.accent ?? 'teal'}`}
                          aria-hidden="true"
                        />
                        <span className="cg-dash-continue-copy">
                          <strong>
                            {pinned ? (
                              <span className="cg-engage-pin-tag">Pinned · </span>
                            ) : null}
                            {displayConversationTitle(c.title, catalog?.name)}
                          </strong>
                          <span>
                            {catalog?.name || c.assistantType} · {formatDate(c.updatedAt)}
                          </span>
                        </span>
                        <span className="cg-dash-continue-go" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="cg-dash-panel cg-engage-journeys" aria-labelledby="journeys-heading">
            <div className="cg-dash-panel-head">
              <h2 id="journeys-heading">
                <DashIcon name="journey" className="cg-dash-panel-ico" />
                Guided journeys
              </h2>
              <span>Short educational paths</span>
            </div>
            <ul className="cg-engage-journey-grid">
              {GUIDED_JOURNEYS.map((journey) => {
                const iconName =
                  JOURNEY_ICONS[journey.id as keyof typeof JOURNEY_ICONS] ?? 'compass'
                return (
                  <li key={journey.id}>
                    <button
                      type="button"
                      className={`cg-engage-journey-card accent-${journey.accent}`}
                      onClick={() => startJourney(journey.id)}
                    >
                      <span className="cg-engage-journey-ico">
                        <DashIcon name={iconName} />
                      </span>
                      <strong>{journey.title}</strong>
                      <span>{journey.blurb}</span>
                      <em>
                        Start
                        <span aria-hidden="true"> →</span>
                      </em>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {(bookmarks.length > 0 || documentInsights.length > 0) && (
            <section className="cg-dash-panel cg-engage-saved" aria-labelledby="saved-heading">
              <div className="cg-dash-panel-head">
                <h2 id="saved-heading">
                  <DashIcon name="bookmark" className="cg-dash-panel-ico" />
                  Saved for later
                </h2>
                <Link to="/history">View all</Link>
              </div>
              {bookmarks.length > 0 ? (
                <ul className="cg-engage-bookmark-list">
                  {bookmarks.slice(0, 3).map((b) => (
                    <li key={b.id}>
                      <Link
                        to={assistantPath(
                          (b.assistantSlug as AssistantSlug) || 'health',
                          b.conversationId,
                        )}
                        className="cg-engage-bookmark-row"
                      >
                        <strong>{b.title}</strong>
                        <span>{b.excerpt}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              {documentInsights.length > 0 ? (
                <ul className="cg-engage-insight-list">
                  {documentInsights.slice(0, 2).map((d) => (
                    <li key={d.id}>
                      <Link to="/document-reader" className="cg-engage-insight-row">
                        <strong>{d.documentName}</strong>
                        <span>{d.summary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          )}

          <section className="cg-dash-panel cg-dash-docs" aria-labelledby="docs-heading">
            <div className="cg-dash-panel-head">
              <h2 id="docs-heading">
                <DashIcon name="document" className="cg-dash-panel-ico" />
                Documents
              </h2>
              <Link to="/document-reader">Reader</Link>
            </div>
            {documents.length === 0 ? (
              <div className="cg-dash-docs-empty">
                <p>Upload a report to explore it in plain language.</p>
                <Link
                  to="/document-reader"
                  className="cg-dash-doc-cta"
                  onClick={() => completeChecklist('document')}
                >
                  Open Document Reader
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              <ul className="cg-dash-doc-list">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      to="/document-reader"
                      className="cg-dash-doc-row"
                      onClick={() => completeChecklist('document')}
                    >
                      <span className="cg-dash-doc-icon" aria-hidden="true">
                        <DashIcon name="document" />
                      </span>
                      <span className="cg-dash-doc-copy">
                        <strong>{doc.originalFilename}</strong>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      )}
    </div>

    <div className="lp-landing cg-home-story">
      <FeatureCards />
      <HowItWorks />
      <LanguageShowcase />
      <SafetySection />
    </div>
    </>
  )
}
