import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

function encodeStoragePath(path: string): string {
  return path.split('/').map(part => encodeURIComponent(part)).join('/')
}

function extractProductImagePath(imageUrl: string, supabaseUrl: string): string {
  // Block encoded traversal sequences BEFORE any decoding
  const BLOCKED_PATTERNS = ['..', '%2e%2e', '%2E%2E', '%2f', '%2F', '\\', '%5c', '%5C']
  const rawPathname = new URL(imageUrl).pathname
  for (const pattern of BLOCKED_PATTERNS) {
    if (rawPathname.toLowerCase().includes(pattern.toLowerCase())) {
      throw new Error('Invalid image URL: path traversal sequences are not allowed.')
    }
  }

  const parsed = new URL(imageUrl)
  const projectUrl = new URL(supabaseUrl)
  const publicPrefix = '/storage/v1/object/public/bakevault-images/'

  if (parsed.protocol !== 'https:') {
    throw new Error('Only BakeVault Supabase Storage HTTPS URLs can be deleted.')
  }
  if (parsed.hostname !== projectUrl.hostname) {
    throw new Error('Image URL is not from this Supabase project.')
  }
  if (!parsed.pathname.startsWith(publicPrefix)) {
    throw new Error('Image URL is not from the bakevault-images bucket.')
  }

  const storagePath = decodeURIComponent(parsed.pathname.slice(publicPrefix.length))

  if (
    !storagePath.startsWith('products/') ||
    storagePath.startsWith('/') ||
    storagePath.endsWith('/') ||
    storagePath.includes('..') ||
    storagePath.includes('\\')
  ) {
    throw new Error('Only product image paths can be deleted.')
  }

  return storagePath
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Supabase credentials are not configured.' }, 503)
  }

  let body: { imageUrl?: string } = {}
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  if (!body.imageUrl || typeof body.imageUrl !== 'string') {
    return json({ error: 'imageUrl is required.' }, 400)
  }

  try {
    await requireAdmin(req, supabaseUrl, anonKey, serviceRoleKey)
    const storagePath = extractProductImagePath(body.imageUrl, supabaseUrl)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase.storage.from('bakevault-images').remove([storagePath])
    if (error) throw new Error(error.message)

    return json({ ok: true, path: encodeStoragePath(storagePath) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed.'
    const status =
      message.includes('required') || message.includes('session') ? 401 :
      message.includes('Admin access') ? 403 :
      message.includes('URL') || message.includes('paths') ? 400 :
      500

    console.error('[delete-product-image]', message)
    return json({ error: message }, status)
  }
})
