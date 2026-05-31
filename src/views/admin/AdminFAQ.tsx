import React, { useEffect, useState } from 'react'
import {
  createFAQCategory,
  createFAQItem,
  deleteFAQCategory,
  deleteFAQItem,
  getAdminFAQs,
  updateFAQCategory,
  updateFAQItem,
} from '@/lib/api'
import type { FAQCategoryData, FAQItemData } from '@/lib/faq'

const DEFAULT_ICON = 'M8 10h.01M12 10h.01M16 10h.01M9 16h6'

interface ItemDraft {
  question: string
  answer: string
  display_order: number
  is_visible: boolean
}

const emptyItemDraft = (): ItemDraft => ({
  question: '',
  answer: '',
  display_order: 0,
  is_visible: true,
})

export default function AdminFAQ() {
  const [categories, setCategories] = useState<FAQCategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    title: '',
    icon: DEFAULT_ICON,
    display_order: 0,
    is_visible: true,
  })
  const [newItems, setNewItems] = useState<Record<string, ItemDraft>>({})

  function flash(message: string) {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function loadFAQs() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminFAQs()
      setCategories(data)
      setNewItems(prev => {
        const next = { ...prev }
        for (const category of data) {
          if (!category.id || next[category.id]) continue
          next[category.id] = {
            ...emptyItemDraft(),
            display_order: category.items.length > 0
              ? Math.max(...category.items.map(item => item.display_order ?? 0)) + 1
              : 0,
          }
        }
        return next
      })
      setNewCategory(prev => ({
        ...prev,
        display_order: data.length > 0 ? Math.max(...data.map(category => category.display_order ?? 0)) + 1 : 0,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFAQs()
  }, [])

  function setCategoryField<K extends keyof FAQCategoryData>(id: string, key: K, value: FAQCategoryData[K]) {
    setCategories(prev => prev.map(category => category.id === id ? { ...category, [key]: value } : category))
  }

  function setItemField<K extends keyof FAQItemData>(categoryId: string, itemId: string, key: K, value: FAQItemData[K]) {
    setCategories(prev => prev.map(category => {
      if (category.id !== categoryId) return category
      return {
        ...category,
        items: category.items.map(item => item.id === itemId ? { ...item, [key]: value } : item),
      }
    }))
  }

  function updateNewItem(categoryId: string, updates: Partial<ItemDraft>) {
    setNewItems(prev => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] ?? emptyItemDraft()), ...updates },
    }))
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    const title = newCategory.title.trim()
    if (!title) return

    try {
      setSaving(true)
      setError(null)
      await createFAQCategory({
        title,
        icon: newCategory.icon,
        display_order: Number(newCategory.display_order) || 0,
        is_visible: newCategory.is_visible,
      })
      setNewCategory({
        title: '',
        icon: DEFAULT_ICON,
        display_order: newCategory.display_order + 1,
        is_visible: true,
      })
      await loadFAQs()
      flash('FAQ category added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add FAQ category')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveCategory(category: FAQCategoryData) {
    if (!category.id || !category.title.trim()) return

    try {
      setSaving(true)
      setError(null)
      await updateFAQCategory(category.id, {
        title: category.title,
        icon: category.icon || DEFAULT_ICON,
        display_order: Number(category.display_order) || 0,
        is_visible: category.is_visible ?? true,
      })
      await loadFAQs()
      flash('FAQ category saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategory(category: FAQCategoryData) {
    if (!category.id) return
    if (!window.confirm(`Delete "${category.title}" and all of its FAQ items?`)) return

    try {
      setSaving(true)
      setError(null)
      await deleteFAQCategory(category.id)
      await loadFAQs()
      flash('FAQ category deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ category')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateItem(category: FAQCategoryData) {
    if (!category.id) return
    const draft = newItems[category.id] ?? emptyItemDraft()
    if (!draft.question.trim() || !draft.answer.trim()) return

    try {
      setSaving(true)
      setError(null)
      await createFAQItem({
        category_id: category.id,
        question: draft.question,
        answer: draft.answer,
        display_order: Number(draft.display_order) || 0,
        is_visible: draft.is_visible,
      })
      setNewItems(prev => ({ ...prev, [category.id!]: emptyItemDraft() }))
      await loadFAQs()
      flash('FAQ item added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add FAQ item')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveItem(categoryId: string, item: FAQItemData) {
    if (!item.id || !item.question.trim() || !item.answer.trim()) return

    try {
      setSaving(true)
      setError(null)
      await updateFAQItem(item.id, {
        question: item.question,
        answer: item.answer,
        display_order: Number(item.display_order) || 0,
        is_visible: item.is_visible ?? true,
      })
      await loadFAQs()
      flash('FAQ item saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteItem(item: FAQItemData) {
    if (!item.id) return
    if (!window.confirm(`Delete "${item.question}"?`)) return

    try {
      setSaving(true)
      setError(null)
      await deleteFAQItem(item.id)
      await loadFAQs()
      flash('FAQ item deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ item')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'
  const subtleButton = 'px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50'

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-5 pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">FAQ</h1>
        <button type="button" onClick={loadFAQs} className={subtleButton}>Refresh</button>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-100">{success}</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}

      <form onSubmit={handleCreateCategory} className="grid gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Add FAQ category</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr_7rem_auto]">
          <input
            value={newCategory.title}
            onChange={e => setNewCategory(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Category title"
            className={input}
          />
          <input
            value={newCategory.icon}
            onChange={e => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="SVG path icon"
            className={input}
          />
          <input
            type="number"
            min={0}
            value={newCategory.display_order}
            onChange={e => setNewCategory(prev => ({ ...prev, display_order: Number(e.target.value) }))}
            className={input}
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={newCategory.is_visible}
              onChange={e => setNewCategory(prev => ({ ...prev, is_visible: e.target.checked }))}
            />
            Visible
          </label>
        </div>
        <button
          type="submit"
          disabled={saving || !newCategory.title.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40 sm:w-auto sm:justify-self-start"
        >
          {saving ? 'Saving...' : 'Add Category'}
        </button>
      </form>

      <div className="space-y-5">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            No FAQ categories yet.
          </div>
        ) : categories.map(category => {
          const categoryId = category.id ?? ''
          const draft = categoryId ? (newItems[categoryId] ?? emptyItemDraft()) : emptyItemDraft()
          return (
            <section key={category.id ?? category.title} className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="grid gap-3 border-b border-gray-100 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_2fr_7rem_auto]">
                  <div>
                    <label className={label}>Title</label>
                    <input
                      value={category.title}
                      onChange={e => setCategoryField(categoryId, 'title', e.target.value)}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>Icon path</label>
                    <input
                      value={category.icon}
                      onChange={e => setCategoryField(categoryId, 'icon', e.target.value)}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>Order</label>
                    <input
                      type="number"
                      min={0}
                      value={category.display_order ?? 0}
                      onChange={e => setCategoryField(categoryId, 'display_order', Number(e.target.value))}
                      className={input}
                    />
                  </div>
                  <label className="flex items-end gap-2 pb-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={category.is_visible ?? true}
                      onChange={e => setCategoryField(categoryId, 'is_visible', e.target.checked)}
                    />
                    Visible
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={saving || !category.title.trim()} onClick={() => handleSaveCategory(category)} className={subtleButton}>
                    Save Category
                  </button>
                  <button type="button" disabled={saving} onClick={() => handleDeleteCategory(category)} className="px-3 py-2 text-xs font-bold rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50">
                    Delete Category
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {category.items.map(item => (
                  <div key={item.id ?? item.question} className="grid gap-3 p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_7rem_auto]">
                      <div>
                        <label className={label}>Question</label>
                        <input
                          value={item.question}
                          onChange={e => setItemField(categoryId, item.id ?? '', 'question', e.target.value)}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className={label}>Order</label>
                        <input
                          type="number"
                          min={0}
                          value={item.display_order ?? 0}
                          onChange={e => setItemField(categoryId, item.id ?? '', 'display_order', Number(e.target.value))}
                          className={input}
                        />
                      </div>
                      <label className="flex items-end gap-2 pb-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={item.is_visible ?? true}
                          onChange={e => setItemField(categoryId, item.id ?? '', 'is_visible', e.target.checked)}
                        />
                        Visible
                      </label>
                    </div>
                    <div>
                      <label className={label}>Answer</label>
                      <textarea
                        value={item.answer}
                        onChange={e => setItemField(categoryId, item.id ?? '', 'answer', e.target.value)}
                        rows={3}
                        className={input + ' resize-y'}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={saving || !item.question.trim() || !item.answer.trim()} onClick={() => handleSaveItem(categoryId, item)} className={subtleButton}>
                        Save Item
                      </button>
                      <button type="button" disabled={saving} onClick={() => handleDeleteItem(item)} className="px-3 py-2 text-xs font-bold rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50">
                        Delete Item
                      </button>
                    </div>
                  </div>
                ))}

                <div className="grid gap-3 bg-gray-50/60 p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Add FAQ item</h3>
                  <div className="grid gap-3 md:grid-cols-[1fr_7rem_auto]">
                    <input
                      value={draft.question}
                      onChange={e => updateNewItem(categoryId, { question: e.target.value })}
                      placeholder="Question"
                      className={input}
                    />
                    <input
                      type="number"
                      min={0}
                      value={draft.display_order}
                      onChange={e => updateNewItem(categoryId, { display_order: Number(e.target.value) })}
                      className={input}
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={draft.is_visible}
                        onChange={e => updateNewItem(categoryId, { is_visible: e.target.checked })}
                      />
                      Visible
                    </label>
                  </div>
                  <textarea
                    value={draft.answer}
                    onChange={e => updateNewItem(categoryId, { answer: e.target.value })}
                    placeholder="Answer"
                    rows={3}
                    className={input + ' resize-y'}
                  />
                  <button
                    type="button"
                    disabled={saving || !draft.question.trim() || !draft.answer.trim()}
                    onClick={() => handleCreateItem({ ...category, items: category.items })}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40 sm:w-auto sm:justify-self-start"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
