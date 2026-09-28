export type AssistantType = string

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  preferredLanguage: string
  country?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface Assistant {
  id: AssistantType
  slug?: string
  name: string
  description: string
  iconKey: string
  supportsDocuments: boolean
  active?: boolean
}

export interface ConversationSummary {
  id: string
  assistantType: AssistantType
  title: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface Conversation extends ConversationSummary {
  messages: Message[]
}

export interface DocumentItem {
  id: string
  conversationId: string | null
  originalFilename: string
  contentType: string
  fileSize?: number
  processingStatus?: string
  extractionPreview?: string | null
  extractedText?: string | null
  uploadedAt: string
}

export interface MedicalSafetyContexts {
  onboarding: boolean
  chat: boolean
  assistants: boolean
}

export interface DisclaimerResponse {
  version: string
  title: string
  shortBanner: string
  onboardingLead: string
  acknowledgeLabel: string
  principles: string[]
  items: string[]
  contexts: MedicalSafetyContexts
  gatedAssistants: string[]
}
