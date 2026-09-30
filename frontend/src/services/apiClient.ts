/** Shared client helpers for CareGuide local + OpenAI-backed APIs. */

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly cause?: unknown

  constructor(
    message: string,
    options?: { code?: string; status?: number; cause?: unknown },
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = options?.code ?? 'API_ERROR'
    this.status = options?.status ?? 400
    this.cause = options?.cause
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function toApiError(error: unknown, fallback = 'Something went wrong'): ApiError {
  if (error instanceof ApiError) return error
  if (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  ) {
    return new ApiError(
      'Browser storage is full. Older demo data was cleared when possible — try again.',
      { code: 'STORAGE_FULL', status: 507, cause: error },
    )
  }
  if (error instanceof Error && error.message.trim()) {
    return new ApiError(error.message, { code: 'UNEXPECTED', cause: error })
  }
  return new ApiError(fallback, { code: 'UNEXPECTED', cause: error })
}

export type ApiCallOptions = {
  /** Soft latency so localStorage APIs feel intentional (ms). */
  delayMs?: number
  signal?: AbortSignal
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new ApiError('Request cancelled.', { code: 'ABORTED', status: 499 })
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new ApiError('Request cancelled.', { code: 'ABORTED', status: 499 }))
    }
    if (signal?.aborted) {
      onAbort()
      return
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Wraps a local or remote API call with optional latency, abort, and ApiError normalization.
 */
export async function withApi<T>(
  run: () => Promise<T> | T,
  options: ApiCallOptions = {},
): Promise<T> {
  const delayMs = options.delayMs ?? 120
  assertNotAborted(options.signal)
  try {
    await wait(delayMs, options.signal)
    assertNotAborted(options.signal)
    return await run()
  } catch (error) {
    throw toApiError(error)
  }
}

export type ApiHealth = {
  ok: boolean
  mode: 'local-demo'
  openaiConfigured: boolean
  model: string
  timestamp: string
}

export function readApiHealth(): ApiHealth {
  return {
    ok: true,
    mode: 'local-demo',
    openaiConfigured: true,
    model: import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    timestamp: new Date().toISOString(),
  }
}
