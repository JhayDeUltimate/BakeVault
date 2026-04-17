// Supabase Edge Function — AI Product Assistant
// ─────────────────────────────────────────────────────────────────────
// DEPLOY WITH:  supabase functions deploy ai-assistant --no-verify-jwt
// SECRET:       supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ─────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const CHAT_SYSTEM = (name: string, description: string) => `
You are a helpful product assistant for BakeVault, a wholesale baking supplies store in Lagos, Nigeria.

Current product:
- Name: ${name || 'unknown'}
- Description: ${description || 'No description provided.'}

WHAT YOU CAN DO:
Answer questions about what this product is, how it is used in baking, substitutes, and storage tips.
Search the web for technical specs or certifications if needed.

WHAT YOU CANNOT DO (be honest):
You do NOT know BakeVault's current prices, stock levels, or delivery details.
For pricing and ordering, tell users to contact BakeVault via WhatsApp.

Keep responses short and practical. Plain text only, no markdown, no bullet symbols.
`.trim()

const ANALYZE_SYSTEM = `
You are a product catalog assistant for BakeVault, a wholesale baking supplies store in Lagos, Nigeria.
Given a product image, return ONLY valid JSON with exactly two string keys, no preamble, no markdown:
{"name":"Full product name including brand, weight and variant if visible","description":"2-3 sentences about baking uses and key features"}
`.trim()

// ─── Anthropic fetch ──────────────────────────────────────────────────────────

async function anthropic(
  apiKey:       string,
  system:       string,
  messages:     unknown[],
  webSearch:    boolean,
) {
  const body: Record<string, unknown> = {
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system,
    messages,
  }
  const headers: Record<string, string> = {
    'Content-Type':      'application/json',
    'x-api-key':         apiKey,
    'anthropic-version': '2023-06-01',
  }
  if (webSearch) {
    headers['anthropic-beta'] = 'web-search-2025-03-05'
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }]
  }
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers, body: JSON.stringify(body),
  })
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_API_KEY) {
    // Return 200 + error field so supabase-js parses the body (not throws on 5xx)
    return ok({ error: 'ANTHROPIC_API_KEY secret is not set. Run: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...' })
  }

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { return ok({ error: 'Invalid JSON body.' }) }

  const mode          = (body.mode as string) ?? 'chat'
  const messages      = body.messages as unknown[] | undefined
  const productCtx    = body.productContext as { name?: string; description?: string } | undefined
  const imageUrl      = body.imageUrl as string | undefined

  // ── Mode: analyze ──────────────────────────────────────────────────────────
  if (mode === 'analyze') {
    if (!imageUrl) return ok({ error: 'imageUrl is required for analyze mode.' })

    try {
      const res  = await anthropic(ANTHROPIC_API_KEY, ANALYZE_SYSTEM, [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          { type: 'text',  text: 'Analyze this baking product image and return the JSON.' },
        ],
      }], false)

      const data = await res.json()
      if (!res.ok) return ok({ error: data?.error?.message ?? `Anthropic ${res.status}` })

      const raw   = (data.content ?? []).filter((b: {type:string}) => b.type === 'text').map((b: {text:string}) => b.text).join('')
      const clean = raw.replace(/```json|```/g, '').trim()

      let parsed: { name?: string; description?: string } = {}
      try   { parsed = JSON.parse(clean) }
      catch { return ok({ error: 'AI returned unparseable JSON. Try again.' }) }

      return ok({ name: parsed.name ?? '', description: parsed.description ?? '' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analyze failed'
      console.error('[ai-assistant analyze]', msg)
      return ok({ error: msg })
    }
  }

  // ── Mode: chat ─────────────────────────────────────────────────────────────
  if (!messages || !Array.isArray(messages)) return ok({ error: 'messages array is required.' })

  const name        = productCtx?.name        ?? ''
  const description = productCtx?.description ?? ''

  try {
    let current   = [...messages]
    let finalText = ''

    for (let i = 0; i < 5; i++) {
      const res  = await anthropic(ANTHROPIC_API_KEY, CHAT_SYSTEM(name, description), current, true)
      const data = await res.json()
      if (!res.ok) return ok({ error: data?.error?.message ?? `Anthropic ${res.status}` })

      const toolBlocks = (data.content ?? []).filter((b: {type:string}) => b.type === 'tool_use')

      if (toolBlocks.length === 0 || data.stop_reason === 'end_turn') {
        finalText = (data.content ?? [])
          .filter((b: {type:string}) => b.type === 'text')
          .map((b: {text:string}) => b.text)
          .join('\n')
          .trim()
        break
      }

      current.push({ role: 'assistant', content: data.content })
      current.push({
        role: 'user',
        content: toolBlocks.map((b: {id:string}) => ({
          type: 'tool_result', tool_use_id: b.id, content: '',
        })),
      })
    }

    return ok({ text: finalText || 'Sorry, no response generated. Try again.' })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Chat failed'
    console.error('[ai-assistant chat]', msg)
    return ok({ error: msg })
  }
})