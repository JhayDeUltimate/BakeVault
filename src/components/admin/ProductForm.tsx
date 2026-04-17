import React, { useState } from 'react'
import { useCategories } from '@/hooks'
import ImageUpload from '@/components/admin/ImageUpload'
import type { DBProductWithCategory } from '@/lib/database.types'

interface Props {
  initial?: DBProductWithCategory | null
  onSave: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

export interface ProductFormData {
  name: string
  description: string
  category_id: string
  image_url: string
  is_available: boolean
  is_featured: boolean
  price_type: string
  display_order: number
}

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const { categories } = useCategories()

  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    category_id: initial?.category_id ?? '',
    image_url: initial?.image_url ?? '',
    is_available: initial?.is_available ?? true,
    is_featured: initial?.is_featured ?? false,
    price_type: initial?.price_type ?? 'wholesale',
    display_order: initial?.display_order ?? 0,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // If image is required, enforce it with a visible error.
    if (!form.image_url?.trim()) {
      setError('Please upload a product photo (or paste an image URL) before saving.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() ?? '',
        image_url: form.image_url.trim(),
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const label =
    'block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'
  const input =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className={label}>Product Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Havana Active Baking Powder"
          className={input}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Category</label>
          <select
            value={form.category_id}
            onChange={e => set('category_id', e.target.value)}
            className={input}
          >
            <option value="">— No category —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Price Type</label>
          <select
            value={form.price_type}
            onChange={e => set('price_type', e.target.value)}
            className={input}
          >
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
            <option value="contact">Contact for price</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="What makes this product special? (used in hero slider)"
          className={input + ' resize-none'}
        />
      </div>

      <div>
        <label className={label}>Product Photo *</label>
        <ImageUpload
          key={initial?.id ?? 'new'}
          currentUrl={form.image_url || null}
          onUpload={url => set('image_url', url)}
          onError={msg => setError(msg)}
        />
        <div className="mt-2">
          <input
            type="url"
            value={form.image_url}
            onChange={e => set('image_url', e.target.value)}
            placeholder="…or paste an image URL"
            className={input + ' text-xs'}
          />
        </div>
      </div>

      <div>
        <label className={label}>Display Order</label>
        <input
          type="number"
          min={0}
          value={form.display_order}
          onChange={e => set('display_order', Number(e.target.value))}
          className={input + ' w-28'}
        />
        <p className="text-xs text-gray-400 mt-1">Lower number = shows first</p>
      </div>

      <div className="flex gap-6">
        {(
          [
            ['is_available', 'Available for purchase'],
            ['is_featured', 'Featured in hero slider'],
          ] as const
        ).map(([key, text]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => set(key, !form[key])}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                form[key] ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form[key] ? 'translate-x-5' : ''
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">{text}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}