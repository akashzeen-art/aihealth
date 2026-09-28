import type { ReactNode } from 'react'
import ConversationList from './ConversationList'
import Button from '../ui/Button'
import type { ConversationSummary } from '../../types'

interface ConversationSidebarProps {
  conversations: ConversationSummary[]
  activeId?: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  loading?: boolean
  title?: string
  identity?: ReactNode
  footer?: ReactNode
  className?: string
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
  title = 'Chats',
  identity,
  footer,
  className = '',
}: ConversationSidebarProps) {
  return (
    <aside
      className={`assistant-detail-sidebar ${className}`.trim()}
      aria-label="Conversation history"
    >
      {identity}
      <div className="chat-sidebar-head">
        <h2>{title}</h2>
        <Button variant="secondary" size="sm" className="cg-btn cg-btn-secondary cg-btn-sm" onClick={onNew}>
          New chat
        </Button>
      </div>
      <div className="assistant-detail-history">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          onDelete={onDelete}
          loading={loading}
        />
      </div>
      {footer}
    </aside>
  )
}
