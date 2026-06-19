import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bakevault-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function requireAdmin(req: Request, supabaseUrl: string, anonKey: string, serviceRoleKey: string): Promise<string> {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token) throw new Error('Authentication required.')

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': anonKey,
    },
  })

  if (!userRes.ok) throw new Error('Invalid or expired session.')

  const user = await userRes.json() as { id?: string }
  if (!user.id) throw new Error('Invalid session.')

  const adminRes = await fetch(
    `${supabaseUrl}/rest/v1/admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    },
  )

  if (!adminRes.ok) throw new Error('Admin verification failed.')

  const admins = await adminRes.json() as { user_id: string }[]
  if (admins.length === 0) throw new Error('Admin access required.')

  return user.id
}

function extractPath(url: string): string {
  const marker = '/storage/v1/object/public/bakevault-images/'
  const idx = url.indexOf(marker)
  return idx === -1 ? url : url.slice(idx + marker.length)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Supabase credentials are not configured.' }, 503)
  }

  let body: { dryRun?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }
  const dryRun = body.dryRun !== false  // default true — caller must explicitly opt into deletion

  try {
    await requireAdmin(req, supabaseUrl, anonKey, serviceRoleKey)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // 1. List all blobs under products/
    const { data: files, error: listError } = await supabase.storage
      .from('bakevault-images')
      .list('products', { limit: 10000 })
    if (listError) throw new Error(listError.message)

    // 2. Collect every referenced URL from products table
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('image_url, image_urls')
    if (prodError) throw new Error(prodError.message)

    const referenced = new Set<string>()
    for (const p of products ?? []) {
      if (p.image_url) referenced.add(extractPath(p.image_url))
      for (const url of p.image_urls ?? []) referenced.add(extractPath(url))
    }

    const orphaned = (files ?? [])
      .map(f => `products/${f.name}`)
      .filter(path => !referenced.has(path))

    if (dryRun) {
      return json({ dryRun: true, orphanedCount: orphaned.length, orphaned })
    }

    const { error: deleteError } = await supabase.storage
      .from('bakevault-images')
      .remove(orphaned)
    if (deleteError) throw new Error(deleteError.message)

    return json({ dryRun: false, deletedCount: orphaned.length, deleted: orphaned })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cleanup failed.'
    const status = message.includes('Admin access') ? 403
      : message.includes('required') || message.includes('session') ? 401
      : 500
    return json({ error: message }, status)
  }
})
