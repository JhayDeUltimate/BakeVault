import React, { useState } from 'react'
import { useCategories } from '@/hooks'
import { createCategory, updateCategory, deleteCategory } from '@/lib/api'
import type { DBCategory } from '@/lib/database.types'

export function AdminCategories() {
  const { categories, loading, error, refetch } = useCategories()
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editName,  setEditName]  = useState('')
  const [newName,   setNewName]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      setSaving(true); setFormError(null)
      await createCategory(newName.trim())
      setNewName(''); refetch()
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    try {
      setSaving(true)
      await updateCategory(id, { name: editName.trim() })
      setEditId(null); refetch()
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(cat: DBCategory) {
    if (!window.confirm(`Delete "${cat.name}"? Products in this category will become uncategorised.`)) return
    try { await deleteCategory(cat.id); refetch() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
  if (error)   return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

      {/* Add form */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button type="submit" disabled={saving || !newName.trim()} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
          Add
        </button>
      </form>
      {formError && <p className="text-sm text-red-600">{formError}</p>}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
            {editId === cat.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  autoFocus
                />
                <button onClick={() => handleUpdate(cat.id)} disabled={saving} className="text-sm text-orange-600 font-semibold hover:text-orange-700 disabled:opacity-50">Save</button>
                <button onClick={() => setEditId(null)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                <button onClick={() => { setEditId(cat.id); setEditName(cat.name) }} className="text-gray-400 hover:text-orange-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(cat)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">No categories yet.</div>}
      </div>
    </div>
  )
}
export default AdminCategories
