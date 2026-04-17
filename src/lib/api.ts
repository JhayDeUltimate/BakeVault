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
  includeUnavailable?: boolean
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
  const payload: Database['public']['Tables']['enquiries']['Insert'] = {
    items: items as unknown as Json,
    whatsapp_message: whatsappMessage,
    status: 'sent',
  }

  const { error } = await supabase.from('enquiries').insert(payload)
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

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type "${file.type}". Please upload a JPEG, PNG, or WebP image.`)
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`)
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('bakevault-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(error.message)

  // Return the storage path (works for both public and private buckets)
  return path
}

export async function deleteProductImage(imagePathOrUrl: string): Promise<void> {
  if (!imagePathOrUrl) return

  // If it's already a storage path like "products/....jpg"
  let path = imagePathOrUrl

  // Backward compatibility: if a full URL was stored, try to extract the object path.
  if (/^https?:\/\//i.test(imagePathOrUrl)) {
    try {
      const u = new URL(imagePathOrUrl)
      // Supabase public URL format typically: /storage/v1/object/public/<bucket>/<path>
      // Signed URL format: /storage/v1/object/sign/<bucket>/<path>
      const parts = u.pathname.split('/')
      const bucketIdx = parts.findIndex(p => p === 'public' || p === 'sign')
      if (bucketIdx !== -1) {
        // bucket name is next segment
        const bucket = parts[bucketIdx + 1]
        if (bucket === 'bakevault-images') {
          path = parts.slice(bucketIdx + 2).join('/')
        }
      }
      // Strip any accidental leading slashes
      path = path.replace(/^\/+/, '')
    } catch {
      // If URL parsing fails, do nothing (avoid deleting wrong objects)
      return
    }
  }

  // Safety: only allow deletes inside expected prefix
  if (!path.startsWith('products/')) return

  const { error } = await supabase.storage.from('bakevault-images').remove([path])
  if (error) console.error('[BakeVault] Failed to delete image:', error.message)
}

export async function getProductImageUrl(imagePathOrUrl: string): Promise<string> {
  // If it's already a full URL, keep it (backward compatible)
  if (/^https?:\/\//i.test(imagePathOrUrl)) return imagePathOrUrl

  // If bucket is public, you can still use getPublicUrl:
  // const { data } = supabase.storage.from('bakevault-images').getPublicUrl(imagePathOrUrl)
  // return data.publicUrl

  // For private buckets: signed URL
  const { data, error } = await supabase.storage
    .from('bakevault-images')
    .createSignedUrl(imagePathOrUrl, 60 * 60) // 1 hour

  if (error) throw new Error(error.message)
  return data.signedUrl
}