import React, { useState } from 'react'
import { useCategories } from '@/hooks'
import ImageUpload from '@/components/admin/ImageUpload'
import MultiImageUpload from '@/components/admin/MultiImageUpload'
import type { DBProductWithCategory } from '@/lib/database.types'

interface Props {
  initial?:  DBProductWithCategory | null
  onSave:    (data: ProductFormData) => Promise<void>
  onCancel:  () => void
}

export interface ProductFormData {
  name:          string
  description:   string
  category_id:   string
  image_url:     string
  image_urls:    string[]   // all images including primary at index 0
  is_available:  boolean
  is_featured:   boolean
  price_type:    string
  display_order: number
}

function parseImageUrls(raw: unknown, fallback: string): string[] {
  if (Array.isArray(raw) && raw.length > 0) return raw as string[]
  if (fallback) return [fallback]
  return []
}

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const { categories } = useCategories()

  const initialImageUrls = parseImageUrls(initial?.image_urls, initial?.image_url ?? '')

  const [form, setForm]         = useState<ProductFormData>({
    name:          initial?.name          ?? '',
    description:   initial?.description   ?? '',
    category_id:   initial?.category_id   ?? '',
    image_url:     initial?.image_url      ?? '',
    image_urls:    initialImageUrls,
    is_available:  initial?.is_available  ?? true,
    is_featured:   initial?.is_featured   ?? false,
    price_type:    initial?.price_type    ?? 'wholesale',
    display_order: initial?.display_order ?? 0,
  })
  const [saving,     setSaving]     = useState(false)
  const [analyzing,  setAnalyzing]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  /** Sync primary image_url with the first element of image_urls */
  function handleImageUrlsChange(urls: string[]) {
    set('image_urls', urls)
    set('image_url', urls[0] ?? '')
  }

  /** Primary image upload → also update image_urls[0] */
  function handlePrimaryUpload(url: string) {
    set('image_url', url)
    set('image_urls', [url, ...form.image_urls.filter(u => u !== form.image_url)])
  }

  // ─── AI image analysis ──────────────────────────────────────────────────────
  async function analyzeWithAI() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      setError('VITE_ANTHROPIC_API_KEY is not set in .env.local — AI analysis unavailable.')
      return
    }
    if (!form.image_url) {
      setError('Upload a product photo first, then click Analyze.')
      return
    }

    try {
      setAnalyzing(true)
      setError(null)

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: form.image_url } },
              {
                type: 'text',
                text: [
                  'You are helping a wholesale baking supplies store in Lagos, Nigeria.',
                  'Analyze this product image and return ONLY valid JSON with exactly two keys: "name" and "description".',
                  '"name": The specific product name (include brand, weight, and variant if visible).',
                  '"description": 2-3 sentences about the product\'s baking uses and key features.',
                  'Example: {"name":"Havana Active Dry Yeast 500g","description":"A premium instant dry yeast ideal for rapid bread-making. Works reliably in tropical climates and delivers consistent rise for artisan loaves and rolls."}'
                ].join(' '),
              },
            ],
          }],
        }),
      })

      const aiData = await res.json()
      if (!res.ok) throw new Error(aiData.error?.message ?? 'AI API error')

      const raw   = aiData.content?.[0]?.text ?? ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      if (parsed.name)        set('name',        parsed.name)
      if (parsed.description) set('description', parsed.description)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url?.trim()) {
      setError('Please upload a product photo before saving.')
      return
    }
    try {
      setSaving(true); setError(null)
      await onSave({
        ...form,
        name:        form.name.trim(),
        description: form.description?.trim() ?? '',
        image_url:   form.image_urls[0] ?? form.image_url,
        image_urls:  form.image_urls,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const label = 'block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'
  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      {/* Name */}
      <div>
        <label className={label}>Product Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. Havana Active Baking Powder" className={input} required />
      </div>

      {/* Category + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Category</label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={input}>
            <option value="">— No category —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Price Type</label>
          <select value={form.price_type} onChange={e => set('price_type', e.target.value)} className={input}>
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
            <option value="contact">Contact for price</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={label}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          rows={3} placeholder="What makes this product special? (used in hero slider)"
          className={input + ' resize-none'} />
      </div>

      {/* Primary image + AI analysis */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={label.replace('mb-1', '')}>Product Photo *</label>
          <button
            type="button"
            onClick={analyzeWithAI}
            disabled={analyzing || !form.image_url}
            title={!form.image_url ? 'Upload a photo first' : 'Use AI to suggest name & description'}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Analyzing…</>
            ) : (
              <><span>✨</span> AI Analyze</>
            )}
          </button>
        </div>
        <ImageUpload
          key={initial?.id ?? 'new'}
          currentUrl={form.image_url || null}
          onUpload={handlePrimaryUpload}
          onError={msg => setError(msg)}
        />
        <div className="mt-2">
          <input type="url" value={form.image_url} onChange={e => { set('image_url', e.target.value); set('image_urls', [e.target.value, ...form.image_urls.slice(1)]) }}
            placeholder="…or paste an image URL"
            className={input + ' text-xs'} />
        </div>
      </div>

      {/* Additional images */}
      <div>
        <label className={label}>Additional Photos (up to 4 more)</label>
        <MultiImageUpload
          urls={form.image_urls.slice(1)}   // exclude primary
          max={4}
          onChange={extras => handleImageUrlsChange([form.image_url, ...extras].filter(Boolean))}
          onError={msg => setError(msg)}
        />
      </div>

      {/* Display Order */}
      <div>
        <label className={label}>Display Order</label>
        <input type="number" min={0} value={form.display_order}
          onChange={e => set('display_order', Number(e.target.value))}
          className={input + ' w-28'} />
        <p className="text-xs text-gray-400 mt-1">Lower = shows first</p>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        {([['is_available', 'Available for purchase'], ['is_featured', 'Featured in hero']] as const).map(([key, text]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => set(key, !form[key])}
              className={`w-11 h-6 rounded-full transition-colors relative ${form[key] ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">{text}</span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}