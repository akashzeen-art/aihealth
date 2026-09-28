/**
 * CareGuide API surface — local demo storage + optional OpenAI chat.
 * Pages should prefer importing from here for a stable contract.
 */
export { ApiError, isApiError, readApiHealth, toApiError, withApi } from './apiClient'
export type { ApiCallOptions, ApiHealth } from './apiClient'

export { listAssistants, getAssistant } from './assistantService'
export {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  renameConversation,
} from './conversationService'
export { listMessages, sendMessage } from './messageService'
export {
  listDocuments,
  uploadDocument,
  deleteDocument,
  getDocument,
  linkDocumentToConversation,
} from './documentService'
export { getProfile, updateProfile } from './profile'
export { getDisclaimers } from './public'
export { getSystemStatus } from './systemService'
