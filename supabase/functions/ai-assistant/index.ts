
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ── Constants ─────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-1.5-flash'

// FIX #1: Must be v1beta — `systemInstruction` and `tools` do not exist in v1.
const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`

const MAX_MESSAGES     = 40
const FETCH_TIMEOUT_MS = 25_000  // 25s — Deno edge functions time out at 30s
const MAX_IMAGE_BYTES  = 8 * 1024 * 1024  // 8 MB hard cap on image downloads

// ── CORS ──────────────────────────────────────────────────────────────────────

// Include production domain; add yours before deploying.
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  // ADD YOUR PRODUCTION DOMAIN(S) HERE, e.g.:
  // 'https://bakevault.com.ng',
  // 'https://www.bakevault.com.ng',
])

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function respond(body: unknown, origin: string | null, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const CHAT_SYSTEM = (name: string, description: string) => `
You are a helpful product assistant for BakeVault, a wholesale baking supplies store in Lagos, Nigeria.

Current product:
- Name: ${sanitizeForPrompt(name) || 'unknown'}
- Description: ${sanitizeForPrompt(description) || 'No description provided.'}

WHAT YOU CAN DO:
Answer questions about what this product is, how it is used in baking, alternatives, and storage tips.

WHAT YOU CANNOT DO (always be honest):
You do NOT know BakeVault's current prices, stock levels, or delivery schedules.
For pricing and ordering, direct users to contact BakeVault via WhatsApp.

