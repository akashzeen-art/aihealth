import type { Conversation, DocumentItem, User } from '../types'
import { DATA_PREFIX, USER_KEY, USERS_KEY } from './keys'

export { DATA_PREFIX, USERS_KEY } from './keys'

const MAX_CONVERSATIONS = 40
const MAX_MESSAGES_PER_CONV = 80
const MAX_DOCUMENTS = 12
const MAX_EXTRACTED_CHARS = 8000
const MAX_PREVIEW_CHARS = 280

export interface StoredAccount {
  passwordHash: string
  user: User
}

export interface UserData {
  conversations: Conversation[]
  documents: DocumentItem[]
}

function emptyData(): UserData {
  return { conversations: [], documents: [] }
}

export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  )
}

/** Best-effort localStorage write with one reclaim + retry on quota errors. */
export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    if (!isQuotaError(error)) throw error
    reclaimLocalStorage(key)
    try {
      localStorage.setItem(key, value)
    } catch (retryError) {
      if (!isQuotaError(retryError)) throw retryError
      reclaimLocalStorage(key, { aggressive: true })
      localStorage.setItem(key, value)
    }
  }
}

function estimateBytes(value: string): number {
  return value.length * 2
}

/** Drop orphan data keys and shrink the largest CareGuide payloads. */
export function reclaimLocalStorage(
  preserveKey?: string,
  options?: { aggressive?: boolean },
): void {
  const aggressive = Boolean(options?.aggressive)
  const accounts = readAccounts()
  const knownUserIds = new Set(Object.values(accounts).map((a) => a.user.id))

  // Remove orphaned per-user data blobs
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(DATA_PREFIX)) continue
    const userId = key.slice(DATA_PREFIX.length)
    if (!knownUserIds.has(userId)) {
      localStorage.removeItem(key)
    }
  }

  // Compact every known user dataset (strip bulky extracted text / trim history)
  for (const userId of knownUserIds) {
    const key = dataKey(userId)
    const data = readUserData(userId)
    const compacted = compactUserData(data, { aggressive })
    try {
      localStorage.setItem(key, JSON.stringify(compacted))
    } catch {
      localStorage.removeItem(key)
      try {
        localStorage.setItem(key, JSON.stringify(emptyData()))
      } catch {
        // ignore
      }
    }
  }

  if (aggressive) {
    // Drop non-essential CareGuide keys except auth session + accounts
    const keep = new Set([
      USERS_KEY,
      USER_KEY,
      'careguide_token',
      'careguide_refresh',
      preserveKey,
    ])
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('careguide_')) continue
      if (keep.has(key)) continue
      if (key.startsWith(DATA_PREFIX)) {
        // Keep one empty stub so keys stay addressable
        localStorage.setItem(key, JSON.stringify(emptyData()))
        continue
      }
      // Keep preloader / safety acknowledgements unless still over quota
      if (
        key.includes('preloader') ||
        key.includes('onboarding') ||
        key.includes('assistant_ack')
      ) {
        continue
      }
    }
  }
}

export function compactUserData(
  data: UserData,
  options?: { aggressive?: boolean },
): UserData {
  const aggressive = Boolean(options?.aggressive)
  const maxConvs = aggressive ? 8 : MAX_CONVERSATIONS
  const maxMsgs = aggressive ? 20 : MAX_MESSAGES_PER_CONV
  const maxDocs = aggressive ? 3 : MAX_DOCUMENTS
  const maxExtracted = aggressive ? 0 : MAX_EXTRACTED_CHARS

  const conversations = [...data.conversations]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, maxConvs)
    .map((c) => ({
      ...c,
      messages: (c.messages || []).slice(-maxMsgs),
    }))

  const documents = [...data.documents]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, maxDocs)
    .map((d, index) => {
      const keepFull = !aggressive && index === 0 && d.extractedText
      const extracted = keepFull
        ? (d.extractedText || '').slice(0, maxExtracted)
        : maxExtracted > 0 && index < 2
          ? (d.extractedText || '').slice(0, Math.min(2000, maxExtracted))
          : null
      const preview =
        d.extractionPreview?.slice(0, MAX_PREVIEW_CHARS) ||
        extracted?.slice(0, MAX_PREVIEW_CHARS) ||
        d.extractionPreview ||
        null
      return {
        ...d,
        extractedText: extracted,
        extractionPreview: preview,
      }
    })

  return { conversations, documents }
}

