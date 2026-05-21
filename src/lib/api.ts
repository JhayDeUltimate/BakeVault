import { supabase } from './supabase'
import { logger } from './logger'
import { SESSION_ID } from './analytics'
import { logAdminActivity } from './admin-activity'
import type { Database, Json, DBProductWithCategory, DBCategory, DBEnquiry, DBTestimonial, DBProductRequest, DBAnalyticsEvent, DBAdminActivity } from './database.types'

// Re-export from image.ts so existing imports from @/lib/api still work
export { getProductImages } from './image'

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

type AdminNotificationType = 'product_request' | 'review'

async function notifyAdminOfSubmission(type: AdminNotificationType, id: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('notify-admin', {
      body: { type, id },
    })
    if (error) {
      logger.warn('Admin notification failed', {
        event: 'admin_notification.failed',
        notification_type: type,
        resource_id: id,
        reason: error.message,
      })
    }
  } catch (err) {
    logger.warn('Admin notification failed', {
      event: 'admin_notification.failed',
      notification_type: type,
      resource_id: id,
      reason: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('')
  return initials || name.trim().slice(0, 2).toUpperCase()
}

function clampRating(rating: number): number {
  return Math.max(1, Math.min(5, Math.round(rating)))
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(filters?: {
  categoryId?: string | null; search?: string; featuredOnly?: boolean; includeUnavailable?: boolean; limit?: number
}): Promise<DBProductWithCategory[]> {
  let query = supabase.from('products').select('*, categories(*)').order('display_order', { ascending: true })
  if (!filters?.includeUnavailable) query = query.eq('is_available', true)
  if (filters?.featuredOnly)        query = query.eq('is_featured', true)
  if (filters?.categoryId)          query = query.eq('category_id', filters.categoryId)
  if (filters?.search?.trim())      query = query.ilike('name', `%${filters.search.trim()}%`)
  if (filters?.limit)               query = query.limit(filters.limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as DBProductWithCategory[]
}

export async function getProductById(id: string): Promise<DBProductWithCategory> {
  const { data, error } = await supabase.from('products').select('*, categories(*)').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data as DBProductWithCategory
}

export async function createProduct(product: {
  name: string; description?: string | null; category_id?: string | null
  image_url?: string | null; image_urls?: string[] | null
  is_available?: boolean; is_featured?: boolean; price_type?: string; display_order?: number
}): Promise<DBProductWithCategory> {
  const slug = toSlug(product.name)
  const payload = { ...product, slug, image_urls: (product.image_urls ?? []) as Json }
  const { data, error } = await supabase.from('products').insert(payload).select('*, categories(*)').single()
  if (error) {
    if (error.code === '23505') throw new Error('A product with this name already exists.')
    throw new Error(error.message)
  }
  void (async () => {
    try {
      const created = data as DBProductWithCategory
      await logAdminActivity({ action: 'product.create', resource_type: 'product', resource_id: created.id, details: { name: product.name, slug } })
    } catch {}
  })()
  return data as DBProductWithCategory
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string; description: string | null; category_id: string | null
    image_url: string | null; image_urls: string[] | null
    is_available: boolean; is_featured: boolean; price_type: string; display_order: number
  }>
): Promise<DBProductWithCategory> {
  const payload: Database['public']['Tables']['products']['Update'] = {
    ...updates,
    updated_at: new Date().toISOString(),
  }
  if (updates.name) payload.slug = toSlug(updates.name)
  if (updates.image_urls !== undefined) payload.image_urls = (updates.image_urls ?? []) as Json
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*, categories(*)').single()
  if (error) throw new Error(error.message)
  void (async () => {
    try {
      const updated = data as DBProductWithCategory
      await logAdminActivity({ action: 'product.update', resource_type: 'product', resource_id: updated.id, details: { updates } })
    } catch {}
  })()
  return data as DBProductWithCategory
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'product.delete', resource_type: 'product', resource_id: id }) } catch {} })()
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(): Promise<DBCategory[]> {
  const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCategory(name: string, displayOrder?: number): Promise<DBCategory> {
  const slug = toSlug(name)
  const { data, error } = await supabase.from('categories').insert({ name, slug, display_order: displayOrder ?? 0 }).select().single()
  if (error) {
    if (error.code === '23505') throw new Error('A category with this name already exists.')
    throw new Error(error.message)
  }
  void (async () => { try { await logAdminActivity({ action: 'category.create', resource_type: 'category', resource_id: (data as DBCategory).id, details: { name } }) } catch {} })()
  return data
}

export async function updateCategory(id: string, updates: { name?: string; display_order?: number }): Promise<DBCategory> {
  const payload: Database['public']['Tables']['categories']['Update'] = { ...updates }
  if (updates.name) payload.slug = toSlug(updates.name)
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'category.update', resource_type: 'category', resource_id: id, details: { updates } }) } catch {} })()
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') throw new Error('Cannot delete: this category has products. Move or delete those products first.')
    throw new Error(error.message)
  }
  void (async () => { try { await logAdminActivity({ action: 'category.delete', resource_type: 'category', resource_id: id }) } catch {} })()
}

