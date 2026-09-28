import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useMedicalSafetyStore } from '../../store/medicalSafetyStore'
import LoadingSpinner from './LoadingSpinner'
import { BRAND } from '../../brand'

export default function SafetyOnboardingGate({ children }: { children: ReactNode }) {
  const { config, loading, load, hasOnboardingAck, acknowledgeOnboarding } =
    useMedicalSafetyStore()
  const [checked, setChecked] = useState(false)
  const [, bump] = useState(0)

  useEffect(() => {
    void load()
  }, [load])

  const ready = Boolean(config)
  const needsAck = ready && !hasOnboardingAck()

  if (loading && !config) {
    return (
      <div className="page-pad">
        <LoadingSpinner label="Loading safety information…" />
      </div>
    )
  }

  if (!needsAck) {
    return <>{children}</>
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!checked) return
    acknowledgeOnboarding()
    bump((n) => n + 1)
  }

  return (
    <div
      className="safety-gate-page animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-onboarding-title"
    >
      <form className="safety-gate-panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Required before continuing</p>
        <h1 id="safety-onboarding-title">{config!.title}</h1>
        <p className="muted">{config!.onboardingLead}</p>

        <div className="safety-gate-not" role="note">
          <strong>{BRAND.name} is not:</strong>
          a doctor · a diagnosis tool · an emergency service. For life-threatening symptoms, call
          local emergency services immediately.
        </div>

        <ul className="safety-principle-list">
          {config!.principles.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>{config!.acknowledgeLabel}</span>
        </label>

        <button type="submit" className="btn btn-primary" disabled={!checked}>
          I understand — continue
        </button>
      </form>
    </div>
  )
}
