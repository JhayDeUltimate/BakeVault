import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.1"

type CheckResult = {
  ok: boolean
  duration_ms: number
  error?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
}

function json(body: unknown, status = 200, head = false): Response {
  return new Response(head ? null : JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

const CHECK_TIMEOUT_MS = 10_000

async function timedCheck(
  label: string,
  fn: () => Promise<void>,
): Promise<CheckResult> {
  const started = Date.now()
  try {
    await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), CHECK_TIMEOUT_MS),
      ),
    ])
    return { ok: true, duration_ms: Date.now() - started }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[health-check] ${label} failed:`, detail)
    return {
      ok: false,
      duration_ms: Date.now() - started,
      error: `${label}_check_failed`,
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json({ ok: false, error: 'method_not_allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[health-check] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return json({
      ok: false,
      service: 'bakevault-api',
      checked_at: new Date().toISOString(),
      dependencies: {
        database: { ok: false, duration_ms: 0, error: 'configuration_error' },
        storage: { ok: false, duration_ms: 0, error: 'configuration_error' },
      },
    }, 503, req.method === 'HEAD')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [database, storage] = await Promise.all([
    timedCheck('database', async () => {
      const { error } = await supabase.from('settings').select('key').limit(1)
      if (error) throw new Error(error.message)
    }),
    timedCheck('storage', async () => {
      const { error } = await supabase.storage.getBucket('bakevault-images')
      if (error) throw new Error(error.message)
    }),
  ])

  const ok = database.ok && storage.ok

  return json({
    ok,
    service: 'bakevault-api',
    checked_at: new Date().toISOString(),
    dependencies: { database, storage },
  }, ok ? 200 : 503, req.method === 'HEAD')
})