// ─── Enquiries ────────────────────────────────────────────────────────────────
export interface EnquiryItem { product_id: string; product_name: string; category: string; quantity: number }

export async function logEnquiry(items: EnquiryItem[], whatsappMessage: string): Promise<void> {
  const start = Date.now()
  const { error } = await supabase.from('enquiries').insert({
    items: items as unknown as Json,
    whatsapp_message: whatsappMessage,
    status: 'sent',
  })
  if (error) {
    logger.error('Failed to log enquiry to DB', undefined, {
      event: 'enquiry.log_failed',
      reason: error.message,
      item_count: items.length,
    })
    // Fire-and-forget analytics event for enquiry failure
    void (async () => {
      try {
        const { error: ae } = await supabase.from('analytics_events').insert({
          event_type: 'enquiry.log_failed',
          event_data: { reason: error.message, item_count: items.length },
          session_id: typeof window !== 'undefined' ? SESSION_ID : null,
          page: typeof window !== 'undefined' ? window.location.pathname : null,
        })
        if (ae) console.debug('[analytics] enquiry.log_failed insert failed:', ae.message)
      } catch {}
    })()
  } else {
    logger.info('Enquiry logged', {
      event:      'enquiry.created',
      item_count: items.length,
      duration_ms: Date.now() - start,
    })
    // Fire-and-forget analytics event for enquiry success
    void (async () => {
      try {
        const { error: ae } = await supabase.from('analytics_events').insert({
          event_type: 'enquiry.created',
          event_data: { item_count: items.length },
          session_id: typeof window !== 'undefined' ? SESSION_ID : null,
          page: typeof window !== 'undefined' ? window.location.pathname : null,
        })
        if (ae) console.debug('[analytics] enquiry.created insert failed:', ae.message)
      } catch {}
    })()
  }
}

export async function getEnquiries(): Promise<DBEnquiry[]> {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// Paginated enquiries — returns items + total count
export async function getEnquiriesPage(options?: { page?: number; pageSize?: number; status?: 'sent' | 'responded' | 'fulfilled' }): Promise<{ items: DBEnquiry[]; total: number }> {
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 25
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('enquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (options?.status) query = query.eq('status', options.status)
  query = query.range(from, to)
  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { items: (data ?? []) as DBEnquiry[], total: count ?? 0 }
}

export async function getEnquiriesCount(filters?: { status?: 'sent' | 'responded' | 'fulfilled'; since?: string }): Promise<number> {
  let query = supabase.from('enquiries').select('id', { count: 'exact', head: true })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.since)  query = query.gte('created_at', filters.since)
  const { error, count } = await query
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function updateEnquiryStatus(id: string, status: 'sent' | 'responded' | 'fulfilled'): Promise<void> {
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'enquiry.update_status', resource_type: 'enquiry', resource_id: id, details: { status } }) } catch {} })()
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
export async function getTestimonials(visibleOnly = true): Promise<DBTestimonial[]> {
  let query = supabase.from('testimonials').select('*').order('display_order').order('created_at', { ascending: false })
  if (visibleOnly) query = query.eq('is_visible', true)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTestimonial(t: { customer_name: string; business_name?: string; initials?: string; quote: string; rating?: number; is_visible?: boolean; display_order?: number }): Promise<DBTestimonial> {
  const { data, error } = await supabase.from('testimonials').insert(t).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'testimonial.create', resource_type: 'testimonial', resource_id: (data as DBTestimonial).id, details: { customer_name: t.customer_name } }) } catch {} })()
  return data
}

export async function submitCustomerReview(review: {
  customer_name: string
  business_name?: string
  quote: string
  rating: number
}): Promise<DBTestimonial> {
  const customerName = review.customer_name.trim()
  const quote = review.quote.trim()
  if (!customerName || !quote) throw new Error('Name and review are required.')

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      customer_name: customerName,
      business_name: review.business_name?.trim() || null,
      initials: initialsFromName(customerName),
      quote,
      rating: clampRating(review.rating),
      is_visible: true,
      display_order: 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  void notifyAdminOfSubmission('review', (data as DBTestimonial).id)
  return data
}