Keep responses short and practical. Plain text only — no markdown, no bullet symbols.
`.trim()

const ANALYZE_SYSTEM = `
You are a product catalog assistant for BakeVault, a wholesale baking supplies store in Lagos, Nigeria.
Given a product image, return ONLY valid JSON with exactly two string keys — no preamble, no markdown:
{"name":"Full product name including brand, weight and variant if visible on packaging","description":"2-3 sentences about baking uses and key features"}
`.trim()

// ── Prompt injection guard ────────────────────────────────────────────────────

function sanitizeForPrompt(input: string): string {
  return input
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // control chars
    .replace(/\n\s*(ignore|forget|disregard|system:|assistant:|user:)/gi, '') // jailbreak prefixes
    .slice(0, 1000) // hard length cap — nothing legitimate needs more
}

// ── Gemini types ──────────────────────────────────────────────────────────────

interface GeminiPart {
  text?: string
  inline_data?: { mime_type: string; data: string }
}

interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

interface GeminiErrorBody {
  error?: { message?: string; code?: number; status?: string }
}

// ── Gemini API call ───────────────────────────────────────────────────────────

async function callGemini(
  apiKey:    string,
  system:    string,
  contents:  GeminiContent[],
  useSearch: boolean,
): Promise<Response> {
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  }

  if (useSearch) {
    body.tools = [{
      google_search_retrieval: {
        dynamic_retrieval_config: { mode: 'MODE_DYNAMIC', dynamic_threshold: 0.3 },
      },
    }]
  }

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    return await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

function extractText(data: Record<string, unknown>): string {
  type Candidate = { content?: { parts?: GeminiPart[] } }
  const parts = ((data?.candidates as Candidate[])?.[0]?.content?.parts ?? [])
  return parts
    .filter((p): p is { text: string } => typeof p.text === 'string')
    .map(p => p.text)
    .join('\n')
    .trim()
}

// ── SSRF-safe image fetcher ───────────────────────────────────────────────────

//Block private/link-local IP ranges to prevent SSRF attacks.

function isPrivateHost(hostname: string): boolean {
  // Reject literal private IPs and metadata endpoints
  const BLOCKED = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,     // AWS / Azure / GCP metadata
    /^::1$/,           // IPv6 loopback
    /^fc00:/i,         // IPv6 ULA
    /^fe80:/i,         // IPv6 link-local
    /^localhost$/i,
  ]
  return BLOCKED.some(re => re.test(hostname))
}

async function fetchImageAsBase64(
  url: string,
): Promise<{ data: string; mimeType: string }> {
  // Must be http(s) and not a private host
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('imageUrl must use http or https.')
  }
  if (isPrivateHost(parsed.hostname)) {
    throw new Error('imageUrl points to a disallowed private/internal address.')
  }

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'BakeVault-AI/1.0' },
      signal:  controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    throw new Error(`Image fetch failed: ${res.status} ${res.statusText}`)
  }

  // FIX #6: Cap download size to prevent memory exhaustion on large images.
  const contentLength = Number(res.headers.get('content-length') ?? '0')
  if (contentLength > MAX_IMAGE_BYTES) {
    throw new Error(`Image too large (${(contentLength / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`)
  }

  const mimeType = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim()
  const buffer   = await res.arrayBuffer()

  // Double-check actual size in case server omitted Content-Length
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`Image too large (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`)
  }

  const bytes  = new Uint8Array(buffer)
  let binary   = ''
  const chunk  = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return { data: btoa(binary), mimeType }
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
  if (!GEMINI_API_KEY) {
    return respond({
      error:
        'GEMINI_API_KEY is not configured. Run: supabase secrets set GEMINI_API_KEY=your-key',
    }, origin)
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return respond({ error: 'Invalid JSON body.' }, origin, 400)
  }

  const mode       = (body.mode as string) ?? 'chat'
  const messages   = body.messages as { role: string; content: string }[] | undefined
  const productCtx = body.productContext as { name?: string; description?: string } | undefined
  const imageUrl   = body.imageUrl as string | undefined

  // ── Mode: analyze ──────────────────────────────────────────────────────────
  if (mode === 'analyze') {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return respond({ error: 'imageUrl is required for analyze mode.' }, origin, 400)
    }

    try {
      const { data: imageData, mimeType } = await fetchImageAsBase64(imageUrl)

      const contents: GeminiContent[] = [{
        role:  'user',
        parts: [
          { inline_data: { mime_type: mimeType, data: imageData } },
          { text: 'Analyze this baking product image and return the JSON.' },
        ],
      }]

      const res        = await callGemini(GEMINI_API_KEY, ANALYZE_SYSTEM, contents, false)
      const geminiData = await res.json() as Record<string, unknown>

      if (!res.ok) {
        const errMsg = (geminiData as GeminiErrorBody)?.error?.message ?? `Gemini ${res.status}`
        return respond({ error: errMsg }, origin)
      }

      const raw   = extractText(geminiData)
      const clean = raw.replace(/```json|```/g, '').trim()

      let parsed: { name?: string; description?: string } = {}
      try {
        parsed = JSON.parse(clean)
      } catch {
        return respond({ error: 'AI returned unparseable JSON. Try again.' }, origin)
      }

      return respond({ name: parsed.name ?? '', description: parsed.description ?? '' }, origin)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analyze failed'
      console.error('[ai-assistant analyze]', msg)
      return respond({ error: msg }, origin)
    }
  }

  // ── Mode: chat ─────────────────────────────────────────────────────────────
  if (!messages || !Array.isArray(messages)) {
    return respond({ error: 'messages array is required for chat mode.' }, origin, 400)
  }
  if (messages.length > MAX_MESSAGES) {
    return respond({ error: 'Conversation too long. Please start a new chat.' }, origin, 400)
  }

  // Validate each message has the expected shape before sending to Gemini
  const invalidMsg = messages.find(
    m => typeof m.role !== 'string' || typeof m.content !== 'string',
  )
  if (invalidMsg) {
    return respond({ error: 'Each message must have string role and content fields.' }, origin, 400)
  }

  const contents: GeminiContent[] = messages.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const name        = productCtx?.name        ?? ''
  const description = productCtx?.description ?? ''

  try {
    const res        = await callGemini(GEMINI_API_KEY, CHAT_SYSTEM(name, description), contents, true)
    const geminiData = await res.json() as Record<string, unknown>

    if (!res.ok) {
      const errMsg = (geminiData as GeminiErrorBody)?.error?.message ?? `Gemini ${res.status}`
      return respond({ error: errMsg }, origin)
    }

    const text = extractText(geminiData)
    return respond({
      text: text || 'Sorry, I could not generate a response. Please try again.',
    }, origin)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Chat failed'
    console.error('[ai-assistant chat]', msg)
    return respond({ error: msg }, origin)
  }
})