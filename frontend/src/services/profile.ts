import { requireCurrentUser, updateUserAccount } from '../local/db'
import { ApiError, withApi, type ApiCallOptions } from './apiClient'
import type { User } from '../types'

export async function getProfile(options?: ApiCallOptions): Promise<User> {
  return withApi(() => requireCurrentUser(), {
    delayMs: options?.delayMs ?? 80,
    signal: options?.signal,
  })
}

export async function updateProfile(
  payload: {
    name?: string
    phone?: string
    preferredLanguage: string
    country?: string
  },
  options?: ApiCallOptions,
): Promise<User> {
  return withApi(() => {
    const current = requireCurrentUser()
    const name = payload.name?.trim() || current.name
    if (name.length < 2) {
      throw new ApiError('Name must be at least 2 characters.', {
        code: 'VALIDATION',
        status: 422,
      })
    }
    const updated: User = {
      ...current,
      name,
      phone: payload.phone?.trim() || null,
      preferredLanguage: payload.preferredLanguage.trim() || 'en',
      country: payload.country?.trim() || null,
      updatedAt: new Date().toISOString(),
    }
    updateUserAccount(updated)
    return updated
  }, { delayMs: options?.delayMs ?? 120, signal: options?.signal })
}
