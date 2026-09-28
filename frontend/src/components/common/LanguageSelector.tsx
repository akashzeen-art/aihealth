import { LANGUAGE_OPTIONS } from '../../utils/assistants'

export default function LanguageSelector({
  value,
  onChange,
  disabled,
  id = 'language-select',
}: {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  id?: string
}) {
  return (
    <label className="lang-select" htmlFor={id}>
      <span>Language</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Preferred response language"
      >
        {LANGUAGE_OPTIONS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}
