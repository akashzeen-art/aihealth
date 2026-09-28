import type { ConversationSummary } from '../../types'
import { formatDate } from '../../utils/format'
import {
  displayConversationTitle,
  groupConversationsByDay,
} from '../../utils/assistantExperience'
import { getAssistantById } from '../../utils/assistants'
import ContentSkeleton from '../ai/ContentSkeleton'
import EmptyState from '../ai/EmptyState'

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  loading,
  showAssistant = false,
}: {
  conversations: ConversationSummary[]
  activeId?: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  loading?: boolean
  showAssistant?: boolean
}) {
  if (loading) return <ContentSkeleton variant="list" />
  if (conversations.length === 0) {
    return (
      <EmptyState
        title="Your CareGuide journey starts here."
        description="Start a chat with this companion. Your timeline will appear here."
      />
    )
  }

  const groups = groupConversationsByDay(conversations)

  return (
    <div className="cg-timeline" aria-label="Conversations">
      {groups.map((group) => (
        <section key={group.label} className="cg-timeline-group">
          <h3 className="cg-timeline-label">{group.label}</h3>
          <ul className="chat-list">
            {group.items.map((c) => {
              const catalog = getAssistantById(c.assistantType)
              const title = displayConversationTitle(c.title, catalog?.name)
              return (
                <li key={c.id} className={c.id === activeId ? 'is-active' : ''}>
                  <button
                    type="button"
                    className="chat-list-item"
                    onClick={() => onSelect(c.id)}
                    aria-current={c.id === activeId ? 'true' : undefined}
                  >
                    <span
                      className={`cg-timeline-accent accent-${catalog?.accent || 'teal'}`}
                      aria-hidden="true"
                    />
                    <span className="chat-list-title">{title}</span>
                    <span className="chat-list-date">
                      {showAssistant && catalog ? `${catalog.name} · ` : ''}
                      {formatDate(c.updatedAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="chat-list-delete"
                    aria-label={`Delete conversation ${title}`}
                    onClick={() => onDelete(c.id)}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
