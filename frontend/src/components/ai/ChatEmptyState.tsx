import AiPresence from './AiPresence'

export default function ChatEmptyState({
  title,
  starters,
  onPick,
}: {
  title: string
  starters: string[]
  onPick: (text: string) => void
}) {
  return (
    <div className="cg-chat-empty">
      <AiPresence state="idle" size="lg" label="Care+ ready" />
      <h2 className="cg-chat-empty-title">{title}</h2>
      <p className="cg-chat-empty-lead">
        Choose a starting point or type your own question. Replies are educational — not a diagnosis.
      </p>
      <ul className="cg-suggestion-grid" aria-label="Suggested questions">
        {starters.map((s) => (
          <li key={s}>
            <button type="button" className="cg-suggestion-card" onClick={() => onPick(s)}>
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
