import type { ReactNode } from 'react'
import { SafetyBadge } from './SafetyPrimitives'

export default function ContextualHeader({
  assistantName,
  purpose,
  icon,
  conversationState,
  actions,
}: {
  assistantName: string
  purpose: string
  icon: ReactNode
  language?: string
  conversationState: 'ready' | 'active' | 'processing'
  country?: string | null
  actions?: ReactNode
}) {
  const stateLabel =
    conversationState === 'processing'
      ? 'Thinking…'
      : conversationState === 'active'
        ? 'In conversation'
        : 'Ready'

  return (
    <header className="cg-context-header animate-fade-up">
      <div className="cg-context-header-main">
        <div className="cg-context-title-row">
          <span className="cg-context-icon" aria-hidden="true">
            {icon}
          </span>
          <div className="cg-context-text">
            <h1 className="cg-context-title">{assistantName}</h1>
            <p className="cg-context-purpose">{purpose}</p>
          </div>
        </div>
        <div className="cg-context-meta" aria-label="Conversation context">
          <span className={`cg-context-status is-${conversationState}`}>
            <i aria-hidden="true" />
            {stateLabel}
          </span>
          <SafetyBadge />
          {actions}
        </div>
      </div>
    </header>
  )
}
