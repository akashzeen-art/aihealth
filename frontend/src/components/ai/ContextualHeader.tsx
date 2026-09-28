import type { ReactNode } from 'react'
import { BRAND } from '../../brand'
import AiPresence from './AiPresence'
import { SafetyBadge } from './SafetyPrimitives'
import { languageLabel } from '../../utils/assistantExperience'

export default function ContextualHeader({
  assistantName,
  purpose,
  icon,
  language,
  conversationState,
  country,
}: {
  assistantName: string
  purpose: string
  icon: ReactNode
  language: string
  conversationState: 'ready' | 'active' | 'processing'
  country?: string | null
}) {
  const stateLabel =
    conversationState === 'processing'
      ? 'Preparing a reply'
      : conversationState === 'active'
        ? 'In conversation'
        : 'Ready'

  return (
    <header className="cg-context-header animate-fade-up">
      <div className="cg-context-header-main">
        <div className="cg-context-brand-row">
          <AiPresence
            state={conversationState === 'processing' ? 'processing' : conversationState === 'active' ? 'listening' : 'idle'}
            size="sm"
          />
          <div>
            <p className="cg-context-kicker">{BRAND.name}</p>
            <div className="cg-context-title-row">
              <span className="cg-context-icon" aria-hidden="true">
                {icon}
              </span>
              <h1 className="cg-context-title">{assistantName}</h1>
            </div>
            <p className="cg-context-purpose">“{purpose}”</p>
          </div>
        </div>
        <div className="cg-context-meta" aria-label="Conversation context">
          <span className="cg-chip is-meta">{languageLabel(language)}</span>
          <SafetyBadge />
          <span className="cg-chip is-meta">{stateLabel}</span>
          {country?.trim() ? (
            <span className="cg-chip is-meta">Country context: {country.trim()}</span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
