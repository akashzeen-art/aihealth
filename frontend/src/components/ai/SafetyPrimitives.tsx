import type { ReactNode } from 'react'

type Tone = 'info' | 'warning' | 'emergency' | 'education'

function Notice({
  tone,
  title,
  children,
  className = '',
}: {
  tone: Tone
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <aside className={`cg-safety-notice tone-${tone} ${className}`.trim()} role="note">
      <strong className="cg-safety-notice-title">{title}</strong>
      <div className="cg-safety-notice-body">{children}</div>
    </aside>
  )
}

export function SafetyNotice({ children }: { children: ReactNode }) {
  return (
    <Notice tone="education" title="Safety notice">
      {children}
    </Notice>
  )
}

export function WarningCallout({ children }: { children: ReactNode }) {
  return (
    <Notice tone="warning" title="Important">
      {children}
    </Notice>
  )
}

export function EmergencyCallout({ children }: { children: ReactNode }) {
  return (
    <aside className="cg-safety-notice tone-emergency" role="alert">
      <strong className="cg-safety-notice-title">Emergency — act first</strong>
      <div className="cg-safety-notice-body">{children}</div>
    </aside>
  )
}

export function EducationalDisclaimer({ children }: { children: ReactNode }) {
  return (
    <Notice tone="education" title="Educational only">
      {children}
    </Notice>
  )
}

export function SafetyBadge({ label = 'Safety-first' }: { label?: string }) {
  return <span className="cg-safety-badge">{label}</span>
}

export function TrustSignals() {
  return (
    <ul className="cg-trust-row" aria-label="Trust signals">
      <li>Educational guidance</li>
      <li>Data stays in your browser</li>
      <li>You control conversations</li>
      <li>Safety-first design</li>
    </ul>
  )
}
