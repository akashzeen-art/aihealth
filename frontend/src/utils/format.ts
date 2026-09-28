export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString()
}

export function truncate(text: string, max = 180): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}