export function readAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, StoredAccount>) : {}
  } catch {
    return {}
  }
}

export function writeAccounts(accounts: Record<string, StoredAccount>) {
  // Accounts map should stay tiny — if write fails, reclaim then rewrite only slim accounts
  const slim: Record<string, StoredAccount> = {}
  for (const [key, value] of Object.entries(accounts)) {
    slim[key] = {
      passwordHash: value.passwordHash || 'demo',
      user: value.user,
    }
  }
  try {
    safeSetItem(USERS_KEY, JSON.stringify(slim))
  } catch (error) {
    if (!isQuotaError(error)) throw error
    // Nuclear fallback for login: keep only the newest ~20 accounts
    const entries = Object.entries(slim)
      .sort((a, b) => b[1].user.updatedAt.localeCompare(a[1].user.updatedAt))
      .slice(0, 20)
    const trimmed = Object.fromEntries(entries)
    // Free all user data blobs first
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith(DATA_PREFIX)) localStorage.removeItem(key)
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(trimmed))
  }
}

export function requireCurrentUser(): User {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) throw new Error('Please sign in to continue.')
    return JSON.parse(raw) as User
  } catch {
    throw new Error('Please sign in to continue.')
  }
}

function dataKey(userId: string) {
  return `${DATA_PREFIX}${userId}`
}

export function readUserData(userId: string): UserData {
  try {
    const raw = localStorage.getItem(dataKey(userId))
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as UserData
    return {
      conversations: parsed.conversations || [],
      documents: parsed.documents || [],
    }
  } catch {
    return emptyData()
  }
}

export function writeUserData(userId: string, data: UserData) {
  const compacted = compactUserData(data)
  try {
    safeSetItem(dataKey(userId), JSON.stringify(compacted))
  } catch (error) {
    if (!isQuotaError(error)) throw error
    const emergency = compactUserData(data, { aggressive: true })
    try {
      safeSetItem(dataKey(userId), JSON.stringify(emergency))
    } catch {
      // Preserve ability to keep chatting with empty cache
      localStorage.removeItem(dataKey(userId))
      localStorage.setItem(dataKey(userId), JSON.stringify(emptyData()))
      throw new Error(
        'Browser storage is full. Older conversations/documents were cleared so CareGuide can continue.',
      )
    }
  }
}

export function updateUserAccount(user: User) {
  const accounts = readAccounts()
  const phoneKey = user.phone ? `mobile:${user.phone.replace(/\D/g, '')}` : null
  const emailKey = user.email.trim().toLowerCase()
  const idKey = Object.keys(accounts).find((k) => accounts[k].user.id === user.id)
  const key =
    idKey ||
    (phoneKey && accounts[phoneKey] ? phoneKey : null) ||
    (accounts[emailKey] ? emailKey : null) ||
    phoneKey ||
    emailKey
  const existing = accounts[key]
  if (!existing) throw new Error('Account not found.')
  accounts[key] = { ...existing, user }
  writeAccounts(accounts)
  safeSetItem(USER_KEY, JSON.stringify(user))
}

/** Call once at app start to shrink any already-oversized payloads. */
export function hydrateStorageGuard(): void {
  try {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      total += estimateBytes(localStorage.getItem(key) || '')
    }
    // ~4.5MB soft threshold (quota is often ~5MB)
    if (total > 4_500_000) {
      reclaimLocalStorage(undefined, { aggressive: true })
    } else if (total > 3_000_000) {
      reclaimLocalStorage()
    }
  } catch {
    // ignore — storage may be unavailable
  }
}
