import { buildSystemPrompt } from '../prompts/assistantPrompts'
import { ApiError } from './apiClient'

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new ApiError(
      'OpenAI is not configured. Add VITE_OPENAI_API_KEY to frontend/.env and restart npm run dev.',
      { code: 'CONFIG', status: 503 },
    )
  }

  const system = buildSystemPrompt({
    assistantCode: options.assistantCode,
    language: options.language,
    country: options.country,
    documentContext: options.documentContext,
    userDataContext: options.userDataContext,
  })

  const model = import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  const body = {
    model,
    temperature: 0.3,
    messages: [{ role: 'system', content: system }, ...options.history],
  }

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
