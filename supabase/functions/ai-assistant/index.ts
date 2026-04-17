// Supabase Edge Function — AI Product Assistant
// Deploy: supabase functions deploy ai-assistant
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = (name: string, description: string) => `
You are a product information assistant. You have general knowledge about baking ingredients and supplies.

Current product context:
- Name: ${name}
- Description: ${description || 'No description provided'}

YOUR ROLE:
• Answer questions about what this product is, how it's used in baking, ingredients/specs, alternatives, and baking techniques
• Use web search when you need current or specific product information
• You CAN share publicly available contact info for BakeVault if asked (e.g. from web)

YOUR LIMITS (be honest about these):
• You do NOT know BakeVault's current stock levels, pricing, or delivery times
• For ordering or pricing: tell users to contact BakeVault directly via WhatsApp
• Keep answers concise and practical for bakers

Respond in plain conversational text. No markdown.
`.trim()

async function callClaude(apiKey: string, systemPrompt: string, messages: unknown[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    }),
  })
  return res.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { messages, productContext } = await req.json()
    const { name = '', description = '' } = productContext ?? {}
    const systemPrompt = SYSTEM_PROMPT(name, description)

    // Multi-turn loop to handle web_search tool use (Anthropic executes the search)
    let currentMessages = [...messages]
    let finalText = ''

    for (let i = 0; i < 5; i++) {
      const response = await callClaude(ANTHROPIC_API_KEY, systemPrompt, currentMessages)

      if (response.error) throw new Error(response.error.message ?? 'Claude API error')

      const toolUseBlocks = (response.content ?? []).filter((b: { type: string }) => b.type === 'tool_use')

      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        finalText = (response.content ?? [])
          .filter((b: { type: string }) => b.type === 'text')
          .map((b: { text: string }) => b.text)
          .join('\n')
        break
      }

      // Assistant used a tool — add turn and provide empty tool results
      // (Anthropic executes web_search server-side; we just continue the loop)
      currentMessages.push({ role: 'assistant', content: response.content })
      currentMessages.push({
        role: 'user',
        content: toolUseBlocks.map((b: { id: string }) => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: '',
        })),
      })
    }

    return new Response(JSON.stringify({ text: finalText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
