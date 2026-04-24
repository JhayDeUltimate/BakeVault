// Supabase Edge Function — AI Product Assistant (Gemini)
// ─────────────────────────────────────────────────────────────────────
// DEPLOY: supabase functions deploy ai-assistant --no-verify-jwt
// SECRET: supabase secrets set GEMINI_API_KEY=your-google-ai-studio-key
//
// FREE KEY: https://aistudio.google.com/app/apikey
// Model: gemini-1.5-flash — free tier works globally including Nigeria
//   · 15 req/min  · 1,500 req/day  · 1M tokens/day
// ─────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// ── Constants ─────────────────────────────────────────────────────────────────

// gemini-2.0-flash has limit:0 on the free tier in some regions (incl. Nigeria).
// gemini-1.5-flash is available for free globally.
const GEMINI_MODEL   = 'gemini-1.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`
const MAX_MESSAGES   = 40

// ── CORS ──────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  // Add your production domain before going live, e.g.:
  // 'https://bakevault.com',
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

function respond(body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const CHAT_SYSTEM = (name: string, description: string) => `
You are a helpful product assistant for BakeVault, a wholesale baking supplies store in Lagos, Nigeria.

Current product:
- Name: ${name || 'unknown'}
- Description: ${description || 'No description provided.'}

WHAT YOU CAN DO:
Answer questions about what this product is, how it is used in baking, alternatives, and storage tips.
Use Google Search if you need up-to-date technical specs or certifications.

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

// ── Gemini types ──────────────────────────────────────────────────────────────

interface GeminiPart {
  text?: string
  inline_data?: { mime_type: string; data: string }
}

interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
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
    body.tools = [{ google_search: {} }]
  }
  return fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
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

// ── Image → base64 (for analyze mode) ────────────────────────────────────────

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { headers: { 'User-Agent': 'BakeVault-AI/1.0' } })
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${res.statusText}`)

  const mimeType = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim()
  const buffer   = await res.arrayBuffer()
  const bytes    = new Uint8Array(buffer)

  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return { data: btoa(binary), mimeType }
}

// ── Handler ───────────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
serve(async (req: any) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
  if (!GEMINI_API_KEY) {
    return respond({
      error: 'GEMINI_API_KEY is not configured. Run: supabase secrets set GEMINI_API_KEY=your-key',
    }, origin)
  }

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { return respond({ error: 'Invalid JSON body.' }, origin) }

  const mode       = (body.mode as string) ?? 'chat'
  const messages   = body.messages as { role: string; content: string }[] | undefined
  const productCtx = body.productContext as { name?: string; description?: string } | undefined
  const imageUrl   = body.imageUrl as string | undefined

  // ── Mode: analyze ──────────────────────────────────────────────────────────
  if (mode === 'analyze') {
    if (!imageUrl) return respond({ error: 'imageUrl is required for analyze mode.' }, origin)

    try {
      const parsed = new URL(imageUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return respond({ error: 'imageUrl must use http or https.' }, origin)
      }
    } catch {
      return respond({ error: 'imageUrl is not a valid URL.' }, origin)
    }

    try {
      const { data, mimeType } = await fetchImageAsBase64(imageUrl)
      const contents: GeminiContent[] = [{
        role:  'user',
        parts: [
          { inline_data: { mime_type: mimeType, data } },
          { text: 'Analyze this baking product image and return the JSON.' },
        ],
      }]

      const res  = await callGemini(GEMINI_API_KEY, ANALYZE_SYSTEM, contents, false)
      const data2 = await res.json() as Record<string, unknown>
      if (!res.ok) {
        type ErrBody = { error?: { message?: string } }
        return respond({ error: (data2 as ErrBody)?.error?.message ?? `Gemini ${res.status}` }, origin)
      }

      const raw   = extractText(data2)
      const clean = raw.replace(/```json|```/g, '').trim()

      let parsed2: { name?: string; description?: string } = {}
      try   { parsed2 = JSON.parse(clean) }
      catch { return respond({ error: 'AI returned unparseable JSON. Try again.' }, origin) }

      return respond({ name: parsed2.name ?? '', description: parsed2.description ?? '' }, origin)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analyze failed'
      console.error('[ai-assistant analyze]', msg)
      return respond({ error: msg }, origin)
    }
  }

  // ── Mode: chat ─────────────────────────────────────────────────────────────
  if (!messages || !Array.isArray(messages)) {
    return respond({ error: 'messages array is required for chat mode.' }, origin)
  }
  if (messages.length > MAX_MESSAGES) {
    return respond({ error: 'Conversation too long. Please start a new chat.' }, origin)
  }

  const contents: GeminiContent[] = messages.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const name        = productCtx?.name        ?? ''
  const description = productCtx?.description ?? ''

  try {
    const res  = await callGemini(GEMINI_API_KEY, CHAT_SYSTEM(name, description), contents, true)
    const data = await res.json() as Record<string, unknown>
    if (!res.ok) {
      type ErrBody = { error?: { message?: string } }
      return respond({ error: (data as ErrBody)?.error?.message ?? `Gemini ${res.status}` }, origin)
    }

    const text = extractText(data)
    return respond({ text: text || 'Sorry, I could not generate a response. Please try again.' }, origin)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Chat failed'
    console.error('[ai-assistant chat]', msg)
    return respond({ error: msg }, origin)
  }
})