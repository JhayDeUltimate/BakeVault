import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

type NotificationType = 'product_request' | 'review'

interface NotifyBody {
  type?: NotificationType
  id?: string
}

const RESEND_API_URL = 'https://api.resend.com/emails'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function asPlain(value: unknown): string {
  return String(value ?? '').trim() || 'Not provided'
}

function stars(rating: unknown): string {
  const safe = Math.max(1, Math.min(5, Number(rating) || 5))
  return `${safe}/5`
}

async function sendEmail(options: { subject: string; html: string; text: string }) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const adminEmail = Deno.env.get('ADMIN_EMAIL')
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'BakeVault <onboarding@resend.dev>'

  if (!resendKey) throw new Error('RESEND_API_KEY is not configured.')
  if (!adminEmail) throw new Error('ADMIN_EMAIL is not configured.')

  const to = adminEmail.split(',').map(email => email.trim()).filter(Boolean)
  if (to.length === 0) throw new Error('ADMIN_EMAIL is empty.')

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Resend failed: ${res.status} ${errorText}`)
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  let body: NotifyBody = {}
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  if (body.type !== 'product_request' && body.type !== 'review') {
    return json({ error: 'type must be product_request or review.' }, 400)
  }
  if (!body.id || typeof body.id !== 'string') {
    return json({ error: 'id is required.' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase service credentials are not configured.' }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    if (body.type === 'product_request') {
      const { data, error } = await supabase
        .from('product_requests')
        .select('id, product_name, product_size, quantity, notes, contact_info, status, created_at, admin_notified_at')
        .eq('id', body.id)
        .single()

      if (error || !data) return json({ error: 'Product request not found.' }, 404)
      if (data.admin_notified_at) return json({ skipped: true, reason: 'Already notified.' })

      const subject = `New product request: ${asPlain(data.product_name)}`
      const html = `
        <h2>New product request</h2>
        <p><strong>Product:</strong> ${escapeHtml(data.product_name)}</p>
        <p><strong>Size:</strong> ${escapeHtml(data.product_size)}</p>
        <p><strong>Quantity:</strong> ${escapeHtml(data.quantity)}</p>
        <p><strong>Contact:</strong> ${escapeHtml(data.contact_info)}</p>
        <p><strong>Notes:</strong> ${escapeHtml(data.notes)}</p>
        <p><strong>Submitted:</strong> ${escapeHtml(data.created_at)}</p>
      `
      const text = [
        'New product request',
        `Product: ${asPlain(data.product_name)}`,
        `Size: ${asPlain(data.product_size)}`,
        `Quantity: ${asPlain(data.quantity)}`,
        `Contact: ${asPlain(data.contact_info)}`,
        `Notes: ${asPlain(data.notes)}`,
        `Submitted: ${asPlain(data.created_at)}`,
      ].join('\n')

      await sendEmail({ subject, html, text })
      await supabase.from('product_requests').update({ admin_notified_at: new Date().toISOString() }).eq('id', body.id)

      return json({ ok: true })
    }

    const { data, error } = await supabase
      .from('testimonials')
      .select('id, customer_name, business_name, quote, rating, created_at, admin_notified_at')
      .eq('id', body.id)
      .single()

    if (error || !data) return json({ error: 'Review not found.' }, 404)
    if (data.admin_notified_at) return json({ skipped: true, reason: 'Already notified.' })

    const subject = `New customer review: ${stars(data.rating)} from ${asPlain(data.customer_name)}`
    const html = `
      <h2>New customer review</h2>
      <p><strong>Rating:</strong> ${escapeHtml(stars(data.rating))}</p>
      <p><strong>Customer:</strong> ${escapeHtml(data.customer_name)}</p>
      <p><strong>Business:</strong> ${escapeHtml(data.business_name)}</p>
      <p><strong>Review:</strong> ${escapeHtml(data.quote)}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(data.created_at)}</p>
    `
    const text = [
      'New customer review',
      `Rating: ${stars(data.rating)}`,
      `Customer: ${asPlain(data.customer_name)}`,
      `Business: ${asPlain(data.business_name)}`,
      `Review: ${asPlain(data.quote)}`,
      `Submitted: ${asPlain(data.created_at)}`,
    ].join('\n')

    await sendEmail({ subject, html, text })
    await supabase.from('testimonials').update({ admin_notified_at: new Date().toISOString() }).eq('id', body.id)

    return json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Notification failed.'
    console.error('[notify-admin]', message)
    return json({ error: message }, 500)
  }
})
