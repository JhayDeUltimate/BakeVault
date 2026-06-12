import React, { useMemo, useState } from 'react'
import { useCategories } from '@/hooks'
import ImageUpload from '@/components/admin/ImageUpload'
import MultiImageUpload from '@/components/admin/MultiImageUpload'
import { supabase } from '@/lib/supabase'
import { friendlyErrorMessage } from '@/lib/error-messages'
import { normalizeProductDescription, parseProductDescription } from '@/lib/product-description'
import * as Sentry from '@sentry/react'
import type { DBProductWithCategory } from '@/lib/database.types'

interface Props {
  initial?: DBProductWithCategory | null
  nextDisplayOrder?: number
  onSave: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

export interface ProductFormData {
  name: string
  description: string
  category_id: string
  image_url: string
  image_urls: string[]
  is_available: boolean
  is_featured: boolean
  price_type: string
  display_order: number
}

type SpecMap = Record<string, string>
type FieldErrors = Partial<Record<'name' | 'category_id' | 'image_url' | 'summary' | 'keyFeatures', string>>

interface StructuredDescription {
  summary: string
  keyFeatures: string
  productDetails: string
  specifications: SpecMap
  productDescription: string
  bestFor: string
  usageTips: string
  storageTips: string
}

const SPEC_LABELS = [
  'Package Dimensions',
  'Manufacturer',
  'Country of origin',
  'Brand Name',
  'Flavour',
  'Container Type',
  'Age Range Description',
  'Set Name',
  'Unit Count',
  'Item Form',
  'Cuisine',
  'Item Package Weight',
  'Number of Items',
  'Number of Pieces',
  'Size',
]

function blankSpecs(): SpecMap {
  return Object.fromEntries(SPEC_LABELS.map(label => [label, '']))
}

function cleanLine(line: string): string {
  return line.replace(/^(?:\u2022|-|\u00e2\u20ac\u00a2)\s*/, '').trim()
}

function linesFromText(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean)
}

function findSection(sections: ReturnType<typeof parseProductDescription>['sections'], headings: string[]) {
  const keys = headings.map(heading => heading.toLowerCase())
  return sections.find(section => keys.includes(section.heading.toLowerCase()))
}

function parseSpecLine(line: string): { label: string; value: string } | null {
  const cleaned = cleanLine(line)
  const [label, ...rest] = cleaned.split(':')
  if (!label?.trim() || rest.length === 0) return null
  return { label: label.trim(), value: rest.join(':').trim() }
}

function parseStructuredDescription(description: string | null | undefined): StructuredDescription {
  const parsed = parseProductDescription(description)
  const productDetails = findSection(parsed.sections, ['Product Details'])
  const specifications = findSection(parsed.sections, ['Specifications'])
  const productDescription = findSection(parsed.sections, ['Product Description'])
  const bestFor = findSection(parsed.sections, ['Best For', 'Who Should Buy?'])
  const usageTips = findSection(parsed.sections, ['Usage Tips'])
  const storageTips = findSection(parsed.sections, ['Storage Tips'])
  const specs = blankSpecs()

  specifications?.lines.forEach(line => {
    const row = parseSpecLine(line)
    if (row && row.label in specs) specs[row.label] = row.value
  })

  return {
    summary: parsed.summary,
    keyFeatures: parsed.features.join('\n'),
    productDetails: productDetails?.lines.map(cleanLine).join('\n') ?? '',
    specifications: specs,
    productDescription: productDescription?.lines.map(cleanLine).join('\n') ?? '',
    bestFor: bestFor?.lines.map(cleanLine).join('\n') ?? '',
    usageTips: usageTips?.lines.map(cleanLine).join('\n') ?? '',
    storageTips: storageTips?.lines.map(cleanLine).join('\n') ?? '',
  }
}

function bulletBlock(title: string, text: string): string[] {
  const lines = linesFromText(text)
  if (lines.length === 0) return []
  return [title, ...lines.map(line => `\u2022 ${line}`)]
}