export async function updateTestimonial(id: string, updates: Partial<{ customer_name: string; business_name: string | null; initials: string | null; quote: string; rating: number; is_visible: boolean; display_order: number }>): Promise<DBTestimonial> {
  const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'testimonial.update', resource_type: 'testimonial', resource_id: id, details: { updates } }) } catch {} })()
  return data
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'testimonial.delete', resource_type: 'testimonial', resource_id: id }) } catch {} })()
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('*')
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map(s => [s.key, s.value]))
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'setting.upsert', resource_type: 'setting', resource_id: key, details: { value } }) } catch {} })()
}

// ─── Product Requests ─────────────────────────────────────────────────────────
export async function createProductRequest(req: {
  product_name: string; product_size?: string; quantity?: number
  notes?: string; contact_info?: string
}): Promise<DBProductRequest> {
  const { data, error } = await supabase.from('product_requests').insert(req).select().single()
  if (error) throw new Error(error.message)
  void notifyAdminOfSubmission('product_request', (data as DBProductRequest).id)
  return data
}

export async function getProductRequests(): Promise<DBProductRequest[]> {
  const { data, error } = await supabase.from('product_requests').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateProductRequestStatus(id: string, status: 'pending' | 'reviewed' | 'fulfilled'): Promise<void> {
  const { error } = await supabase.from('product_requests').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'product_request.update_status', resource_type: 'product_request', resource_id: id, details: { status } }) } catch {} })()
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE     = 5 * 1024 * 1024


