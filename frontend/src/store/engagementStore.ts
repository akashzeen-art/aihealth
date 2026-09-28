import { create } from 'zustand'
import { ACCESS_KEY } from '../local/keys'
import type { AssistantType } from '../types'

const ENGAGEMENT_PREFIX = 'careguide_engagement_v1_'

export type ChecklistId = 'chat' | 'document' | 'language' | 'journey'

export interface BookmarkItem {
  id: string
  messageId: string
  conversationId: string
  assistantType: AssistantType
  assistantSlug: string
  title: string
  excerpt: string
  createdAt: string
}

export interface DocumentInsight {
  id: string
  documentId: string
  documentName: string
  summary: string
  questions: string
  createdAt: string
}

export interface EngagementData {
  bookmarks: BookmarkItem[]
  favoriteAssistants: string[]
  pinnedConversations: string[]
  checklist: Partial<Record<ChecklistId, boolean>>
  documentInsights: DocumentInsight[]
}

const EMPTY: EngagementData = {
  bookmarks: [],
  favoriteAssistants: [],
  pinnedConversations: [],
  checklist: {},
  documentInsights: [],
}

function userScope(): string {
  try {
    const raw = localStorage.getItem('careguide_user')
    if (!raw) return 'guest'
    const user = JSON.parse(raw) as { id?: string }
    return user.id || 'guest'
  } catch {
    return 'guest'
  }
}

function storageKey(): string {
  return `${ENGAGEMENT_PREFIX}${userScope()}`
}

function load(): EngagementData {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return { ...EMPTY, checklist: {}, bookmarks: [], favoriteAssistants: [], pinnedConversations: [], documentInsights: [] }
    const parsed = JSON.parse(raw) as Partial<EngagementData>
    return {
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks.slice(0, 40) : [],
      favoriteAssistants: Array.isArray(parsed.favoriteAssistants)
        ? parsed.favoriteAssistants.slice(0, 12)
        : [],
      pinnedConversations: Array.isArray(parsed.pinnedConversations)
        ? parsed.pinnedConversations.slice(0, 20)
        : [],
      checklist: parsed.checklist && typeof parsed.checklist === 'object' ? parsed.checklist : {},
      documentInsights: Array.isArray(parsed.documentInsights)
        ? parsed.documentInsights.slice(0, 24)
        : [],
    }
  } catch {
    return {
      bookmarks: [],
      favoriteAssistants: [],
      pinnedConversations: [],
      checklist: {},
      documentInsights: [],
    }
  }
}

function persist(data: EngagementData) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(data))
  } catch {
    /* quota — ignore silently */
  }
}

function excerptOf(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, max)}…`
}

function titleOf(text: string): string {
  const line = text
    .split('\n')
    .map((l) => l.replace(/^#+\s*/, '').trim())
    .find((l) => l.length > 0)
  if (!line) return 'Saved insight'
  return line.length > 72 ? `${line.slice(0, 72)}…` : line
}

interface EngagementState extends EngagementData {
  hydrate: () => void
  addBookmark: (input: {
    messageId: string
    conversationId: string
    assistantType: AssistantType
    assistantSlug: string
    content: string
  }) => void
  removeBookmark: (id: string) => void
  isBookmarked: (messageId: string) => boolean
  toggleFavoriteAssistant: (assistantId: string) => void
  isFavoriteAssistant: (assistantId: string) => boolean
  togglePinnedConversation: (conversationId: string) => void
  isPinnedConversation: (conversationId: string) => boolean
  completeChecklist: (id: ChecklistId) => void
  checklistProgress: () => { done: number; total: number; items: { id: ChecklistId; label: string; done: boolean }[] }
  addDocumentInsight: (input: {
    documentId: string
    documentName: string
    summary: string
    questions?: string
  }) => void
  removeDocumentInsight: (id: string) => void
}

const CHECKLIST_ITEMS: { id: ChecklistId; label: string }[] = [
  { id: 'chat', label: 'Start a health question' },
  { id: 'document', label: 'Upload or open a document' },
  { id: 'language', label: 'Confirm your language' },
  { id: 'journey', label: 'Try a guided journey' },
]

export const useEngagementStore = create<EngagementState>((set, get) => ({
  ...load(),

  hydrate: () => {
    const next = load()
    set(next)
  },

  addBookmark: (input) => {
    if (!input.conversationId || !input.messageId) return
    const existing = get().bookmarks.find((b) => b.messageId === input.messageId)
    if (existing) return
    const item: BookmarkItem = {
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      messageId: input.messageId,
      conversationId: input.conversationId,
      assistantType: input.assistantType,
      assistantSlug: input.assistantSlug,
      title: titleOf(input.content),
      excerpt: excerptOf(input.content),
      createdAt: new Date().toISOString(),
    }
    const bookmarks = [item, ...get().bookmarks].slice(0, 40)
    const next = { ...get(), bookmarks }
    persist(next)
    set({ bookmarks })
  },

  removeBookmark: (id) => {
    const bookmarks = get().bookmarks.filter((b) => b.id !== id)
    persist({ ...get(), bookmarks })
    set({ bookmarks })
  },

  isBookmarked: (messageId) => get().bookmarks.some((b) => b.messageId === messageId),

  toggleFavoriteAssistant: (assistantId) => {
    const current = get().favoriteAssistants
    const favoriteAssistants = current.includes(assistantId)
      ? current.filter((id) => id !== assistantId)
      : [assistantId, ...current].slice(0, 12)
    persist({ ...get(), favoriteAssistants })
    set({ favoriteAssistants })
  },

  isFavoriteAssistant: (assistantId) => get().favoriteAssistants.includes(assistantId),

  togglePinnedConversation: (conversationId) => {
    const current = get().pinnedConversations
    const pinnedConversations = current.includes(conversationId)
      ? current.filter((id) => id !== conversationId)
      : [conversationId, ...current].slice(0, 20)
    persist({ ...get(), pinnedConversations })
    set({ pinnedConversations })
  },

  isPinnedConversation: (conversationId) =>
    get().pinnedConversations.includes(conversationId),

  completeChecklist: (id) => {
    const checklist = { ...get().checklist, [id]: true }
    persist({ ...get(), checklist })
    set({ checklist })
  },

  checklistProgress: () => {
    const checklist = get().checklist
    const items = CHECKLIST_ITEMS.map((item) => ({
      ...item,
      done: Boolean(checklist[item.id]),
    }))
    return {
      done: items.filter((i) => i.done).length,
      total: items.length,
      items,
    }
  },

  addDocumentInsight: (input) => {
    const item: DocumentInsight = {
      id: `di_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      documentId: input.documentId,
      documentName: input.documentName,
      summary: excerptOf(input.summary, 280),
      questions: excerptOf(input.questions || '', 280),
      createdAt: new Date().toISOString(),
    }
    const documentInsights = [
      item,
      ...get().documentInsights.filter((d) => d.documentId !== input.documentId),
    ].slice(0, 24)
    const checklist = { ...get().checklist, document: true }
    persist({ ...get(), documentInsights, checklist })
    set({ documentInsights, checklist })
  },

  removeDocumentInsight: (id) => {
    const documentInsights = get().documentInsights.filter((d) => d.id !== id)
    persist({ ...get(), documentInsights })
    set({ documentInsights })
  },
}))

/** Call after login so engagement scopes to the user. */
export function hydrateEngagementForSession() {
  if (!localStorage.getItem(ACCESS_KEY)) return
  useEngagementStore.getState().hydrate()
}
