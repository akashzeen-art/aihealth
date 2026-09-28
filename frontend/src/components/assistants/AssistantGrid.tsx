import type { Assistant } from '../../types'
import AssistantCard from './AssistantCard'

export default function AssistantGrid({
  assistants,
  resolveStartTo,
}: {
  assistants: Assistant[]
  resolveStartTo: (assistant: Assistant) => string
}) {
  return (
    <div className="cg-card-grid" role="list">
      {assistants.map((a) => (
        <div key={a.id} role="listitem">
          <AssistantCard assistant={a} startTo={resolveStartTo(a)} />
        </div>
      ))}
    </div>
  )
}
