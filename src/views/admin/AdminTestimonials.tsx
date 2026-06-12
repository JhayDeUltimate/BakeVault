import React, { useEffect, useState } from 'react'
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/api'
import { friendlyErrorMessage } from '@/lib/error-messages'
import type { DBTestimonial } from '@/lib/database.types'

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<DBTestimonial[]>([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState<null | 'add' | DBTestimonial>(null)
  const [form,         setForm]         = useState({ customer_name: '', business_name: '', initials: '', quote: '', rating: 5, is_visible: true })
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [formErrors,   setFormErrors]   = useState<Partial<Record<'customer_name' | 'quote', string>>>({})
  const [activeTab,    setActiveTab]    = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    // Load ALL testimonials (visible and hidden) for admin review
    getTestimonials(false).then(setTestimonials).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  function openAdd()                   { setFormErrors({}); setError(null); setForm({ customer_name: '', business_name: '', initials: '', quote: '', rating: 5, is_visible: true }); setModal('add') }
  function openEdit(t: DBTestimonial)  { setFormErrors({}); setError(null); setForm({ customer_name: t.customer_name, business_name: t.business_name ?? '', initials: t.initials ?? '', quote: t.quote, rating: t.rating ?? 5, is_visible: t.is_visible }); setModal(t) }

  async function handleApprove(t: DBTestimonial) {
    try {
      setError(null)
      const updated = await updateTestimonial(t.id, { is_visible: true })
      setTestimonials(prev => prev.map(x => x.id === t.id ? updated : x))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Partial<Record<'customer_name' | 'quote', string>> = {}
    if (!form.customer_name.trim()) nextErrors.customer_name = 'Enter the customer name.'
    if (!form.quote.trim()) nextErrors.quote = 'Enter the review text.'
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      setError('Fix the highlighted fields before saving.')
      return
    }
    try {
      setSaving(true); setError(null); setFormErrors({})
      if (modal === 'add') {
        const created = await createTestimonial(form)
        setTestimonials(prev => [created, ...prev])
      } else if (modal && typeof modal === 'object') {
        const updated = await updateTestimonial(modal.id, form)
        setTestimonials(prev => prev.map(t => t.id === modal.id ? updated : t))
      }
      setModal(null)
    } catch (err) { setError(friendlyErrorMessage(err, 'Testimonial could not be saved. Check the required fields and try again.')) }
    finally { setSaving(false) }
  }

  async function handleDelete(t: DBTestimonial) {
    if (!window.confirm(`Delete testimonial from ${t.customer_name}?`)) return
    try {
      setError(null)
      await deleteTestimonial(t.id)
      setTestimonials(prev => prev.filter(x => x.id !== t.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function toggleVisible(t: DBTestimonial) {
    try {
      setError(null)
      const updated = await updateTestimonial(t.id, { is_visible: !t.is_visible })
      setTestimonials(prev => prev.map(x => x.id === t.id ? updated : x))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Visibility update failed')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>

  const pending  = testimonials.filter(t => !t.is_visible)
  const approved = testimonials.filter(t => t.is_visible)
  const displayed = activeTab === 'pending' ? pending : approved

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
          {pending.length > 0 && (
            <p className="text-sm text-orange-600 font-semibold mt-0.5">
              {pending.length} review{pending.length === 1 ? '' : 's'} awaiting approval
            </p>
          )}
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pending {pending.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">{pending.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'approved' ? 'bg-white shadow text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Approved ({approved.length})
        </button>
      </div>

      <div className="space-y-3">
        {displayed.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400">
            {activeTab === 'pending' ? 'No reviews pending approval.' : 'No approved testimonials yet.'}
          </div>
        )}
        {displayed.map(t => (
          <div key={t.id} className={`w-full min-w-0 overflow-hidden bg-white rounded-xl border shadow-sm p-5 ${!t.is_visible ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {!t.is_visible && (
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-2 py-0.5 rounded mb-2">
                    Awaiting Approval
                  </span>
                )}
                <p className="text-xs font-bold text-orange-500 mb-1">Rating: {Math.max(1, Math.min(5, t.rating ?? 5))}/5</p>
                <p className="text-sm text-gray-700 italic mb-2">"{t.quote}"</p>
                <p className="text-xs font-bold text-gray-800">{t.customer_name} · <span className="font-normal text-gray-500">{t.business_name}</span></p>
                <p className="text-xs text-gray-400 mt-1">{new Date(t.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {/* Approve button — shown only for pending reviews */}
                {!t.is_visible && (
                  <button
                    onClick={() => handleApprove(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    Approve
                  </button>
                )}
                {t.is_visible && (
                  <button onClick={() => toggleVisible(t)} title="Hide" className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  </button>
                )}
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">{modal === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              {([['customer_name','Customer Name *', 'e.g. Amaka O.'], ['business_name','Business Name','e.g. Lagos Pastries'], ['initials','Initials (auto if blank)','e.g. AO']] as const).map(([key, lbl, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{lbl}</label>
                  <input
                    value={form[key as keyof typeof form] as string}
                    onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); if (key === 'customer_name') setFormErrors(p => ({ ...p, customer_name: undefined })) }}
                    placeholder={ph}
                    maxLength={key === 'initials' ? 10 : 200}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${formErrors.customer_name && key === 'customer_name' ? 'border-red-300 bg-red-50/50 focus:ring-red-300' : 'border-gray-200 focus:ring-orange-400'}`}
                  />
                  {key === 'customer_name' && formErrors.customer_name && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.customer_name}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Quote *</label>
                <textarea
                  value={form.quote}
                  onChange={e => { setForm(p => ({ ...p, quote: e.target.value.slice(0, 5000) })); setFormErrors(p => ({ ...p, quote: undefined })) }}
                  rows={3}
                  maxLength={5000}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${formErrors.quote ? 'border-red-300 bg-red-50/50 focus:ring-red-300' : 'border-gray-200 focus:ring-orange-400'}`}
                />
                {formErrors.quote && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.quote}</p>}
                {form.quote.length > 4000 && <p className="mt-1 text-right text-xs text-gray-400">{5000 - form.quote.length} characters remaining</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Rating *</label>
                <select value={form.rating} onChange={e => setForm(p => ({ ...p, rating: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} star{v === 1 ? '' : 's'}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_visible} onChange={e => setForm(p => ({ ...p, is_visible: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-gray-700">Publish immediately (visible on storefront)</span>
                </label>
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
