import { readUserData, requireCurrentUser, writeUserData } from '../local/db'
import { newId } from '../local/ids'
import { userDataContextFor } from '../local/healthTools'
import { ApiError, withApi, type ApiCallOptions } from './apiClient'
import { completeChat, type ChatTurn } from './openaiLocal'
import type { Message } from '../types'

function documentContextFor(conversationId: string, userId: string): string | null {
  const data = readUserData(userId)
  const docs = data.documents
    .filter((d) => d.conversationId === conversationId || !d.conversationId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  const recent = docs.slice(0, 3)
  if (!recent.length) return null
  return recent
    .map((d) => {
      const text = d.extractedText?.trim() || d.extractionPreview?.trim() || '(no text extracted)'
      return `File: ${d.originalFilename}\n${text}`
    })
    .join('\n\n---\n\n')
}

export async function listMessages(
  conversationId: string,
  options?: ApiCallOptions,
): Promise<Message[]> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const conv = data.conversations.find((c) => c.id === conversationId)
    if (!conv) throw new ApiError('Conversation not found.', { code: 'NOT_FOUND', status: 404 })
    return conv.messages
  }, { delayMs: options?.delayMs ?? 80, signal: options?.signal })
}

export async function sendMessage(
  conversationId: string,
  message: string,
  language?: string,
  options?: ApiCallOptions,
): Promise<Message> {
  return withApi(async () => {
    const trimmed = message.trim()
    if (!trimmed) {
      throw new ApiError('Please enter a question before sending.', {
        code: 'VALIDATION',
        status: 422,
      })
    }
    if (trimmed.length > 10000) {
      throw new ApiError('Message is too long (max 10,000 characters).', {
        code: 'VALIDATION',
        status: 422,
      })
    }

    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const conv = data.conversations.find((c) => c.id === conversationId)
    if (!conv) throw new ApiError('Conversation not found.', { code: 'NOT_FOUND', status: 404 })

    const now = new Date().toISOString()
    const userMsg: Message = {
      id: newId('msg'),
      role: 'USER',
      content: trimmed,
      createdAt: now,
    }
    conv.messages = [...conv.messages, userMsg]
    if (conv.title === 'New chat') {
      conv.title = trimmed.slice(0, 60) || conv.title
    }
    conv.updatedAt = now
    writeUserData(user.id, data)

    const history: ChatTurn[] = conv.messages
      .filter((m) => m.role === 'USER' || m.role === 'ASSISTANT')
      .slice(-16)
      .map((m) => ({
        role: m.role === 'USER' ? 'user' : 'assistant',
        content: m.content,
      }))

    const replyText = await completeChat({
      assistantCode: conv.assistantType,
      language: language || user.preferredLanguage,
      country: user.country,
      documentContext: documentContextFor(conversationId, user.id),
      userDataContext: userDataContextFor(conv.assistantType, user.id),
      history,
      signal: options?.signal,
    })

    const assistantMsg: Message = {
      id: newId('msg'),
      role: 'ASSISTANT',
      content: replyText,
      createdAt: new Date().toISOString(),
    }
    conv.messages = [...conv.messages, assistantMsg]
    conv.updatedAt = assistantMsg.createdAt
    writeUserData(user.id, data)
    return assistantMsg
  }, { delayMs: options?.delayMs ?? 40, signal: options?.signal })
}
