import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteConversation, listConversations } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import ContentSkeleton from '../components/ai/ContentSkeleton'
import {
  assistantPath,
  conversationUrlId,
  getAssistantById,
  ASSISTANT_CATALOG,
  type AssistantSlug,
} from '../utils/assistants'
import {
  displayConversationTitle,
  groupConversationsByDay,
} from '../utils/assistantExperience'
import { formatDate } from '../utils/format'
import { useEngagementStore } from '../store/engagementStore'
import type { ConversationSummary } from '../types'

function friendlyGroupLabel(label: string): string {
  switch (label) {
    case 'TODAY':
      return 'Today'
    case 'YESTERDAY':
      return 'Yesterday'
    case 'THIS WEEK':
      return 'This week'
    default:
      return 'Earlier'
  }
}

export default function HistoryPage() {
  const [items, setItems] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [assistantFilter, setAssistantFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const bookmarks = useEngagementStore((s) => s.bookmarks)
  const removeBookmark = useEngagementStore((s) => s.removeBookmark)
  const togglePinned = useEngagementStore((s) => s.togglePinnedConversation)
  const pinnedConversations = useEngagementStore((s) => s.pinnedConversations)

  async function refresh(signal?: AbortSignal) {
    const data = await listConversations(undefined, { signal })
    setItems(data)
  }

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        await refresh(controller.signal)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getErrorMessage(err, 'Conversation history unavailable'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  async function confirmDelete(id: string) {
    setError('')
    setDeleting(true)
    try {
      await deleteConversation(id)
      setPendingDelete(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete conversation'))
    } finally {
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((c) => {
      const catalog = getAssistantById(c.assistantType)
      if (assistantFilter !== 'all' && c.assistantType !== assistantFilter) return false
      if (!q) return true
      const title = displayConversationTitle(c.title, catalog?.name).toLowerCase()
      const name = (catalog?.name || c.assistantType).toLowerCase()
      return title.includes(q) || name.includes(q)
    })
  }, [items, query, assistantFilter])

  const groups = groupConversationsByDay(filtered)
  const hasFilters = query.trim().length > 0 || assistantFilter !== 'all'

  return (
    <div className="page-pad cg-hist-page animate-fade-up">
      <div className="cg-hist-glow" aria-hidden="true" />

      <header className="cg-hist-hero">
        <p className="cg-hist-kicker">
          <span className="cg-hist-kicker-dot" aria-hidden="true" />
          Exploration timeline
        </p>
        <div className="cg-hist-hero-row">
          <div>
            <h1>Your conversations</h1>
            <p className="cg-hist-lead">Return to something you explored earlier.</p>
          </div>
          {!loading && items.length > 0 ? (
            <p className="cg-hist-count" aria-live="polite">
              <strong>{filtered.length}</strong>
              <span>{filtered.length === 1 ? 'conversation' : 'conversations'}</span>
            </p>
          ) : null}
        </div>
      </header>

      {!loading && items.length > 0 ? (
        <div className="cg-hist-toolbar">
          <label className="cg-hist-search">
            <span className="sr-only">Search conversations</span>
            <span className="cg-hist-search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or assistant"
            />
          </label>
          <label className="cg-hist-filter">
            <span className="sr-only">Filter by assistant</span>
            <select
              value={assistantFilter}
              onChange={(e) => setAssistantFilter(e.target.value)}
            >
              <option value="all">All assistants</option>
              {ASSISTANT_CATALOG.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          {hasFilters ? (
            <button
              type="button"
              className="cg-btn cg-btn-ghost cg-btn-sm"
              onClick={() => {
                setQuery('')
                setAssistantFilter('all')
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}

      {bookmarks.length > 0 ? (
        <section className="cg-engage-hist-saved" aria-labelledby="saved-insights-heading">
          <div className="cg-dash-panel-head">
            <h2 id="saved-insights-heading">Saved insights</h2>
            <span>{bookmarks.length}</span>
          </div>
          <ul className="cg-engage-bookmark-list">
            {bookmarks.map((b) => (
              <li key={b.id} className="cg-engage-hist-bookmark">
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
                <button
                  type="button"
                  className="cg-btn cg-btn-ghost cg-btn-sm"
                  onClick={() => removeBookmark(b.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? (
        <div className="cg-error-panel" role="alert">
          <p className="cg-error-title">Conversation unavailable</p>
          <p className="cg-error-copy">{error}</p>
          <button
            type="button"
            className="cg-btn cg-btn-secondary cg-btn-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <ContentSkeleton variant="list" />
      ) : items.length === 0 ? (
        <div className="cg-hist-empty">
          <div className="cg-hist-empty-icon" aria-hidden="true">
            ◌
          </div>
          <h2>Nothing here yet</h2>
          <p>Start with a question and return whenever you&apos;d like to continue exploring.</p>
          <div className="cg-hist-empty-actions">
            <Link to="/assistants" className="cg-btn cg-btn-primary">
              Start a conversation
              <span aria-hidden="true">→</span>
            </Link>
            <Link to="/" className="cg-btn cg-btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cg-hist-empty is-filtered">
          <div className="cg-hist-empty-icon" aria-hidden="true">
            ⌕
          </div>
          <h2>No matching conversations</h2>
          <p>Try a different search or clear the assistant filter.</p>
          <button
            type="button"
            className="cg-btn cg-btn-secondary"
            onClick={() => {
              setQuery('')
              setAssistantFilter('all')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="cg-hist-timeline">
          {groups.map((group) => (
            <section key={group.label} className="cg-hist-group" aria-labelledby={`hist-${group.label}`}>
              <h2 id={`hist-${group.label}`} className="cg-hist-day">
                {friendlyGroupLabel(group.label)}
              </h2>
              <ul className="cg-hist-list">
                {group.items.map((c) => {
                  const catalog = getAssistantById(c.assistantType)
                  const to = catalog
                    ? assistantPath(catalog.slug, c.id)
                    : `/assistant/${c.assistantType.toLowerCase()}/${conversationUrlId(c.id)}`
                  const confirming = pendingDelete === c.id
                  const pinned = pinnedConversations.includes(c.id)
                  return (
                    <li key={c.id} className={`cg-hist-card${confirming ? ' is-confirming' : ''}`}>
                      <Link to={to} className="cg-hist-open">
                        <span
                          className={`cg-hist-dot accent-${catalog?.accent ?? 'teal'}`}
                          aria-hidden="true"
                        />
                        <span className="cg-hist-copy">
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
                        <span className="cg-hist-go" aria-hidden="true">
                          →
                        </span>
                      </Link>
                      {confirming ? (
                        <div className="cg-hist-confirm" role="group" aria-label="Confirm delete">
                          <span>Delete this conversation?</span>
                          <button
                            type="button"
                            className="cg-btn cg-btn-danger cg-btn-sm"
                            disabled={deleting}
                            onClick={() => void confirmDelete(c.id)}
                          >
                            {deleting ? 'Deleting…' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            className="cg-btn cg-btn-ghost cg-btn-sm"
                            disabled={deleting}
                            onClick={() => setPendingDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="cg-hist-actions">
                          <button
                            type="button"
                            className="cg-btn cg-btn-ghost cg-btn-sm"
                            onClick={() => togglePinned(c.id)}
                            aria-pressed={pinned}
                          >
                            {pinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            type="button"
                            className="cg-btn cg-btn-ghost cg-btn-sm cg-hist-delete"
                            onClick={() => setPendingDelete(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
