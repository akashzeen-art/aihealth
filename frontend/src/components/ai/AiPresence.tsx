export type AiPresenceState = 'idle' | 'listening' | 'processing' | 'responding' | 'complete' | 'error'

export default function AiPresence({
  state = 'idle',
  size = 'md',
  label,
  className = '',
}: {
  state?: AiPresenceState
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}) {
  return (
    <div
      className={`cg-ai-presence size-${size} state-${state} ${className}`.trim()}
      role="img"
      aria-label={label || `Care+ is ${state}`}
    >
      <span className="cg-ai-presence-ring r1" aria-hidden="true" />
      <span className="cg-ai-presence-ring r2" aria-hidden="true" />
      <span className="cg-ai-presence-core" aria-hidden="true" />
      <span className="cg-ai-presence-node n1" aria-hidden="true" />
      <span className="cg-ai-presence-node n2" aria-hidden="true" />
      <span className="cg-ai-presence-node n3" aria-hidden="true" />
      <span className="cg-ai-presence-wave" aria-hidden="true" />
    </div>
  )
}
