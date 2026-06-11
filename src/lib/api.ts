import { supabase } from './supabase'
import { logger } from './logger'
import { SESSION_ID } from './session-id'
import { logAdminActivity } from './admin-activity'
import { mapDBFAQs, type FAQCategoryData } from './faq'
import type { Database, Json, DBProductWithCategory, DBCategory, DBEnquiry, DBTestimonial, DBProductRequest, DBAnalyticsEvent, DBAdminActivity, DBFAQCategory, DBFAQItem, DBFAQCategoryWithItems } from './database.types'

// Re-export from image.ts so existing imports from @/lib/api still work
export { getProductImages } from './image'

export function toSlug(name: string): string {
  const ascii = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/gi, 'ss')
    .replace(/æ/gi, 'ae')
    .replace(/œ/gi, 'oe')
    .replace(/ø/gi, 'o')
    .replace(/ð/gi, 'd')
    .replace(/þ/gi, 'th')

  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'item'
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

function randomUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
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

export async function getNextProductDisplayOrder(): Promise<number> {
  const { data, error } = await supabase
    .from('products')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return typeof data?.display_order === 'number' ? data.display_order + 1 : 0
}

export async function createProduct(product: {
  name: string; description?: string | null; category_id?: string | null
  image_url?: string | null; image_urls?: string[] | null
  is_available?: boolean; is_featured?: boolean; price_type?: string; display_order?: number
}): Promise<DBProductWithCategory> {
  const slug = toSlug(product.name)
  const displayOrder = product.display_order ?? await getNextProductDisplayOrder()
  const payload = { ...product, slug, image_urls: product.image_urls ?? [], display_order: displayOrder }
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
  // Slug is intentionally NOT regenerated here.
  // Slugs are frozen at creation to preserve URL stability.
  // Renaming a product updates its display name only, not its URL.
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

export async function createCategory(
  name: string,
  displayOrder?: number,
  seo?: { seo_title?: string | null; seo_description?: string | null }
): Promise<DBCategory> {
  const slug = toSlug(name)
  const { data, error } = await supabase.from('categories').insert({
    name,
    slug,
    display_order: displayOrder ?? 0,
    seo_title: seo?.seo_title ?? null,
    seo_description: seo?.seo_description ?? null,
  }).select().single()
  if (error) {
    if (error.code === '23505') throw new Error('A category with this name already exists.')
    throw new Error(error.message)
  }
  void (async () => { try { await logAdminActivity({ action: 'category.create', resource_type: 'category', resource_id: (data as DBCategory).id, details: { name } }) } catch {} })()
  return data
}

export async function updateCategory(
  id: string,
  updates: { name?: string; display_order?: number; seo_title?: string | null; seo_description?: string | null }
): Promise<DBCategory> {
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
  const idempotencyKey = randomUuid()

  // Retry once on failure before giving up — this is a business-critical record
  async function attemptInsert(): Promise<boolean> {
    try {
      const { error } = await supabase.from('enquiries').insert({
        items: items as unknown as Json,
        whatsapp_message: whatsappMessage,
        idempotency_key: idempotencyKey,
        status: 'sent',
      })
      if (!error) return true
      if (error.code === '23505') return true
      return false
    } catch {
      return false
    }
  }

  let success = await attemptInsert()
  if (!success) {
    // Wait 1 second and retry once
    await new Promise(resolve => setTimeout(resolve, 1000))
    success = await attemptInsert()
  }

  if (success) {
    logger.info('Enquiry logged', {
      event:       'enquiry.created',
      item_count:  items.length,
      duration_ms: Date.now() - start,
    })
    return
  }

  logger.error('Failed to log enquiry after retry — order is invisible to admin', undefined, {
    event:      'enquiry.log_failed',
    item_count: items.length,
  })
  // Surface failure in a visible way for the admin (PostHog / Sentry will capture it)
  // Also attempt to write a failure event so it's visible in admin analytics
  void (async () => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'enquiry.log_failed',
        event_data: { item_count: items.length },
        session_id: typeof window !== 'undefined' ? SESSION_ID : null,
        page: typeof window !== 'undefined' ? window.location.pathname : null,
      })
    } catch {}
  })()
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
}): Promise<{ id: string; rating: number }> {
  const customerName = review.customer_name.trim()
  const quote = review.quote.trim()
  if (!customerName || !quote) throw new Error('Name and review are required.')
  const id = randomUuid()
  const rating = clampRating(review.rating)

  const { error } = await supabase
    .from('testimonials')
    .insert({
      id,
      customer_name: customerName,
      business_name: review.business_name?.trim() || null,
      initials: initialsFromName(customerName),
      quote,
      rating,
      is_visible: false,
      display_order: 0,
    })

  if (error) throw new Error(error.message)

  void notifyAdminOfSubmission('review', id)
  return { id, rating }
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

async function fetchFAQRows(visibleOnly: boolean): Promise<DBFAQCategoryWithItems[]> {
  let query = supabase
    .from('faq_categories')
    .select('*, faq_items(*)')
    .order('display_order', { ascending: true })

  if (visibleOnly) query = query.eq('is_visible', true)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as DBFAQCategoryWithItems[]
  if (!visibleOnly) return rows

  return rows.map(category => ({
    ...category,
    faq_items: (category.faq_items ?? []).filter(item => item.is_visible),
  }))
}

export async function getFAQs(): Promise<FAQCategoryData[]> {
  return mapDBFAQs(await fetchFAQRows(true)).filter(category => category.items.length > 0)
}

export async function getAdminFAQs(): Promise<FAQCategoryData[]> {
  return mapDBFAQs(await fetchFAQRows(false))
}

export async function createFAQCategory(input: {
  title: string
  icon?: string
  display_order?: number
  is_visible?: boolean
}): Promise<DBFAQCategory> {
  const payload: Database['public']['Tables']['faq_categories']['Insert'] = {
    title: input.title.trim(),
    icon: input.icon?.trim() || 'M8 10h.01M12 10h.01M16 10h.01M9 16h6',
    display_order: input.display_order ?? 0,
    is_visible: input.is_visible ?? true,
  }
  const { data, error } = await supabase.from('faq_categories').insert(payload).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'faq_category.create', resource_type: 'faq_category', resource_id: (data as DBFAQCategory).id, details: payload }) } catch {} })()
  return data as DBFAQCategory
}