export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    logger.warn('Image upload rejected — unsupported type', {
      event: 'image.upload_rejected',
      mime_type: file.type,
    })
    throw new Error(`Unsupported type "${file.type}". Use JPEG, PNG, or WebP.`)
  }
  if (file.size > MAX_SIZE) {
    logger.warn('Image upload rejected — too large', {
      event: 'image.upload_rejected',
      size_mb: (file.size / 1024 / 1024).toFixed(1),
    })
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`)
  }

  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  }
  const ext  = MIME_TO_EXT[file.type] ?? 'jpg'
  const path = `products/${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16) })}.${ext}`
  const start = Date.now()

  const { error } = await supabase.storage
    .from('bakevault-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) {
    logger.error('Image upload to Supabase Storage failed', undefined, {
      event:    'image.upload_failed',
      path,
      reason:   error.message,
      duration_ms: Date.now() - start,
    })
    void (async () => { try { await logAdminActivity({ action: 'image.upload_failed', resource_type: 'image', resource_id: path, details: { reason: error.message, duration_ms: Date.now() - start } }) } catch {} })()
    throw new Error(error.message)
  }

  logger.info('Image uploaded', {
    event:    'image.upload_success',
    path,
    size_mb:  (file.size / 1024 / 1024).toFixed(2),
    duration_ms: Date.now() - start,
  })

  // Record admin activity for image upload (best-effort)
  void (async () => { try { await logAdminActivity({ action: 'image.upload_success', resource_type: 'image', resource_id: path, details: { size_mb: (file.size / 1024 / 1024).toFixed(2), duration_ms: Date.now() - start } }) } catch {} })()

  const { data } = supabase.storage.from('bakevault-images').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return
  const marker = '/bakevault-images/'
  const idx = imageUrl.indexOf(marker)
  if (idx === -1) return
  const path = imageUrl.slice(idx + marker.length).split('?')[0] // strip query params
  if (!path.startsWith('products/')) return
  const { error } = await supabase.storage.from('bakevault-images').remove([path])
  if (error) {
    console.error('[BakeVault] Failed to delete image:', error.message)
  } else {
    void (async () => { try { await logAdminActivity({ action: 'image.delete', resource_type: 'image', resource_id: path }) } catch {} })()
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsChartPoint {
  date:          string
  page_views:    number
  product_views: number
  add_to_cart:   number
  checkouts:     number
}

export interface TopProduct {
  product_name: string
  product_id:   string
  count:        number
}

const STOREFRONT_ANALYTICS_EVENT_TYPES = [
  'page_view',
  'product_view',
  'add_to_cart',
  'remove_from_cart',
  'cart_checkout',
  'cart_cleared',
  'product_request_submitted',
  'review_submitted',
  'search',
  'whatsapp_click',
  'enquiry.created',
  'enquiry.log_failed',
] as const

const STOREFRONT_ANALYTICS_EVENTS = new Set<string>(STOREFRONT_ANALYTICS_EVENT_TYPES)

function isStorefrontAnalyticsEvent<T extends { event_type: string | null; page?: string | null }>(
  event: T
): event is T & { event_type: string } {
  return !!event.event_type && STOREFRONT_ANALYTICS_EVENTS.has(event.event_type) && !(event.page ?? '').startsWith('/admin')
}

export async function getAnalyticsSummary(days = 30): Promise<{
  chart:       AnalyticsChartPoint[]
  topProducts: TopProduct[]
  totals:      Record<string, number>
}> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type, event_data, created_at, page')
    .gte('created_at', since)
    .in('event_type', STOREFRONT_ANALYTICS_EVENT_TYPES)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  const events = (data ?? []).filter(isStorefrontAnalyticsEvent)

  const buckets = new Map<string, AnalyticsChartPoint>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    buckets.set(key, { date: label, page_views: 0, product_views: 0, add_to_cart: 0, checkouts: 0 })
  }

  const totals: Record<string, number> = {}
  const productCounts = new Map<string, { name: string; count: number }>()

  for (const e of events) {
    const key    = e.created_at.slice(0, 10)
    const bucket = buckets.get(key)
    totals[e.event_type] = (totals[e.event_type] ?? 0) + 1

    if (bucket) {
      if (e.event_type === 'page_view')     bucket.page_views    += 1
      if (e.event_type === 'product_view')  bucket.product_views += 1
      if (e.event_type === 'add_to_cart')   bucket.add_to_cart   += 1
      if (e.event_type === 'cart_checkout') bucket.checkouts     += 1
    }

    if (e.event_type === 'add_to_cart') {
      const d = e.event_data as { product_id?: string; product_name?: string }
      if (d?.product_id) {
        const existing = productCounts.get(d.product_id)
        productCounts.set(d.product_id, { name: d.product_name ?? 'Unknown', count: (existing?.count ?? 0) + 1 })
      }
    }
  }

  const topProducts: TopProduct[] = [...productCounts.entries()]
    .map(([id, { name, count }]) => ({ product_id: id, product_name: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return { chart: [...buckets.values()], topProducts, totals }
}

export async function getAnalyticsRawEvents(days = 30): Promise<DBAnalyticsEvent[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', since)
    .in('event_type', STOREFRONT_ANALYTICS_EVENT_TYPES)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as DBAnalyticsEvent[]).filter(isStorefrontAnalyticsEvent)
}

// ─── Admin activity logs ────────────────────────────────────────────────────
export async function getAdminActivityLogs(opts?: { limit?: number }): Promise<DBAdminActivity[]> {
  const limit = opts?.limit ?? 50
  const { data, error } = await supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as DBAdminActivity[]
}

// Paginated products — returns items + total count
export async function getProductsPage(options?: {
  page?: number
  pageSize?: number
  categoryId?: string | null
  search?: string
  featuredOnly?: boolean
  includeUnavailable?: boolean
  sortKey?: 'name' | 'category' | 'updated_at' | 'created_at' | 'is_available' | 'is_featured'
  sortDir?: 'asc' | 'desc'
}): Promise<{ items: DBProductWithCategory[]; total: number }> {
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('products').select('*, categories(*)', { count: 'exact' }).order('display_order', { ascending: true })
  if (!options?.includeUnavailable) query = query.eq('is_available', true)
  if (options?.featuredOnly)        query = query.eq('is_featured', true)
  if (options?.categoryId)          query = query.eq('category_id', options.categoryId)
  if (options?.search?.trim())      query = query.ilike('name', `%${options.search.trim()}%`)

  // Server-side sorting for simple keys (category sorting handled client-side)
  if (options?.sortKey && options.sortKey !== 'category') {
    const orderField = options.sortKey
    const ascending = options.sortDir !== 'desc'
    query = query.order(orderField as any, { ascending })
  }

  query = query.range(from, to)
  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { items: (data ?? []) as DBProductWithCategory[], total: count ?? 0 }
}

export async function getProductsCount(filters?: {
  categoryId?: string | null; search?: string; featuredOnly?: boolean; includeUnavailable?: boolean
}): Promise<number> {
  let query = supabase.from('products').select('id', { count: 'exact', head: true })
  if (!filters?.includeUnavailable) query = query.eq('is_available', true)
  if (filters?.featuredOnly)        query = query.eq('is_featured', true)
  if (filters?.categoryId)          query = query.eq('category_id', filters.categoryId)
  if (filters?.search?.trim())      query = query.ilike('name', `%${filters.search.trim()}%`)
  const { error, count } = await query
  if (error) throw new Error(error.message)
  return count ?? 0
}
