import { Navigate, useParams } from 'react-router-dom'
import {
  assistantPath,
  getAssistantById,
  isAssistantSlug,
  normalizeAssistantType,
} from '../utils/assistants'

/** Redirects legacy /app/chat/:AssistantType URLs to /assistant/:slug */
export default function ChatRedirectPage() {
  const { assistantType = '', conversationId } = useParams()

  if (isAssistantSlug(assistantType)) {
    return <Navigate to={assistantPath(assistantType, conversationId)} replace />
  }

  const normalized = normalizeAssistantType(assistantType)
  if (normalized) {
    const catalog = getAssistantById(normalized)
    if (catalog) {
      return <Navigate to={assistantPath(catalog.slug, conversationId)} replace />
    }
  }

  return <Navigate to="/" replace />
}
