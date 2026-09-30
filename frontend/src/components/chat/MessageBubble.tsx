import type { Components } from 'react-markdown'
import { useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BRAND } from '../../brand'
import type { Message } from '../../types'
import AiPresence from '../ai/AiPresence'
import VaccinationChart from '../tools/VaccinationChart'
import { visualForHeading, visualForText } from '../../utils/replyVisuals'
import { replyImageFor, splitIntro, type ReplyImage } from '../../utils/replyImages'
import { useEngagementStore } from '../../store/engagementStore'

const VACCINE_TOPIC = /vaccin|immuni[sz]|टीक|lasika|chanjo|تطعيم|لقاح/i
const SCHEDULE_WORDS = /schedule|chart|timeline|list|which|when|what age|due|सूची|तालिका|कब|कौन|calendrier|quand|ratiba|lini|جدول|متى/i
const REMINDER_WORDS = /remind|रिमाइंडर|याद|rappel|kumbusho|تذكير/i

function showsVaccinationChart(slug: string | undefined, question: string): boolean {
  if (slug !== 'child-health' && slug !== 'mother-baby') return false
  return VACCINE_TOPIC.test(question) && SCHEDULE_WORDS.test(question) && !REMINDER_WORDS.test(question)
}

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

function ReplyImageBanner({ image }: { image: ReplyImage }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (failedSrc === image.src) return null
  return (
    <figure className="cg-reply-image">
      <img src={image.src} alt={image.alt} loading="lazy" onError={() => setFailedSrc(image.src)} />
    </figure>
  )
}

function VisualHeading({ children, level }: { children: ReactNode; level: 3 | 4 }) {
  const visual = visualForHeading(collectText(children))
  const Tag = level === 3 ? 'h3' : 'h4'
  return (
    <Tag className={`md-h${visual ? ' has-visual' : ''}`}>
      {visual ? (
        <span className={`md-h-icon tone-${visual.tone}`} aria-hidden="true">
          {visual.icon}
        </span>
      ) : null}
      <span>{children}</span>
    </Tag>
  )
}

function VisualItem({ children, isGroup }: { children: ReactNode; isGroup: boolean }) {
  const text = collectText(children)
  const label = text.includes(':') ? text.slice(0, text.indexOf(':')) : ''
  const labelVisual = label ? visualForText(label) : null
  const visual = isGroup
    ? (visualForHeading(label || text) ?? labelVisual ?? visualForText(text))
    : labelVisual && labelVisual.icon !== '✅'
      ? labelVisual
      : visualForText(text)
  return (
    <li className={isGroup ? 'md-li-group' : 'md-li-visual'}>
      <span className={`md-li-icon tone-${visual.tone}`} aria-hidden="true">
        {visual.icon}
      </span>
      <span className="md-li-text">{children}</span>
    </li>
  )
}

const markdownComponents: Components = {
  h1: ({ children }) => <VisualHeading level={3}>{children}</VisualHeading>,
  h2: ({ children }) => <VisualHeading level={3}>{children}</VisualHeading>,
  h3: ({ children }) => <VisualHeading level={4}>{children}</VisualHeading>,
  p: ({ children }) => <p className="md-p">{children}</p>,
  ul: ({ children }) => <ul className="md-list md-visual-list">{children}</ul>,
  ol: ({ children }) => <ol className="md-list is-numbered">{children}</ol>,
  li: ({ children, node }) => (
    <VisualItem
      isGroup={Boolean(
        node?.children.some((c) => c.type === 'element' && (c.tagName === 'ul' || c.tagName === 'ol')),
      )}
    >
      {children}
    </VisualItem>
  ),
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
  question = '',
  showImage = false,
}: {
  message: Message
  isLatestAssistant?: boolean
  conversationId?: string
  assistantType?: string
  assistantSlug?: string
  question?: string
  showImage?: boolean
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

  const image = showImage ? replyImageFor(question, message.content) : null
  const { intro, rest } = image ? splitIntro(message.content) : { intro: '', rest: '' }

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
        {image ? (
          <>
            {intro ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {intro}
              </ReactMarkdown>
            ) : null}
            <ReplyImageBanner key={image.src} image={image} />
            {rest ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {rest}
              </ReactMarkdown>
            ) : null}
          </>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
        {showsVaccinationChart(assistantSlug, question) ? <VaccinationChart compact /> : null}
      </div>
      <p className="message-disclaimer">
        AI-generated health information — not a medical diagnosis. Review important decisions with a
        clinician.
      </p>
    </article>
  )
}
