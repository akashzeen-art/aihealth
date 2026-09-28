import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BRAND } from '../../brand'
import type { Message } from '../../types'
import AiPresence from '../ai/AiPresence'
import { useEngagementStore } from '../../store/engagementStore'

function blockquoteClass(children: ReactNode): string {
  const text = collectText(children).toLowerCase()
  if (text.includes('emergency')) return 'md-alert is-emergency'
  if (text.includes('warning') || text.includes('caution')) return 'md-alert is-warning'
  return 'md-blockquote'
}

function collectText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  if (typeof node === 'object' && node !== null && 'props' in node) {
    const el = node as { props?: { children?: ReactNode } }
    return collectText(el.props?.children)
  }
  return ''
}

const markdownComponents: Components = {
  h1: ({ children }) => <h3 className="md-h">{children}</h3>,
  h2: ({ children }) => <h3 className="md-h">{children}</h3>,
  h3: ({ children }) => <h4 className="md-h">{children}</h4>,
  p: ({ children }) => <p className="md-p">{children}</p>,
  ul: ({ children }) => <ul className="md-list">{children}</ul>,
  ol: ({ children }) => <ol className="md-list is-numbered">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <aside className={blockquoteClass(children)} role="note">
      {children}
    </aside>
  ),
  code: ({ children }) => <code className="md-code">{children}</code>,
}

export default function MessageBubble({
  message,
  isLatestAssistant = false,
  conversationId,
  assistantType,
  assistantSlug,
}: {
  message: Message
  isLatestAssistant?: boolean
  conversationId?: string
  assistantType?: string
  assistantSlug?: string
}) {
  const isUser = message.role === 'USER'
  const isSystem = message.role === 'SYSTEM'
  const isBookmarked = useEngagementStore((s) => s.isBookmarked(message.id))
  const addBookmark = useEngagementStore((s) => s.addBookmark)
  const removeBookmark = useEngagementStore((s) => s.removeBookmark)
  const bookmarks = useEngagementStore((s) => s.bookmarks)

  if (isUser) {
    return (
      <div className="message-bubble is-user cg-msg-user">
        <div className="message-meta">You</div>
        <div className="message-body">
          <p className="md-p">{message.content}</p>
        </div>
      </div>
    )
  }

  if (isSystem) {
    return (
      <div className="message-bubble is-system cg-msg-system">
        <div className="message-meta">System</div>
        <div className="message-body">
          <p className="md-p">{message.content}</p>
        </div>
      </div>
    )
  }

  function toggleBookmark() {
    if (!conversationId || !assistantType || !assistantSlug) return
    if (isBookmarked) {
      const hit = bookmarks.find((b) => b.messageId === message.id)
      if (hit) removeBookmark(hit.id)
      return
    }
    addBookmark({
      messageId: message.id,
      conversationId,
      assistantType,
      assistantSlug,
      content: message.content,
    })
  }

  return (
    <article
      className={`cg-response-card cg-msg-reveal ${isLatestAssistant ? 'is-latest' : ''}`.trim()}
    >
      <header className="cg-response-head">
        <AiPresence state={isLatestAssistant ? 'complete' : 'idle'} size="sm" />
        <div>
          <p className="cg-response-identity">{BRAND.shortName}</p>
          <p className="cg-response-meta">Educational response</p>
        </div>
        {conversationId ? (
          <button
            type="button"
            className={`cg-bookmark-btn${isBookmarked ? ' is-active' : ''}`}
            onClick={toggleBookmark}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove saved insight' : 'Save insight'}
            title={isBookmarked ? 'Remove saved insight' : 'Save insight'}
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        ) : null}
      </header>
      <div className="cg-response-body message-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
      </div>
      <p className="message-disclaimer">
        AI-generated health information — not a medical diagnosis. Review important decisions with a
        clinician.
      </p>
    </article>
  )
}
