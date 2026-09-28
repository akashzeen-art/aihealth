import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hintId?: string
}

export default function Input({
  label,
  id,
  error,
  hintId,
  className = '',
  ...rest
}: InputProps) {
  const inputId = id || rest.name || 'input'
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <label className="field-label" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={className}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}
