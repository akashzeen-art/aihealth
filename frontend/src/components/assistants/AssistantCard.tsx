import { Link } from 'react-router-dom'
import type { Assistant } from '../../types'
import { ASSISTANT_CATALOG } from '../../utils/assistants'
import { assistantIcons } from './assistantIcons'

export default function AssistantCard({
  assistant,
  startTo,
}: {
  assistant: Assistant
  startTo: string
}) {
  const catalog = ASSISTANT_CATALOG.find((a) => a.id === assistant.id)
  const name = catalog?.name ?? assistant.name
  const description = catalog?.description ?? assistant.description
  const accent = catalog?.accent ?? 'teal'
  const slug = catalog?.slug ?? 'health'
  const safety = catalog?.safetyInfo
  const icon =
    assistantIcons[catalog?.iconKey ?? assistant.iconKey] ?? assistantIcons['heart-pulse']
  const supportsDocs = Boolean(assistant.supportsDocuments || catalog?.supportsDocuments)

  return (
    <article className={`cg-card accent-${accent} personality-${slug}`}>
      <div className="cg-card-glow" aria-hidden="true" />
      <div className="cg-motif" aria-hidden="true" />
      <div className="cg-card-fx" aria-hidden="true" />
      <div className="cg-card-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="cg-card-title">{name}</h3>
      <p className="cg-card-copy">{description}</p>
      {supportsDocs && <span className="cg-card-tag">Supports uploads</span>}
      {safety && <p className="cg-card-safety">{safety}</p>}
      <Link to={startTo} className="cg-card-btn">
        Begin
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}