export async function updateFAQCategory(
  id: string,
  updates: Database['public']['Tables']['faq_categories']['Update']
): Promise<DBFAQCategory> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }
  if (typeof payload.title === 'string') payload.title = payload.title.trim()
  if (typeof payload.icon === 'string') payload.icon = payload.icon.trim()

  const { data, error } = await supabase.from('faq_categories').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'faq_category.update', resource_type: 'faq_category', resource_id: id, details: updates as Json }) } catch {} })()
  return data as DBFAQCategory
}

export async function deleteFAQCategory(id: string): Promise<void> {
  const { error } = await supabase.from('faq_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'faq_category.delete', resource_type: 'faq_category', resource_id: id }) } catch {} })()
}

export async function createFAQItem(input: {
  category_id: string
  question: string
  answer: string
  display_order?: number
  is_visible?: boolean
}): Promise<DBFAQItem> {
  const payload: Database['public']['Tables']['faq_items']['Insert'] = {
    category_id: input.category_id,
    question: input.question.trim(),
    answer: input.answer.trim(),
    display_order: input.display_order ?? 0,
    is_visible: input.is_visible ?? true,
  }
  const { data, error } = await supabase.from('faq_items').insert(payload).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'faq_item.create', resource_type: 'faq_item', resource_id: (data as DBFAQItem).id, details: payload }) } catch {} })()
  return data as DBFAQItem
}

export async function updateFAQItem(
  id: string,
  updates: Database['public']['Tables']['faq_items']['Update']
): Promise<DBFAQItem> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }
  if (typeof payload.question === 'string') payload.question = payload.question.trim()
  if (typeof payload.answer === 'string') payload.answer = payload.answer.trim()

  const { data, error } = await supabase.from('faq_items').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'faq_item.update', resource_type: 'faq_item', resource_id: id, details: updates as Json }) } catch {} })()
  return data as DBFAQItem
}

