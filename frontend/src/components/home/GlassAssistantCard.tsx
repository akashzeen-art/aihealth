import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Assistant } from '../../types'
import { ASSISTANT_CATALOG } from '../../utils/assistants'
import { assistantIcons } from '../assistants/assistantIcons'

export default function GlassAssistantCard({
  assistant,
  startTo,
  style,
}: {
  assistant: Assistant
  startTo: string
  style?: CSSProperties
}) {
  const catalog = ASSISTANT_CATALOG.find((a) => a.id === assistant.id)
  const name = catalog?.name ?? assistant.name
  const description = catalog?.description ?? assistant.description
  const accent = catalog?.accent ?? 'teal'
  const icon =
    assistantIcons[catalog?.iconKey ?? assistant.iconKey] ?? assistantIcons['heart-pulse']
  const supportsDocs = Boolean(assistant.supportsDocuments || catalog?.supportsDocuments)

  return (
    <article className={`glass-assistant-card accent-${accent}`} style={style}>
      <div className="glass-assistant-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="glass-assistant-title">{name}</h3>
      <p className="glass-assistant-copy">{description}</p>
      {supportsDocs && <span className="glass-assistant-chip">Supports uploads</span>}
      <Link to={startTo} className="glass-assistant-btn">
        Start Assistant
      </Link>
    </article>
  )
}
