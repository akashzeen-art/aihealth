import { create } from 'zustand'
import { isQuotaError, readAccounts, reclaimLocalStorage, safeSetItem, writeAccounts } from '../local/db'
import { newId } from '../local/ids'
import { ACCESS_KEY, REFRESH_KEY, USER_KEY } from '../local/keys'
import type { User } from '../types'

export { ACCESS_KEY, REFRESH_KEY, USER_KEY }

const LOCAL_ACCOUNT_KEY = 'local:default'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as User & { fullName?: string }
    if (!parsed.name && parsed.fullName) {
      parsed.name = parsed.fullName
    }
    return parsed
  } catch {
    return null
  }
}

function persistSession(user: User) {
  const token = `local_${user.id}`
  try {
    safeSetItem(ACCESS_KEY, token)
    safeSetItem(REFRESH_KEY, `local_refresh_${user.id}`)
    safeSetItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    if (!isQuotaError(error)) throw error
    reclaimLocalStorage(undefined, { aggressive: true })
    localStorage.setItem(ACCESS_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
  return token
}

/**
 * Care+ has no sign-in: everything is stored under one local profile in this browser.
 * Reuses the last active profile when present so existing chats, readings and reminders stay.
 */
function ensureLocalUser(): User {
  const accounts = readAccounts()
  const stored = readStoredUser()
  if (stored && Object.values(accounts).some((a) => a.user.id === stored.id)) {
    return stored
  }

  const existing = accounts[LOCAL_ACCOUNT_KEY]?.user
  if (existing) return existing

  const now = new Date().toISOString()
  const user: User = {
    id: newId('user'),
    name: 'Friend',
    email: 'local@careguide.local',
    phone: null,
    preferredLanguage: 'en',
    country: null,
    active: true,
    createdAt: now,
    updatedAt: now,
  }
  try {
    writeAccounts({ ...accounts, [LOCAL_ACCOUNT_KEY]: { passwordHash: 'local', user } })
  } catch {
    /* storage unavailable — the profile still works for this session */
  }
  return user
}

const SIGNED_UP_KEY = 'careguide_signed_up'

function readSignedUp(userId: string): boolean {
  return localStorage.getItem(SIGNED_UP_KEY) === userId
}

interface AuthState {
  token: string
  user: User
  /** Always true — kept so screens can share one code path. */
  isAuthenticated: true
  /** Optional sign-up: the user has saved their own name and details. */
  signedUp: boolean
  setUser: (user: User) => void
  completeSignup: (user: User) => void
}

const initialUser = ensureLocalUser()
const initialToken = persistSession(initialUser)

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: true,
  signedUp: readSignedUp(initialUser.id),

  setUser: (user) => {
    safeSetItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  completeSignup: (user) => {
    safeSetItem(USER_KEY, JSON.stringify(user))
    safeSetItem(SIGNED_UP_KEY, user.id)
    set({ user, signedUp: true })
  },
}))
