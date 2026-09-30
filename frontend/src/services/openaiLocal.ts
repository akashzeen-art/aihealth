import { assistantScopeName, buildSystemPrompt } from '../prompts/assistantPrompts'
import { localReply } from '../utils/topicGuard'
import { ApiError } from './apiClient'
import { detectDiet, dietConstraint, dietCorrection } from '../utils/dietGuard'

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

const REFUSAL_PATTERN = /\b(can only help with|only help with|outside (of )?my scope|within my scope)\b/i

/** Earlier short scope refusals make the model keep refusing; leave them out of the context. */
function withoutPastRefusals(history: ChatTurn[]): ChatTurn[] {
  return history.filter(
    (turn) =>
      turn.role !== 'assistant' || turn.content.length > 500 || !REFUSAL_PATTERN.test(turn.content),
  )
}

function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

function openaiBaseUrl(): string {
  return import.meta.env.VITE_OPENAI_BASE_URL || '/openai-proxy'
}

export async function completeChat(options: {
  assistantCode: string
  language?: string
  country?: string | null
  documentContext?: string | null
  userDataContext?: string | null
  history: ChatTurn[]
  signal?: AbortSignal
}): Promise<string> {
  const lastUser = [...options.history].reverse().find((turn) => turn.role === 'user')
  const canned = lastUser
    ? localReply(lastUser.content, options.language, assistantScopeName(options.assistantCode))
    : null
  if (canned) return canned

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new ApiError(
      'OpenAI is not configured. Add VITE_OPENAI_API_KEY to frontend/.env and restart npm run dev.',
      { code: 'CONFIG', status: 503 },
    )
  }

  let system = buildSystemPrompt({
    assistantCode: options.assistantCode,
    language: options.language,
    country: options.country,
    timeZone: deviceTimeZone(),
    documentContext: options.documentContext,
    userDataContext: options.userDataContext,
  })

  const diet = detectDiet(
    options.history.filter((turn) => turn.role === 'user').map((turn) => turn.content),
  )
  if (diet) system += `\n\n${dietConstraint(diet)}`

  const messages: ChatTurn[] = [
    { role: 'system', content: system },
    ...withoutPastRefusals(options.history),
  ]
  const reply = await requestCompletion(apiKey, messages, options.signal)
  if (!diet) return reply

  const correction = dietCorrection(reply, diet)
  if (!correction) return reply

  const retry = await requestCompletion(
    apiKey,
    [...messages, { role: 'assistant', content: reply }, { role: 'user', content: correction }],
    options.signal,
  )
  return retry
}

async function requestCompletion(
  apiKey: string,
  messages: ChatTurn[],
  signal?: AbortSignal,
): Promise<string> {
  const model = import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  const body = {
    model,
    temperature: 0.3,
    max_tokens: 600,
    messages,
  }
  const options = { signal }

  let res: Response
  try {
    res = await fetch(`${openaiBaseUrl()}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: options.signal,
    })
  } catch (error) {
    if (options.signal?.aborted) {
      throw new ApiError('Request cancelled.', { code: 'ABORTED', status: 499, cause: error })
    }
    throw new ApiError('Could not reach the assistant service. Check your connection and try again.', {
      code: 'NETWORK',
      status: 503,
      cause: error,
    })
  }

  const data = (await res.json().catch(() => ({}))) as OpenAIChatResponse
  if (!res.ok) {
    throw new ApiError(data.error?.message || `OpenAI request failed (${res.status})`, {
      code: 'OPENAI',
      status: res.status,
    })
  }

  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new ApiError('The assistant returned an empty reply. Please try again.', {
      code: 'EMPTY',
      status: 502,
    })
  }
  return content
}
