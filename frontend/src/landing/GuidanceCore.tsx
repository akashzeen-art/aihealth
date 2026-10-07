export type GuidanceCoreState = 'idle' | 'question' | 'understanding' | 'explanation' | 'calm'

const ORBIT = ['Understand', 'Explore', 'Learn', 'Translate', 'Read', 'Ask'] as const

/** Abstract Care+ Guidance Core — organic + digital, not a “brain”. */
export default function GuidanceCore({
  className = '',
  state = 'idle',
}: {
  className?: string
  state?: GuidanceCoreState
}) {
  return (
    <div
      className={`cg-guidance-core state-${state} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="cg-guidance-core-glow" />
      <span className="cg-guidance-ring r1" />
      <span className="cg-guidance-ring r2" />
      <span className="cg-guidance-path" />
      <span className="cg-guidance-core-disc" />
      <span className="cg-guidance-ring r3" />
      <span className="cg-guidance-node n1" />
      <span className="cg-guidance-node n2" />
      <span className="cg-guidance-node n3" />
      {ORBIT.map((word, i) => (
        <span key={word} className={`cg-orbit-word w${i + 1}`}>
          {word}
        </span>
      ))}
    </div>
  )
}