export async function deleteFAQItem(id: string): Promise<void> {
  const { error } = await supabase.from('faq_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  void (async () => { try { await logAdminActivity({ action: 'faq_item.delete', resource_type: 'faq_item', resource_id: id }) } catch {} })()
}

// ─── Product Requests ─────────────────────────────────────────────────────────
export async function createProductRequest(req: {
  product_name: string; product_size?: string; quantity?: number
  notes?: string; contact_info?: string
}): Promise<DBProductRequest> {
  // Client-side rate limit check (defense in depth)
  const throttleKey = `product_request_${SESSION_ID}`
  const lastRequest = sessionStorage.getItem(throttleKey)
  if (lastRequest) {
    const timeSince = Date.now() - parseInt(lastRequest, 10)
    if (timeSince < 30_000) {
      throw new Error('Please wait a moment before submitting another request.')
    }
  }
  sessionStorage.setItem(throttleKey, String(Date.now()))

  const timeout = new Promise<never>((_, reject) => {
    globalThis.setTimeout(() => reject(new Error('Product request timed out after 15 seconds.')), 15_000)
  })
  const insert = supabase.from('product_requests').insert(req).select().single()
  const { data, error } = await Promise.race([insert, timeout])
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

  const { error } = await supabase.functions.invoke('delete-product-image', {
    body: { imageUrl },
  })

  if (error) {
    console.error('[BakeVault] Failed to delete image from storage:', error.message)
    return
  }

  void (async () => {
    try {
      await logAdminActivity({
        action: 'image.delete',
        resource_type: 'image',
        resource_id: imageUrl,
      })
    } catch {}
  })()
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

  // Fetch aggregated daily summary from the Postgres view — never raw rows
  const [summaryRes, topRes, totalsRes] = await Promise.all([
    supabase
      .from('analytics_daily_summary')
      .select('day, page_views, product_views, add_to_cart, checkouts')
      .gte('day', since)
      .order('day', { ascending: true }),

    supabase
      .from('analytics_top_products')
      .select('product_id, product_name, add_count')
      .limit(5),

    supabase.rpc('get_analytics_totals', { since_ts: since }),
  ])

  if (summaryRes.error) throw new Error(summaryRes.error.message)
  if (topRes.error)     throw new Error(topRes.error.message)
  if (totalsRes.error)  throw new Error(totalsRes.error.message)

  // Build chart buckets for the requested date range
  const buckets = new Map<string, AnalyticsChartPoint>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key   = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    buckets.set(key, { date: label, page_views: 0, product_views: 0, add_to_cart: 0, checkouts: 0 })
  }

  for (const row of summaryRes.data ?? []) {
    const key = (row.day as string).slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.page_views    = Number(row.page_views    ?? 0)
      bucket.product_views = Number(row.product_views ?? 0)
      bucket.add_to_cart   = Number(row.add_to_cart   ?? 0)
      bucket.checkouts     = Number(row.checkouts     ?? 0)
    }
  }

  const topProducts: TopProduct[] = (topRes.data ?? []).map(r => ({
    product_id:   r.product_id   as string,
    product_name: r.product_name as string,
    count:        Number(r.add_count ?? 0),
  }))

  const totals = Object.fromEntries(
    (totalsRes.data ?? []).map(r => [r.event_type, Number(r.total)])
  )

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
export async function getAdminActivityLogsPage(opts?: { page?: number; pageSize?: number; sortDir?: 'asc' | 'desc' }): Promise<{ items: DBAdminActivity[]; total: number }> {
  const page = Math.max(1, opts?.page ?? 1)
  const pageSize = Math.max(1, opts?.pageSize ?? 50)
  const sortDir = opts?.sortDir ?? 'desc'
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('admin_activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sortDir === 'asc' })
    .range(from, to)

  if (error) throw new Error(error.message)
  return { items: (data ?? []) as DBAdminActivity[], total: count ?? 0 }
}

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

  let query = supabase
    .from('products')
    .select('*, categories(*)', { count: 'exact' })

  if (!options?.includeUnavailable) query = query.eq('is_available', true)
  if (options?.featuredOnly)        query = query.eq('is_featured', true)
  if (options?.categoryId)          query = query.eq('category_id', options.categoryId)
  if (options?.search?.trim())      query = query.ilike('name', `%${options.search.trim()}%`)

  // All sorting is server-side -- including category (via referencedTable)
  if (!options?.sortKey) {
    query = query.order('display_order', { ascending: true })
  } else {
    const ascending = options.sortDir !== 'desc'
    query = options.sortKey === 'category'
      ? query.order('name', { referencedTable: 'categories', ascending })
      : query.order(options.sortKey as string, { ascending })
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
