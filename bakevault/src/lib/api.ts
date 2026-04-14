import { supabase } from './supabase'
import type { Database, Json, DBProductWithCategory, DBCategory, DBEnquiry, DBTestimonial } from './database.types'

// ─── Slug helper ──────────────────────────────────────────────────────────────
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  categoryId?: string | null
  search?: string
  featuredOnly?: boolean
  includeUnavailable?: boolean   // only the admin needs this
}): Promise<DBProductWithCategory[]> {
  let query = supabase
    .from('products')
    .select('*, categories(*)')
    .order('display_order', { ascending: true })

  if (!filters?.includeUnavailable) {
    query = query.eq('is_available', true)
  }
  if (filters?.featuredOnly) {
    query = query.eq('is_featured', true)
  }
  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as DBProductWithCategory[]
}

export async function getProductById(id: string): Promise<DBProductWithCategory> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as DBProductWithCategory
}

export async function createProduct(product: {
  name: string
  description?: string | null
  category_id?: string | null
  image_url?: string | null
  is_available?: boolean
  is_featured?: boolean
  price_type?: string
  display_order?: number
}): Promise<DBProductWithCategory> {
  const slug = toSlug(product.name)
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, slug })
    .select('*, categories(*)')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('A product with this name already exists.')
    throw new Error(error.message)
  }
  return data as DBProductWithCategory
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string
    description: string | null
    category_id: string | null
    image_url: string | null
    is_available: boolean
    is_featured: boolean
    price_type: string
    display_order: number
  }>
): Promise<DBProductWithCategory> {
  const payload: Database['public']['Tables']['products']['Update'] = { ...updates }
  if (updates.name) payload.slug = toSlug(updates.name)

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*, categories(*)')
    .single()
  if (error) throw new Error(error.message)
  return data as DBProductWithCategory
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<DBCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCategory(name: string, displayOrder?: number): Promise<DBCategory> {
  const slug = toSlug(name)
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, display_order: displayOrder ?? 0 })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('A category with this name already exists.')
    throw new Error(error.message)
  }
  return data
}

export async function updateCategory(
  id: string,
  updates: { name?: string; display_order?: number }
): Promise<DBCategory> {
  const payload: Database['public']['Tables']['categories']['Update'] = { ...updates }
  if (updates.name) payload.slug = toSlug(updates.name)
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') throw new Error('Cannot delete: this category has products. Move or delete those products first.')
    throw new Error(error.message)
  }
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export interface EnquiryItem {
  product_id: string
  product_name: string
  category: string
  quantity: number
}

export async function logEnquiry(
  items: EnquiryItem[],
  whatsappMessage: string
): Promise<void> {
  // Fire-and-forget. A logging failure must never block opening WhatsApp.
  const payload: Database['public']['Tables']['enquiries']['Insert'] = {
    items: items as unknown as Json,
    whatsapp_message: whatsappMessage,
    status: 'sent',
  }

  const { error } = await supabase
    .from('enquiries')
    .insert(payload)

  if (error) console.error('[BakeVault] Failed to log enquiry:', error.message)
}

export async function getEnquiries(): Promise<DBEnquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateEnquiryStatus(
  id: string,
  status: 'sent' | 'responded' | 'fulfilled'
): Promise<void> {
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function getTestimonials(visibleOnly = true): Promise<DBTestimonial[]> {
  let query = supabase.from('testimonials').select('*').order('display_order')
  if (visibleOnly) query = query.eq('is_visible', true)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTestimonial(t: {
  customer_name: string
  business_name?: string
  initials?: string
  quote: string
  is_visible?: boolean
  display_order?: number
}): Promise<DBTestimonial> {
  const { data, error } = await supabase.from('testimonials').insert(t).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateTestimonial(
  id: string,
  updates: Partial<{
    customer_name: string; business_name: string | null; initials: string | null
    quote: string; is_visible: boolean; display_order: number
  }>
): Promise<DBTestimonial> {
  const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('*')
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map(s => [s.key, s.value]))
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('bakevault-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('bakevault-images').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const marker = '/bakevault-images/'
  const idx = imageUrl.indexOf(marker)
  if (idx === -1) return

  const path = imageUrl.slice(idx + marker.length)
  const { error } = await supabase.storage.from('bakevault-images').remove([path])
  if (error) console.error('[BakeVault] Failed to delete image:', error.message)
}
