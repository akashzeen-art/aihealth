import { BRAND } from '../../brand'
import AiPresence from '../ai/AiPresence'
import type { AiPresenceState } from '../ai/AiPresence'

export default function TypingIndicator({
  label = `${BRAND.shortName} is preparing an educational response…`,
  presenceState = 'processing',
}: {
  label?: string
  presenceState?: AiPresenceState
}) {
  return (
    <div className="cg-response-card is-processing" aria-live="polite">
      <header className="cg-response-head">
        <AiPresence state={presenceState} size="sm" label={label} />
        <div>
          <p className="cg-response-identity">{BRAND.shortName}</p>
          <p className="cg-typing-label">{label}</p>
        </div>
      </header>
    </div>
  )
}
