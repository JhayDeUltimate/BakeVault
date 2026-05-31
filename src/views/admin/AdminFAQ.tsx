import React, { useEffect, useMemo, useState } from 'react'
import { createFAQCategory, createFAQItem, getAdminFAQs } from '@/lib/api'
import type { FAQCategoryData, FAQItemData } from '@/lib/faq'

const DEFAULT_ICON = 'M8 10h.01M12 10h.01M16 10h.01M9 16h6'
const DEFAULT_CATEGORY_TITLE = 'General'

interface FAQQuestion extends FAQItemData {
  categoryId: string
  categoryTitle: string
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function AdminFAQ() {
  const [categories, setCategories] = useState<FAQCategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [draft, setDraft] = useState({ question: '', answer: '' })

  const questions = useMemo<FAQQuestion[]>(() => {
    return categories.flatMap(category =>
      category.items.map(item => ({
        ...item,
        categoryId: category.id ?? '',
        categoryTitle: category.title,
      }))
    )
  }, [categories])

  function flash(message: string) {
    setSuccess(message)
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

  useEffect(() => {
    void loadFAQs()
  }, [])

  async function resolveTargetCategory(): Promise<string> {
    const existingCategory = categories.find(category => category.id)
    if (existingCategory?.id) return existingCategory.id

    const category = await createFAQCategory({
      title: DEFAULT_CATEGORY_TITLE,
      icon: DEFAULT_ICON,
      display_order: 0,
      is_visible: true,
    })
    return category.id
  }

  async function handleCreateFAQ(e: React.FormEvent) {
    e.preventDefault()
    const question = draft.question.trim()
    const answer = draft.answer.trim()
    if (!question || !answer) return

    try {
      setSaving(true)
      setError(null)
      const categoryId = await resolveTargetCategory()
      const nextOrder = questions.length > 0
        ? Math.max(...questions.map(item => item.display_order ?? 0)) + 1
        : 0

      await createFAQItem({
        category_id: categoryId,
        question,
        answer,
        display_order: nextOrder,
        is_visible: true,
      })
      setDraft({ question: '', answer: '' })
      setShowAddForm(false)
      await loadFAQs()
      flash('FAQ added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add FAQ')
    } finally {
      setSaving(false)
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
          <p className="mt-1 text-sm text-gray-500">Manage customer questions and answers.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(value => !value)
            setError(null)
          }}
          className="flex w-full items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors sm:w-auto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add FAQ
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-100">{success}</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleCreateFAQ} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Question</label>
            <input
              value={draft.question}
              onChange={e => setDraft(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter the customer question"
              className={input}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Answer</label>
            <textarea
              value={draft.answer}
              onChange={e => setDraft(prev => ({ ...prev, answer: e.target.value }))}
              placeholder="Enter the answer customers should see"
              rows={5}
              className={input + ' resize-y'}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setDraft({ question: '', answer: '' })
              }}
              className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !draft.question.trim() || !draft.answer.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save FAQ'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {questions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            No FAQ questions yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {questions.map(item => {
              const key = item.id ?? item.question
              const open = openQuestion === key

              return (
                <article key={key}>
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(open ? null : key)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-orange-50/50"
                    aria-expanded={open}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800">{item.question}</p>
                      <p className="mt-1 text-xs text-gray-400">{item.categoryTitle}</p>
                    </div>
                    <ChevronIcon open={open} />
                  </button>
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
      </div>
    </div>
  )
}
