// src/views/admin/AdminFAQ.tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  createFAQCategory,
  createFAQItem,
  getAdminFAQs,
  updateFAQCategory,
  deleteFAQCategory,
  updateFAQItem,
  deleteFAQItem,
} from '@/lib/api'
import type { FAQCategoryData, FAQItemData } from '@/lib/faq'

export default function AdminFAQ() {
  const [categories, setCategories] = useState<FAQCategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'questions' | 'categories'>('questions')
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryTitle, setEditCategoryTitle] = useState('')
  const [draft, setDraft] = useState({ question: '', answer: '', category_id: '' })
  const [newCategoryTitle, setNewCategoryTitle] = useState('')

  const questions = useMemo(() =>
    categories.flatMap(c => c.items.map(item => ({ ...item, categoryId: c.id ?? '', categoryTitle: c.title }))),
    [categories]
  )

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function loadFAQs() {
    try {
      setLoading(true)
      setError(null)
      setCategories(await getAdminFAQs())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadFAQs() }, [])

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    const title = newCategoryTitle.trim()
    if (!title) return
    try {
      setSaving(true)
      setError(null)
      await createFAQCategory({
        title,
        icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16h6',
        display_order: categories.length,
        is_visible: true,
      })
      setNewCategoryTitle('')
      setShowAddCategory(false)
      await loadFAQs()
      flash(`Category "${title}" created.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateCategory(id: string) {
    const title = editCategoryTitle.trim()
    if (!title) return
    try {
      setSaving(true)
      setError(null)
      await updateFAQCategory(id, { title })
      setEditingCategory(null)
      await loadFAQs()
      flash('Category updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategory(id: string, title: string) {
    if (!window.confirm(`Delete category "${title}" and ALL its questions? This cannot be undone.`)) return
    try {
      setSaving(true)
      setError(null)
      await deleteFAQCategory(id)
      await loadFAQs()
      flash('Category deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault()
    const question = draft.question.trim()
    const answer = draft.answer.trim()
    const category_id = draft.category_id || categories[0]?.id || ''
    if (!question || !answer || !category_id) return
    try {
      setSaving(true)
      setError(null)
      await createFAQItem({ category_id, question, answer, display_order: questions.length, is_visible: true })
      setDraft({ question: '', answer: '', category_id: '' })
      setShowAddQuestion(false)
      await loadFAQs()
      flash('Question added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!window.confirm('Delete this FAQ question?')) return
    try {
      await deleteFAQItem(id)
      await loadFAQs()
      flash('Question deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">FAQ</h1>
          <p className="mt-1 text-sm text-gray-500">{questions.length} questions across {categories.length} categories.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddCategory(v => !v); setShowAddQuestion(false) }}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-50"
          >
            + Category
          </button>
          <button
            onClick={() => { setShowAddQuestion(v => !v); setShowAddCategory(false) }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            + Question
          </button>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-100">{success}</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}

      {/* Add Category form */}
      {showAddCategory && (
        <form onSubmit={handleCreateCategory} className="grid gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">New Category Title</label>
          <div className="flex gap-2">
            <input value={newCategoryTitle} onChange={e => setNewCategoryTitle(e.target.value)} placeholder="e.g. Wholesale Orders" className={input} autoFocus />
            <button type="submit" disabled={saving || !newCategoryTitle.trim()} className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-40">{saving ? 'Saving...' : 'Add'}</button>
            <button type="button" onClick={() => setShowAddCategory(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      {/* Add Question form */}
      {showAddQuestion && (
        <form onSubmit={handleCreateQuestion} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Category</label>
            <select value={draft.category_id || categories[0]?.id || ''} onChange={e => setDraft(p => ({ ...p, category_id: e.target.value }))} className={input}>
              {categories.map(c => <option key={c.id} value={c.id ?? ''}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Question</label>
            <input value={draft.question} onChange={e => setDraft(p => ({ ...p, question: e.target.value }))} placeholder="Enter the customer question" className={input} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Answer</label>
            <textarea value={draft.answer} onChange={e => setDraft(p => ({ ...p, answer: e.target.value }))} rows={5} className={input + ' resize-y'} />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowAddQuestion(false)} className="px-4 py-2.5 text-sm text-gray-500">Cancel</button>
            <button type="submit" disabled={saving || !draft.question.trim() || !draft.answer.trim()} className="bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-40">{saving ? 'Saving...' : 'Save Question'}</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(['questions', 'categories'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white shadow text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab} {tab === 'questions' ? `(${questions.length})` : `(${categories.length})`}
          </button>
        ))}
      </div>

      {/* Questions list */}
      {activeTab === 'questions' && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          {questions.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No FAQ questions yet.</div>
          ) : questions.map(item => {
            const key = item.id ?? item.question
            const open = openQuestion === key
            return (
              <article key={key}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <button type="button" onClick={() => setOpenQuestion(open ? null : key)} className="flex-1 text-left">
                    <p className="font-semibold text-gray-800 text-sm">{item.question}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{item.categoryTitle}</p>
                  </button>
                  <button onClick={() => item.id && handleDeleteQuestion(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
                {open && (
                  <div className="border-t border-orange-50 bg-orange-50/30 px-5 py-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-gray-600">{item.answer}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* Categories list */}
      {activeTab === 'categories' && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          {categories.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No categories yet.</div>
          ) : categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 px-5 py-4 group">
              {editingCategory === cat.id ? (
                <div className="flex flex-1 gap-2">
                  <input value={editCategoryTitle} onChange={e => setEditCategoryTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') cat.id && handleUpdateCategory(cat.id); if (e.key === 'Escape') setEditingCategory(null) }}
                    className="flex-1 border border-orange-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" autoFocus />
                  <button onClick={() => cat.id && handleUpdateCategory(cat.id)} disabled={saving} className="text-sm text-orange-600 font-semibold">{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setEditingCategory(null)} className="text-sm text-gray-400">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{cat.title}</p>
                    <p className="text-xs text-gray-400">{cat.items.length} question{cat.items.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingCategory(cat.id ?? null); setEditCategoryTitle(cat.title) }}
                      className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors" title="Rename">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => cat.id && handleDeleteCategory(cat.id, cat.title)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}