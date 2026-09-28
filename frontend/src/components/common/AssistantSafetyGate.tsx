import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMedicalSafetyStore } from '../../store/medicalSafetyStore'
import type { AssistantType } from '../../types'
import LoadingSpinner from './LoadingSpinner'

interface AssistantSafetyGateProps {
  assistantType: AssistantType
  assistantName: string
  children: ReactNode
}

export default function AssistantSafetyGate({
  assistantType,
  assistantName,
  children,
}: AssistantSafetyGateProps) {
  const { config, loading, load, needsAssistantGate, acknowledgeAssistant } =
    useMedicalSafetyStore()
  const [checked, setChecked] = useState(false)
  const [, bump] = useState(0)

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setChecked(false)
  }, [assistantType])

  if (loading && !config) {
    return (
      <div className="page-pad">
        <LoadingSpinner label="Loading safety information…" />
      </div>
    )
  }

  if (!config || !needsAssistantGate(assistantType)) {
    return <>{children}</>
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!checked) return
    acknowledgeAssistant(assistantType)
    bump((n) => n + 1)
  }

  return (
    <div
      className="safety-gate-page cg-safety-gate animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-safety-title"
    >
      <form className="safety-gate-panel cg-safety-gate-panel" onSubmit={handleSubmit}>
        <div className="cg-safety-gate-head">
          <span className="cg-safety-gate-shield" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div>
            <p className="eyebrow">Before using {assistantName}</p>
            <h1 id="assistant-safety-title">Educational use only</h1>
          </div>
        </div>
        <p className="muted">{config.shortBanner}</p>
        <p className="muted">
          This assistant shares general information. It does not diagnose, prescribe, or replace
          professional care. In an emergency, contact local emergency services immediately.
        </p>

        <ul className="safety-principle-list is-compact">
          {config.principles.slice(0, 5).map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>{config.acknowledgeLabel}</span>
        </label>

        <div className="safety-gate-actions">
          <button type="submit" className="btn btn-primary cg-btn cg-btn-primary" disabled={!checked}>
            Continue to {assistantName}
            <span aria-hidden="true">→</span>
          </button>
          <Link to="/assistants" className="btn btn-secondary cg-btn cg-btn-secondary">
            Back to assistants
          </Link>
        </div>
      </form>
    </div>
  )
}
