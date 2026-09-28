import { readUserData, requireCurrentUser, writeUserData } from '../local/db'
import { shortId } from '../local/ids'
import { ApiError, withApi, type ApiCallOptions } from './apiClient'
import type { AssistantType, Conversation, ConversationSummary } from '../types'

function toSummary(c: Conversation): ConversationSummary {
  return {
    id: c.id,
    assistantType: c.assistantType,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

/** Maps a short URL id back to the stored conversation id (older ids are `conv_<uuid>`). */
export function resolveConversationId(urlId: string | undefined): string | undefined {
  if (!urlId) return undefined
  try {
    const data = readUserData(requireCurrentUser().id)
    const match =
      data.conversations.find((c) => c.id === urlId) ??
      data.conversations.find((c) => c.id.startsWith(`conv_${urlId}`))
    return match?.id ?? urlId
  } catch {
    return urlId
  }
}

export async function listConversations(
  assistantType?: AssistantType,
  options?: ApiCallOptions,
): Promise<ConversationSummary[]> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    let list = [...data.conversations]
    if (assistantType) {
      const code = assistantType.toUpperCase()
      list = list.filter((c) => c.assistantType.toUpperCase() === code)
    }
    list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return list.map(toSummary)
  }, { delayMs: options?.delayMs ?? 110, signal: options?.signal })
}

export async function createConversation(
  assistantType: AssistantType,
  title?: string,
  options?: ApiCallOptions,
): Promise<ConversationSummary> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const now = new Date().toISOString()
    const taken = new Set(data.conversations.map((c) => c.id))
    let id = shortId()
    while (taken.has(id)) id = shortId()
    const conversation: Conversation = {
      id,
      assistantType: assistantType.toUpperCase(),
      title: title?.trim() || 'New chat',
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    data.conversations = [conversation, ...data.conversations]
    writeUserData(user.id, data)
    return toSummary(conversation)
  }, { delayMs: options?.delayMs ?? 100, signal: options?.signal })
}

export async function getConversation(
  id: string,
  options?: ApiCallOptions,
): Promise<Conversation> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const found = data.conversations.find((c) => c.id === id)
    if (!found) throw new ApiError('Conversation not found.', { code: 'NOT_FOUND', status: 404 })
    return found
  }, { delayMs: options?.delayMs ?? 90, signal: options?.signal })
}

export async function renameConversation(
  id: string,
  title: string,
  options?: ApiCallOptions,
): Promise<ConversationSummary> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const found = data.conversations.find((c) => c.id === id)
    if (!found) throw new ApiError('Conversation not found.', { code: 'NOT_FOUND', status: 404 })
    const next = title.trim().slice(0, 80)
    if (!next) throw new ApiError('Title cannot be empty.', { code: 'VALIDATION', status: 422 })
    found.title = next
    found.updatedAt = new Date().toISOString()
    writeUserData(user.id, data)
    return toSummary(found)
  }, { delayMs: options?.delayMs ?? 90, signal: options?.signal })
}

export async function deleteConversation(id: string, options?: ApiCallOptions): Promise<void> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const before = data.conversations.length
    data.conversations = data.conversations.filter((c) => c.id !== id)
    if (data.conversations.length === before) {
      throw new ApiError('Conversation not found.', { code: 'NOT_FOUND', status: 404 })
    }
    data.documents = data.documents.map((d) =>
      d.conversationId === id ? { ...d, conversationId: null } : d,
    )
    writeUserData(user.id, data)
  }, { delayMs: options?.delayMs ?? 100, signal: options?.signal })
}
