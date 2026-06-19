import React, { useState, useCallback, useEffect } from 'react'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import { friendlyErrorMessage } from '@/lib/error-messages'
import type { DBCategory } from '@/lib/database.types'

export function AdminCategories() {
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      setCategories(await getAdminCategories())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const [editId,    setEditId]    = useState<string | null>(null)
  const [editName,  setEditName]  = useState('')
  const [editSeoTitle, setEditSeoTitle] = useState('')
  const [editSeoDescription, setEditSeoDescription] = useState('')
  const [newName,   setNewName]   = useState('')
  const [newSeoTitle, setNewSeoTitle] = useState('')
  const [newSeoDescription, setNewSeoDescription] = useState('')
  const [savingNew, setSavingNew] = useState(false)
  const [savingEdit,setSavingEdit]= useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'newName' | 'editName', string>>>({})
  const [success,   setSuccess]   = useState<string | null>(null)

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) {
      setFieldErrors({ newName: 'Enter a category name.' })
      setFormError('Enter a category name before adding it.')
      return
    }
    try {
      setSavingNew(true); setFormError(null); setFieldErrors({})
      const nextOrder = categories.length > 0
        ? Math.max(...categories.map(c => c.display_order)) + 1
        : 0
      await createCategory(name, nextOrder, {
        seo_title: newSeoTitle.trim() || null,
        seo_description: newSeoDescription.trim() || null,
      })
      setNewName('')
      setNewSeoTitle('')
      setNewSeoDescription('')
      await refetch()
      flash(`"${name}" added successfully.`)
    } catch (err) {
      const msg = friendlyErrorMessage(err, 'Failed to add category. Check the required fields and try again.')
      setFormError(
        msg.includes('row-level security') || msg.includes('violates')
          ? 'Permission denied — run the SQL migration in Supabase to enable category management.'
          : msg
      )
    } finally {
      setSavingNew(false)
    }
  }

  async function handleUpdate(cat: DBCategory) {
    const name = editName.trim()
    if (!name) {
      setFieldErrors({ editName: 'Enter a category name.' })
      setFormError('Enter a category name before saving.')
      return
    }
    try {
      setSavingEdit(true); setFormError(null); setFieldErrors({})
      await updateCategory(cat.id, {
        name,
        seo_title: editSeoTitle.trim() || null,
        seo_description: editSeoDescription.trim() || null,
      })
      setEditId(null)
      await refetch()
      flash(`"${name}" updated successfully.`)
    } catch (err) {
      const msg = friendlyErrorMessage(err, 'Failed to update category. Check the required fields and try again.')
      setFormError(
        msg.includes('row-level security') || msg.includes('violates')
          ? 'Permission denied — run the SQL migration in Supabase to enable category management.'
          : msg
      )
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(cat: DBCategory) {
    if (!window.confirm(`Delete "${cat.name}"? Products in this category will become uncategorised.`)) return
    try {
      setFormError(null)
      await deleteCategory(cat.id)
      await refetch()
      flash(`"${cat.name}" deleted.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed'
      setFormError(msg)
    }
  }

  function startEdit(cat: DBCategory) {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditSeoTitle(cat.seo_title ?? '')
    setEditSeoDescription(cat.seo_description ?? '')
    setFormError(null)
    setFieldErrors({})
  }

  function cancelEdit() {
    setEditId(null)
    setEditName('')
    setEditSeoTitle('')
    setEditSeoDescription('')
    setFormError(null)
    setFieldErrors({})
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
  )

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

      {/* Status messages */}
      {success   && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-100">{success}</div>}
      {formError && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100 leading-snug">
          {formError}
          {formError.includes('migration') && (
            <div className="mt-2 font-mono text-xs bg-red-100 px-2 py-1 rounded">
              Run: supabase/migrations/001_fixes_and_analytics.sql in Supabase SQL Editor
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleCreate} className="grid gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm" noValidate>
        <input
          value={newName}
          onChange={e => { setNewName(e.target.value); setFormError(null); setFieldErrors(p => ({ ...p, newName: undefined })) }}
          placeholder="New category name…"
          className="min-w-0 flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          value={newSeoTitle}
          onChange={e => { setNewSeoTitle(e.target.value); setFormError(null) }}
          placeholder="SEO title (optional)"
          className={`min-w-0 flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${fieldErrors.newName ? 'border-red-300 bg-red-50/50 focus:ring-red-300' : 'border-gray-200 focus:ring-orange-400'}`}
        />
        {fieldErrors.newName && <p className="-mt-2 text-xs font-medium text-red-600">{fieldErrors.newName}</p>}
        <textarea
          value={newSeoDescription}
          onChange={e => { setNewSeoDescription(e.target.value); setFormError(null) }}
          placeholder="SEO description (optional)"
          rows={3}
          className="min-w-0 flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          disabled={savingNew}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto sm:justify-self-start"
        >
          {savingNew ? 'Adding…' : 'Add'}
        </button>
      </form>
      {!newName.trim() && (
        <p className="text-xs text-gray-400 -mt-3">Type a category name above, then click Add.</p>
      )}

      {/* Categories list */}
      <div className="w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {categories.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No categories yet. Add one above.
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="flex min-w-0 items-start gap-3 px-4 py-3 group">
              {editId === cat.id ? (
                <div className="grid flex-1 gap-3">
                  <input
                    value={editName}
                    onChange={e => { setEditName(e.target.value); setFieldErrors(p => ({ ...p, editName: undefined })) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat); if (e.key === 'Escape') cancelEdit() }}
                    className={`min-w-0 flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${fieldErrors.editName ? 'border-red-300 bg-red-50/50 focus:ring-red-300' : 'border-orange-300 focus:ring-orange-400'}`}
                    autoFocus
                  />
                  {fieldErrors.editName && <p className="-mt-2 text-xs font-medium text-red-600">{fieldErrors.editName}</p>}
                  <input
                    value={editSeoTitle}
                    onChange={e => setEditSeoTitle(e.target.value)}
                    placeholder="SEO title"
                    className="min-w-0 flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <textarea
                    value={editSeoDescription}
                    onChange={e => setEditSeoDescription(e.target.value)}
                    placeholder="SEO description"
                    rows={3}
                    className="min-w-0 flex-1 resize-none border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdate(cat)}
                    disabled={savingEdit}
                    className="text-sm text-orange-600 font-semibold hover:text-orange-700 disabled:opacity-50 shrink-0"
                  >
                    {savingEdit ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="text-sm text-gray-400 hover:text-gray-600 shrink-0">
                    Cancel
                  </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-gray-700 font-medium">{cat.name}</span>
                    {cat.seo_title && (
                      <span className="mt-1 block truncate text-xs text-gray-500">{cat.seo_title}</span>
                    )}
                    {cat.seo_description && (
                      <span className="mt-1 block line-clamp-2 text-xs text-gray-400">{cat.seo_description}</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(cat)}
                      title="Edit"
                      className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      title="Delete"
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
        <strong>Tip:</strong> Hover a row to reveal edit and delete buttons. Press <kbd className="bg-blue-100 px-1 rounded">Enter</kbd> to save an edit, <kbd className="bg-blue-100 px-1 rounded">Esc</kbd> to cancel.
      </div>
    </div>
  )
}

export default AdminCategories
