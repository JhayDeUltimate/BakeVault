// ─────────────────────────────────────────────────────────────────────────────
// pages/admin/AdminTestimonials.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../lib/api'
import type { DBTestimonial } from '../../lib/database.types'

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<DBTestimonial[]>([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState<null | 'add' | DBTestimonial>(null)
  const [form,         setForm]         = useState({ customer_name: '', business_name: '', initials: '', quote: '', is_visible: true })
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    getTestimonials(false).then(setTestimonials).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  function openAdd()                   { setForm({ customer_name: '', business_name: '', initials: '', quote: '', is_visible: true }); setModal('add') }
  function openEdit(t: DBTestimonial)  { setForm({ customer_name: t.customer_name, business_name: t.business_name ?? '', initials: t.initials ?? '', quote: t.quote, is_visible: t.is_visible }); setModal(t) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim() || !form.quote.trim()) { setError('Name and quote are required.'); return }
    try {
      setSaving(true); setError(null)
      if (modal === 'add') {
        const created = await createTestimonial(form)
        setTestimonials(prev => [created, ...prev])
      } else if (modal && typeof modal === 'object') {
        const updated = await updateTestimonial(modal.id, form)
        setTestimonials(prev => prev.map(t => t.id === modal.id ? updated : t))
      }
      setModal(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(t: DBTestimonial) {
    if (!window.confirm(`Delete testimonial from ${t.customer_name}?`)) return
    await deleteTestimonial(t.id)
    setTestimonials(prev => prev.filter(x => x.id !== t.id))
  }

  async function toggleVisible(t: DBTestimonial) {
    const updated = await updateTestimonial(t.id, { is_visible: !t.is_visible })
    setTestimonials(prev => prev.map(x => x.id === t.id ? updated : x))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add
        </button>
      </div>

      <div className="space-y-3">
        {testimonials.map(t => (
          <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-5 ${t.is_visible ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700 italic mb-2">"{t.quote}"</p>
                <p className="text-xs font-bold text-gray-800">{t.customer_name} · <span className="font-normal text-gray-500">{t.business_name}</span></p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleVisible(t)} title={t.is_visible ? 'Hide' : 'Show'} className="text-gray-400 hover:text-orange-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={t.is_visible ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} /></svg>
                </button>
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-orange-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(t)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && <div className="text-center py-10 text-sm text-gray-400">No testimonials yet.</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">{modal === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              {[['customer_name','Customer Name *', 'e.g. Amaka O.'], ['business_name','Business Name','e.g. Lagos Pastries'], ['initials','Initials (auto if blank)','e.g. AO']].map(([key, lbl, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{lbl}</label>
                  <input value={form[key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Quote *</label>
                <textarea value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTestimonials
