export default function ContextChips({
  chips,
  onPick,
  disabled,
}: {
  chips: string[]
  onPick: (text: string) => void
  disabled?: boolean
}) {
  if (!chips.length) return null
  return (
    <div className="cg-context-chips" role="group" aria-label="Quick prompts">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          className="cg-chip is-action"
          disabled={disabled}
          onClick={() => onPick(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
