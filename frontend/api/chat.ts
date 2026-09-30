const MAX_BODY_CHARS = 200_000
const MAX_TOKENS = 800

type ChatBody = {
  messages?: unknown
  temperature?: unknown
  max_tokens?: unknown
}

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    return json(503, { error: { message: 'The assistant is not configured on the server yet.' } })
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_CHARS) {
    return json(413, { error: { message: 'Message is too long.' } })
  }

  let body: ChatBody
  try {
    body = JSON.parse(raw) as ChatBody
  } catch {
    return json(400, { error: { message: 'Invalid request.' } })
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(400, { error: { message: 'Invalid request.' } })
  }

  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.3
  const maxTokens =
    typeof body.max_tokens === 'number' ? Math.min(body.max_tokens, MAX_TOKENS) : 600

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim(),
      temperature,
      max_tokens: maxTokens,
      messages: body.messages,
    }),
  })

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