function composeDescription(fields: StructuredDescription): string {
  const blocks: string[] = []
  if (fields.summary.trim()) blocks.push(fields.summary.trim())

  const features = bulletBlock('Key Features:', fields.keyFeatures)
  if (features.length) blocks.push(features.join('\n'))

  const details = bulletBlock('Product Details:', fields.productDetails)
  if (details.length) blocks.push(details.join('\n'))

  blocks.push([
    'Specifications:',
    ...SPEC_LABELS.map(label => `${label}: ${fields.specifications[label]?.trim() || 'Not specified'}`),
  ].join('\n'))

  if (fields.productDescription.trim()) {
    blocks.push(['Product Description:', fields.productDescription.trim()].join('\n'))
  }

  const bestFor = bulletBlock('Best For:', fields.bestFor)
  if (bestFor.length) blocks.push(bestFor.join('\n'))

  const usageTips = bulletBlock('Usage Tips:', fields.usageTips)
  if (usageTips.length) blocks.push(usageTips.join('\n'))

  const storageTips = bulletBlock('Storage Tips:', fields.storageTips)
  if (storageTips.length) blocks.push(storageTips.join('\n'))

  return blocks.join('\n\n')
}

function parseImageUrls(raw: string[] | null | undefined, fallback: string): string[] {
  if (raw?.length) return raw
  if (fallback) return [fallback]
  return []
}

function captureAnalyzeFailure(message: string, context: Record<string, unknown>) {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  Sentry.captureMessage(message, {
    level: 'warning',
    tags: { feature: 'admin_ai_analyze' },
    extra: context,
  })
}

