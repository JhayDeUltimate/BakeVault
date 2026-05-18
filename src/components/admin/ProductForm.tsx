import React, { useState } from 'react'
import { useCategories } from '@/hooks'
import ImageUpload from '@/components/admin/ImageUpload'
import MultiImageUpload from '@/components/admin/MultiImageUpload'
import { supabase } from '@/lib/supabase'
import type { DBProductWithCategory } from '@/lib/database.types'

interface Props {
  initial?:  DBProductWithCategory | null
  nextDisplayOrder?: number
  onSave:    (data: ProductFormData) => Promise<void>
  onCancel:  () => void
}

export interface ProductFormData {
  name:          string
  description:   string
  category_id:   string
  image_url:     string
  image_urls:    string[]
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

export default function ProductForm({ initial, nextDisplayOrder, onSave, onCancel }: Props) {
  const { categories } = useCategories()
  const initialImageUrls = parseImageUrls(initial?.image_urls, initial?.image_url ?? '')

  const [form, setForm] = useState<ProductFormData>({
    name:          initial?.name          ?? '',
    description:   initial?.description   ?? '',
    category_id:   initial?.category_id   ?? '',
    image_url:     initial?.image_url     ?? '',
    image_urls:    initialImageUrls,
    is_available:  initial?.is_available  ?? true,
    is_featured:   initial?.is_featured   ?? false,
    price_type:    initial?.price_type    ?? 'wholesale',
    display_order: initial?.display_order ?? nextDisplayOrder ?? 0,
  })
  const [saving,    setSaving]    = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handlePrimaryUpload(url: string) {
    set('image_url', url)
    set('image_urls', [url, ...form.image_urls.filter(u => u !== form.image_url)])
  }

  function handleImageUrlsChange(urls: string[]) {
    set('image_urls', urls)
    set('image_url', urls[0] ?? '')
  }

  async function analyzeWithAI() {
    if (!form.image_url?.trim()) {
      setError('Upload or paste an image URL first, then click AI Analyze.')
      return
    }
    try {
      setAnalyzing(true)
      setError(null)

      const { data, error: fnErr } = await supabase.functions.invoke('ai-assistant', {
        body: { mode: 'analyze', imageUrl: form.image_url },
      })

      if (fnErr) {
        let msg = 'AI analyze failed. Make sure the edge function is deployed with --no-verify-jwt.'
        try {
          const body = await (fnErr as { context?: Response }).context?.json?.()
          if (body?.error) msg = body.error
        } catch { /* ignore */ }
        setError(msg)
        return
      }

      if (data?.error) { setError(data.error); return }

      if (data?.name)        set('name',        data.name)
      if (data?.description) set('description', data.description)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url?.trim()) { setError('Please upload a product photo before saving.'); return }
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
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 leading-snug">
          {error}
        </div>
      )}

      <div>
        <label className={label}>Product Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. Havana Active Baking Powder" className={input} required />
      </div>

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

      <div>
        <label className={label}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          rows={6} placeholder="What makes this product special? AI Analyze generates a structured description."
          className={input + ' resize-none'} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={label.replace('mb-1', '')}>Product Photo *</label>
          <button type="button" onClick={analyzeWithAI}
            disabled={analyzing || !form.image_url?.trim()}
            title={!form.image_url?.trim() ? 'Upload or paste image URL first' : 'AI suggests name & description'}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {analyzing
              ? <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Analyzing…</>
              : <><span>✨</span> AI Analyze</>
            }
          </button>
        </div>
        <ImageUpload
          key={initial?.id ?? 'new'}
          currentUrl={form.image_url || null}
          onUpload={handlePrimaryUpload}
          onError={msg => setError(msg)}
        />
        <div className="mt-2">
          <input type="url" value={form.image_url}
            onChange={e => { set('image_url', e.target.value); set('image_urls', [e.target.value, ...form.image_urls.slice(1)]) }}
            placeholder="…or paste a Supabase Storage or external image URL"
            className={input + ' text-xs'} />
        </div>
      </div>

      <div>
        <label className={label}>Additional Photos (up to 4 more)</label>
        <MultiImageUpload
          urls={form.image_urls.slice(1)}
          max={4}
          onChange={extras => handleImageUrlsChange([form.image_url, ...extras].filter(Boolean))}
          onError={msg => setError(msg)}
        />
      </div>

      <div>
        <label className={label}>Display Order</label>
        <input type="number" min={0} value={form.display_order}
          onChange={e => set('display_order', Number(e.target.value))}
          className={input + ' w-28'} />
        <p className="text-xs text-gray-400 mt-1">Lower = shows first</p>
      </div>

      <div className="flex gap-6">
        {([['is_available', 'Available for purchase'], ['is_featured', 'Featured in hero']] as const).map(([key, text]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => set(key, !form[key])}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form[key] ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">{text}</span>
          </label>
        ))}
      </div>

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