export default function FollowUpSuggestions({
  suggestions,
  onPick,
  disabled,
}: {
  suggestions: string[]
  onPick: (text: string) => void
  disabled?: boolean
}) {
  if (!suggestions.length) return null
  return (
    <div className="cg-followups">
      <p className="cg-followups-label">Continue exploring</p>
      <div className="cg-followups-row" role="group" aria-label="Follow-up suggestions">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="cg-chip is-action"
            disabled={disabled}
            onClick={() => onPick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
