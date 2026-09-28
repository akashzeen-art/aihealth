export function newId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const SHORT_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

export function shortId(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => SHORT_ALPHABET[b % SHORT_ALPHABET.length]).join('')
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`careguide:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