export default function ProductForm({ initial, nextDisplayOrder, onSave, onCancel }: Props) {
  const { categories } = useCategories()
  const initialImageUrls = parseImageUrls(initial?.image_urls, initial?.image_url ?? '')
  const initialDescription = useMemo(() => parseStructuredDescription(initial?.description), [initial?.description])

  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    category_id: initial?.category_id ?? '',
    image_url: initial?.image_url ?? '',
    image_urls: initialImageUrls,
    is_available: initial?.is_available ?? true,
    is_featured: initial?.is_featured ?? false,
    price_type: initial?.price_type ?? 'wholesale',
    display_order: initial?.display_order ?? nextDisplayOrder ?? 0,
  })
  const [structured, setStructured] = useState<StructuredDescription>(initialDescription)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key in fieldErrors) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  function setStructuredField<K extends keyof StructuredDescription>(key: K, value: StructuredDescription[K]) {
    setStructured(prev => ({ ...prev, [key]: value }))
    if (key === 'summary' || key === 'keyFeatures') {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  function setSpec(label: string, value: string) {
    setStructured(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [label]: value },
    }))
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
        captureAnalyzeFailure(msg, {
          source: 'function_error',
          product_id: initial?.id ?? null,
          product_name: form.name || initial?.name || null,
          image_url: form.image_url,
          error: fnErr.message,
        })
        setError(msg)
        return
      }

      if (data?.error) {
        captureAnalyzeFailure(data.error, {
          source: 'response_error',
          product_id: initial?.id ?? null,
          product_name: form.name || initial?.name || data.productName || null,
          image_url: form.image_url,
          code: data.code ?? null,
        })
        setError(data.error)
        return
      }

      if (data?.name) set('name', data.name)
      if (data?.description) {
        set('description', data.description)
        setStructured(parseStructuredDescription(data.description))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI analysis failed'
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureException(err, {
          tags: { feature: 'admin_ai_analyze' },
          extra: {
            product_id: initial?.id ?? null,
            product_name: form.name || initial?.name || null,
            image_url: form.image_url,
          },
        })
      }
      setError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextFieldErrors: FieldErrors = {}
    if (!form.name.trim()) nextFieldErrors.name = 'Enter a product name.'
    if (!form.category_id.trim()) {
      nextFieldErrors.category_id = categories.length === 0
        ? 'Create a product category first, then select it.'
        : 'Select a product category.'
    }
    if (!form.image_url?.trim()) nextFieldErrors.image_url = 'Upload or paste a main product photo.'
    if (!structured.summary.trim()) nextFieldErrors.summary = 'Add a short summary sentence.'

    const featureCount = linesFromText(structured.keyFeatures).length
    if (featureCount < 2 || featureCount > 8) {
      nextFieldErrors.keyFeatures = 'Add 2 to 8 key features, one per line.'
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('Fix the highlighted fields before saving.')
      return
    }

    const composedDescription = composeDescription(structured)
    const description = normalizeProductDescription(composedDescription)
    if (!description.ok) {
      const key = description.error.includes('feature') ? 'keyFeatures' : 'summary'
      setFieldErrors({ [key]: description.error })
      setError(description.error)
      return
    }
    try {
      setSaving(true)
      setError(null)
      setFieldErrors({})
      await onSave({
        ...form,
        name: form.name.trim(),
        description: description.value,
        image_url: form.image_urls[0] ?? form.image_url,
        image_urls: form.image_urls,
      })
    } catch (err) {
      setError(friendlyErrorMessage(err, 'Product could not be saved. Check the required fields and try again.'))
    } finally {
      setSaving(false)
    }
  }

  const label = 'block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'
  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'
  const textarea = `${input} resize-y min-h-28`
  const invalidInput = 'border-red-300 bg-red-50/40 focus:ring-red-300'
  const hint = 'mt-1 text-xs text-gray-400'
  const fieldError = 'mt-1 text-xs font-medium text-red-600'
  const inputClass = (field: keyof FieldErrors) => `${input} ${fieldErrors[field] ? invalidInput : ''}`
  const textareaClass = (field: keyof FieldErrors) => `${textarea} ${fieldErrors[field] ? invalidInput : ''}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 leading-snug">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem_14rem]">
          <div>
            <label className={label}>Product Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Yogourmet Probiotic Yogurt Starter" className={inputClass('name')} />
            {fieldErrors.name && <p className={fieldError}>{fieldErrors.name}</p>}
          </div>
          <div>
            <label className={label}>Category *</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputClass('category_id')}>
              <option value="">{categories.length === 0 ? 'No categories available' : 'Select a category'}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fieldErrors.category_id && <p className={fieldError}>{fieldErrors.category_id}</p>}
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
      </section>

      <section className={`rounded-xl border bg-white p-5 shadow-sm ${fieldErrors.image_url ? 'border-red-200' : 'border-gray-100'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">Images</h2>
            <p className="text-xs text-gray-400">Upload the main product photo first. AI Analyze uses the main photo.</p>
          </div>
          <button type="button" onClick={analyzeWithAI}
            disabled={analyzing || !form.image_url?.trim()}
            title={!form.image_url?.trim() ? 'Upload or paste image URL first' : 'AI suggests name and product details'}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40">
            {analyzing
              ? <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Analyzing...</>
              : <><span aria-hidden>AI</span> Analyze</>
            }
          </button>
        </div>
        <div className="mt-4">
          <ImageUpload
            key={initial?.id ?? 'new'}
            currentUrl={form.image_url || null}
            onUpload={handlePrimaryUpload}
            onError={msg => setError(msg)}
          />
          <input type="url" value={form.image_url}
            onChange={e => { set('image_url', e.target.value); set('image_urls', [e.target.value, ...form.image_urls.slice(1)].filter(Boolean)) }}
            placeholder="Or paste a Supabase Storage or external image URL"
            className={`${inputClass('image_url')} mt-3 text-xs`} />
          {fieldErrors.image_url && <p className={fieldError}>{fieldErrors.image_url}</p>}
        </div>
        <div className="mt-4">
          <label className={label}>Additional Photos (up to 4 more)</label>
          <MultiImageUpload
            urls={form.image_urls.slice(1)}
            max={4}
            onChange={extras => handleImageUrlsChange([form.image_url, ...extras].filter(Boolean))}
            onError={msg => setError(msg)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">Storefront Product Content</h2>
        <p className="mt-1 text-xs text-gray-400">Every box below maps to a visible section on the product details page.</p>

        <div className="mt-5 grid gap-5">
          <div>
            <label className={label}>Summary Sentence *</label>
            <textarea value={structured.summary}
              onChange={e => setStructuredField('summary', e.target.value)}
              rows={2}
              placeholder="One sentence explaining what the product is and its main use."
              className={textareaClass('summary')} />
            {fieldErrors.summary && <p className={fieldError}>{fieldErrors.summary}</p>}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={label}>Key Features * (2-8 lines)</label>
              <textarea value={structured.keyFeatures}
                onChange={e => setStructuredField('keyFeatures', e.target.value)}
                placeholder={'Freeze-dried starter culture\nSuitable for homemade yogurt\nPowder format for easy use'}
                className={textareaClass('keyFeatures')} />
              {fieldErrors.keyFeatures && <p className={fieldError}>{fieldErrors.keyFeatures}</p>}
              <p className={hint}>One feature per line. You do not need to type bullet symbols.</p>
            </div>
            <div>
              <label className={label}>Product Details</label>
              <textarea value={structured.productDetails}
                onChange={e => setStructuredField('productDetails', e.target.value)}
                placeholder={'CONTAINS: 6 sachets of 3g starter.\nMAKING HOMEMADE YOGURT? It is simple with this starter.\nCERTIFIED PRODUCT: Halal / Kosher / Gluten-Free / Non-GMO'}
                className={textarea} />
              <p className={hint}>These become the checked bullets above the specifications table.</p>
            </div>
          </div>

          <div>
            <label className={label}>Product Description</label>
            <textarea value={structured.productDescription}
              onChange={e => setStructuredField('productDescription', e.target.value)}
              rows={4}
              placeholder="Write the longer product paragraph customers see below the details grid."
              className={textarea} />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div>
              <label className={label}>Best For</label>
              <textarea value={structured.bestFor}
                onChange={e => setStructuredField('bestFor', e.target.value)}
                placeholder={'Home yogurt makers\nSmall dairy businesses'}
                className={textarea} />
            </div>
            <div>
              <label className={label}>Usage Tips</label>
              <textarea value={structured.usageTips}
                onChange={e => setStructuredField('usageTips', e.target.value)}
                placeholder={'Follow the manufacturer instructions\nUse clean utensils and containers'}
                className={textarea} />
            </div>
            <div>
              <label className={label}>Storage Tips</label>
              <textarea value={structured.storageTips}
                onChange={e => setStructuredField('storageTips', e.target.value)}
                placeholder={'Store according to package directions\nKeep sealed until use'}
                className={textarea} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">Specifications Table</h2>
        <p className="mt-1 text-xs text-gray-400">These fields appear as rows in the Product Details table. Leave blank to save as "Not specified".</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SPEC_LABELS.map(specLabel => (
            <div key={specLabel}>
              <label className={label}>{specLabel}</label>
              <input type="text" value={structured.specifications[specLabel] ?? ''}
                onChange={e => setSpec(specLabel, e.target.value)}
                placeholder="Not specified"
                className={input} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[12rem_1fr] lg:items-end">
          <div>
            <label className={label}>Display Order</label>
            <input type="number" min={0} value={form.display_order}
              onChange={e => set('display_order', Number(e.target.value))}
              className={input} />
            <p className={hint}>Lower = shows first</p>
          </div>

          <div className="flex flex-wrap gap-6">
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
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-gray-100 bg-gray-50/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:bg-white">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </form>
  )
}
