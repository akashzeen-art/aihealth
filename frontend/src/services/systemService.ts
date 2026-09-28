import { ASSISTANT_CATALOG } from '../utils/assistants'
import { requireCurrentUser } from '../local/db'
import { readApiHealth, withApi, type ApiCallOptions, type ApiHealth } from './apiClient'

export type SystemStatus = ApiHealth & {
  assistantsAvailable: number
  signedIn: boolean
  userId: string | null
}

/** Aggregate status for multipage loaders / diagnostics. */
export async function getSystemStatus(options?: ApiCallOptions): Promise<SystemStatus> {
  return withApi(() => {
    const health = readApiHealth()
    let signedIn = false
    let userId: string | null = null
    try {
      const user = requireCurrentUser()
      signedIn = true
      userId = user.id
    } catch {
      signedIn = false
    }
    return {
      ...health,
      assistantsAvailable: ASSISTANT_CATALOG.length,
      signedIn,
      userId,
    }
  }, { delayMs: options?.delayMs ?? 60, signal: options?.signal })
}
