export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'string' && error.trim()) return error
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export function getErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code
    return typeof code === 'string' ? code : null
  }
  return null
}

export function validateChatInput(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Please enter a question before sending.'
  if (trimmed.length > 10000) return 'Message is too long (max 10,000 characters).'
  return null
}
