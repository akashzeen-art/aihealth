import { readUserData, requireCurrentUser, writeUserData } from '../local/db'
import { newId } from '../local/ids'
import { ApiError, withApi, type ApiCallOptions } from './apiClient'
import type { DocumentItem } from '../types'

const MAX_BYTES = 12 * 1024 * 1024

async function extractText(file: File): Promise<string> {
  if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
    return (await file.text()).slice(0, 8000)
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let out = ''
    let run = ''
    for (let i = 0; i < bytes.length; i++) {
      const c = bytes[i]
      if (c >= 32 && c <= 126) {
        run += String.fromCharCode(c)
      } else {
        if (run.length >= 4) out += `${run} `
        run = ''
      }
    }
    if (run.length >= 4) out += run
    return out.replace(/\s+/g, ' ').trim().slice(0, 8000)
  }

  return ''
}

export async function listDocuments(options?: ApiCallOptions): Promise<DocumentItem[]> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    return [...data.documents].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  }, { delayMs: options?.delayMs ?? 100, signal: options?.signal })
}

export async function getDocument(id: string, options?: ApiCallOptions): Promise<DocumentItem> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const found = data.documents.find((d) => d.id === id)
    if (!found) throw new ApiError('Document not found.', { code: 'NOT_FOUND', status: 404 })
    return found
  }, { delayMs: options?.delayMs ?? 70, signal: options?.signal })
}

export async function uploadDocument(
  file: File,
  conversationId?: string,
  options?: ApiCallOptions,
): Promise<DocumentItem> {
  return withApi(async () => {
    if (!file || file.size <= 0) {
      throw new ApiError('Choose a file to upload.', { code: 'VALIDATION', status: 422 })
    }
    if (file.size > MAX_BYTES) {
      throw new ApiError('File is too large (max 12 MB for this demo).', {
        code: 'VALIDATION',
        status: 422,
      })
    }

    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const extracted = await extractText(file)
    const now = new Date().toISOString()
    const item: DocumentItem = {
      id: newId('doc'),
      conversationId: conversationId || null,
      originalFilename: file.name,
      contentType: file.type || 'application/octet-stream',
      fileSize: file.size,
      processingStatus: 'COMPLETED',
      extractionPreview: extracted
        ? extracted.slice(0, 280)
        : 'No text could be extracted locally. Paste key lines into chat for a better explanation.',
      extractedText: extracted || null,
      uploadedAt: now,
    }
    data.documents = [item, ...data.documents]
    writeUserData(user.id, data)
    return item
  }, { delayMs: options?.delayMs ?? 180, signal: options?.signal })
}

export async function linkDocumentToConversation(
  documentId: string,
  conversationId: string | null,
  options?: ApiCallOptions,
): Promise<DocumentItem> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const doc = data.documents.find((d) => d.id === documentId)
    if (!doc) throw new ApiError('Document not found.', { code: 'NOT_FOUND', status: 404 })
    if (conversationId) {
      const conv = data.conversations.find((c) => c.id === conversationId)
      if (!conv) throw new ApiError('Conversation not found.', { code: 'NOT_FOUND', status: 404 })
    }
    doc.conversationId = conversationId
    writeUserData(user.id, data)
    return doc
  }, { delayMs: options?.delayMs ?? 80, signal: options?.signal })
}

export async function deleteDocument(id: string, options?: ApiCallOptions): Promise<void> {
  return withApi(() => {
    const user = requireCurrentUser()
    const data = readUserData(user.id)
    const before = data.documents.length
    data.documents = data.documents.filter((d) => d.id !== id)
    if (data.documents.length === before) {
      throw new ApiError('Document not found.', { code: 'NOT_FOUND', status: 404 })
    }
    writeUserData(user.id, data)
  }, { delayMs: options?.delayMs ?? 90, signal: options?.signal })
}
