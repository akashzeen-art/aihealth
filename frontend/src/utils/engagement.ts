import { BRAND } from '../brand'
import type { Conversation, Message } from '../types'
import { getAssistantById } from './assistants'

function stripMd(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Build a shareable educational brief — not a clinical record. */
export function buildClinicianBrief(conversation: Conversation): string {
  const catalog = getAssistantById(conversation.assistantType)
  const assistantName = catalog?.name || conversation.assistantType
  const lines: string[] = [
    `${BRAND.name} — Clinician conversation brief`,
    `Generated: ${new Date().toLocaleString()}`,
    `Assistant: ${assistantName}`,
    `Title: ${conversation.title || 'Untitled'}`,
    '',
    'IMPORTANT: This is educational material prepared by the user.',
    'It is NOT a medical record, diagnosis, or clinical recommendation.',
    'Please review with a qualified clinician for personal care decisions.',
    '',
    '— Conversation highlights —',
    '',
  ]

  const useful = conversation.messages.filter(
    (m) => m.role === 'USER' || m.role === 'ASSISTANT',
  )

  for (const m of useful.slice(-12)) {
    const who = m.role === 'USER' ? 'You asked' : `${BRAND.shortName} shared (educational)`
    lines.push(`${who}:`)
    lines.push(stripMd(m.content))
    lines.push('')
  }

  lines.push('— Suggested questions for your clinician —')
  lines.push('(Edit these before your visit.)')
  lines.push('1. What does this mean for my situation?')
  lines.push('2. What should I watch for or follow up on?')
  lines.push('3. Is there anything here I should not decide alone?')
  lines.push('')
  lines.push(`Prepared with ${BRAND.name}. Educational use only.`)

  return lines.join('\n')
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyText(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch {
    return false
  }
}

export function weeklyRecapStats(input: {
  conversations: { updatedAt: string; assistantType: string }[]
  documents: { uploadedAt: string }[]
  bookmarksCount: number
}) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const chats = input.conversations.filter(
    (c) => new Date(c.updatedAt).getTime() >= weekAgo,
  )
  const docs = input.documents.filter((d) => new Date(d.uploadedAt).getTime() >= weekAgo)
  const assistants = new Set(chats.map((c) => c.assistantType)).size
  return {
    chats: chats.length,
    documents: docs.length,
    assistants,
    bookmarks: input.bookmarksCount,
  }
}

export function nextFollowUpFromMessages(messages: Message[]): string | null {
  const last = [...messages].reverse().find((m) => m.role === 'ASSISTANT')
  if (!last) return null
  const questions = last.content
    .split('\n')
    .map((l) => l.replace(/^[-*\d.)\s]+/, '').trim())
    .filter((l) => l.endsWith('?') && l.length > 12 && l.length < 140)
  return questions[0] || null
}
