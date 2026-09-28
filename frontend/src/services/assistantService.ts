import { withApi, type ApiCallOptions } from './apiClient'
import { ASSISTANT_CATALOG } from '../utils/assistants'
import type { Assistant } from '../types'

function toAssistant(a: (typeof ASSISTANT_CATALOG)[number]): Assistant {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.description,
    iconKey: a.iconKey,
    supportsDocuments: Boolean(a.supportsDocuments),
    active: true,
  }
}

export async function listAssistants(options?: ApiCallOptions): Promise<Assistant[]> {
  return withApi(() => ASSISTANT_CATALOG.map(toAssistant), {
    delayMs: options?.delayMs ?? 90,
    signal: options?.signal,
  })
}

export async function getAssistant(
  idOrSlug: string,
  options?: ApiCallOptions,
): Promise<Assistant> {
  return withApi(() => {
    const key = idOrSlug.trim().toLowerCase()
    const found = ASSISTANT_CATALOG.find(
      (a) => a.id.toLowerCase() === key || a.slug.toLowerCase() === key,
    )
    if (!found) throw new Error('Assistant not found.')
    return toAssistant(found)
  }, { delayMs: options?.delayMs ?? 60, signal: options?.signal })
}
