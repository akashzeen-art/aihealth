import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import type { Message } from '../../types'
import ErrorMessage from '../common/ErrorMessage'
import Button from '../ui/Button'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatEmptyState from '../ai/ChatEmptyState'
import ContextChips from '../ai/ContextChips'
import ContentSkeleton from '../ai/ContentSkeleton'
import FollowUpSuggestions from '../ai/FollowUpSuggestions'
import AiPresence from '../ai/AiPresence'
import type { AiPresenceState } from '../ai/AiPresence'

interface ChatWindowProps {
  messages: Message[]
  loading?: boolean
  sending?: boolean
  error?: string
  input: string
  onInputChange: (value: string) => void
  onSend: (e?: FormEvent) => void
  emptyTitle?: string
  starters?: string[]
  chips?: string[]
  followUps?: string[]
  processingLabel?: string
  presenceState?: AiPresenceState
  languageControl?: ReactNode
  toolbar?: ReactNode
  attachControl?: ReactNode
  banner?: ReactNode
  contextHeader?: ReactNode
  dir?: 'ltr' | 'rtl'
  onPickSuggestion?: (text: string) => void
  onRetry?: () => void
  conversationId?: string
  assistantType?: string
  assistantSlug?: string
}

export default function ChatWindow({
  messages,
  loading,
  sending,
  error,
  input,
  onInputChange,
  onSend,
  emptyTitle = "Let's explore your health question.",
  starters = [],
  chips = [],
  followUps = [],
  processingLabel,
  presenceState = 'idle',
  languageControl,
  toolbar,
  attachControl,
  banner,
  contextHeader,
  dir = 'ltr',
  onPickSuggestion,
  onRetry,
  conversationId,
  assistantType,
  assistantSlug,
}: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const seenRef = useRef<{ conversationId?: string; count: number; loaded: boolean }>({
    conversationId,
    count: messages.length,
    loaded: !loading,
  })

  useEffect(() => {
    const seen = seenRef.current
    const switched = seen.conversationId !== conversationId
    const justLoaded = !seen.loaded && !loading
    const grew = messages.length > seen.count

    seenRef.current = { conversationId, count: messages.length, loaded: !loading }

    // Opening a page or chat keeps the window at the top; only new activity follows the thread.
    if (loading || switched || justLoaded) return
    if (!grew && !sending) return

    const list = listRef.current
    if (list && list.scrollHeight > list.clientHeight) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, sending, loading, conversationId])

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  function applySuggestion(text: string) {
    if (onPickSuggestion) {
      onPickSuggestion(text)
      return
    }
    onInputChange(text)
    areaRef.current?.focus()
  }

  const showFollowUps =
    !sending &&
    !loading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'ASSISTANT' &&
    followUps.length > 0

  return (
    <section
      className={`assistant-detail-main chat-window cg-chat-surface ${sending || presenceState === 'listening' ? 'is-active' : ''}`.trim()}
      aria-label="Chat"
      dir={dir}
    >
      {contextHeader}
      {banner}
      {toolbar}

      {error ? (
        <div className="cg-error-panel" role="alert">
          <p className="cg-error-title">Something interrupted the response.</p>
          <p className="cg-error-copy">{error}</p>
          {onRetry ? (
            <Button type="button" variant="secondary" size="sm" className="cg-btn cg-btn-secondary cg-btn-sm" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      ) : (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      <div ref={listRef} className="assistant-detail-messages" aria-live="polite">
        {loading ? (
          <ContentSkeleton variant="chat" />
        ) : messages.length === 0 ? (
          <ChatEmptyState
            title={emptyTitle}
            starters={starters}
            onPick={applySuggestion}
          />
        ) : (
          messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              isLatestAssistant={
                m.role === 'ASSISTANT' && i === messages.length - 1 && !sending
              }
              conversationId={conversationId}
              assistantType={assistantType}
              assistantSlug={assistantSlug}
            />
          ))
        )}
        {sending && (
          <TypingIndicator label={processingLabel} presenceState="processing" />
        )}
        {showFollowUps && (
          <FollowUpSuggestions
            suggestions={followUps}
            disabled={sending}
            onPick={applySuggestion}
          />
        )}
        <div ref={endRef} />
      </div>

      <div className="cg-composer-shell">
        <ContextChips chips={chips} disabled={sending || loading} onPick={applySuggestion} />
        <form
          className={`cg-composer ${attachControl ? 'has-attach' : 'no-attach'}`.trim()}
          onSubmit={(e) => {
            e.preventDefault()
            onSend(e)
          }}
        >
          <div className="cg-composer-presence" aria-hidden="true">
            <AiPresence
              state={sending ? 'processing' : input ? 'listening' : presenceState}
              size="sm"
            />
          </div>
          {attachControl}
          <label className="sr-only" htmlFor="assistant-question">
            Ask CareGuide
          </label>
          <textarea
            ref={areaRef}
            id="assistant-question"
            rows={1}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
            placeholder="Ask CareGuide…"
            disabled={sending || loading}
            autoComplete="off"
            aria-required="true"
          />
          <div className="cg-composer-actions">
            {languageControl}
            <Button
              type="submit"
              variant="primary"
              disabled={sending || loading || !input.trim()}
              aria-label="Send message"
              className="cg-btn cg-btn-primary cg-composer-send"
            >
              {sending ? '…' : '→'}
            </Button>
          </div>
        </form>
        <p className="cg-composer-hint">
          Enter to send · Shift+Enter for a new line · Educational guidance only
        </p>
      </div>
    </section>
  )
}
