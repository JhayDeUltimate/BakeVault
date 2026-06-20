import React, { useEffect, useState } from 'react'
import { updateEnquiryStatus, getEnquiriesPage, getEnquiriesCount } from '@/lib/api'
import type { DBEnquiry } from '@/lib/database.types'

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<DBEnquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [filter,    setFilter]    = useState<'all' | 'sent' | 'responded' | 'fulfilled'>('all')
  const [page, setPage] = useState<number>(1)
  const [pageSize] = useState<number>(25)
  const [total, setTotal] = useState<number>(0)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    const status = filter === 'all' ? undefined : filter
    getEnquiriesPage({ page, pageSize, status })
      .then(res => { setEnquiries(res.items); setTotal(res.total) })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load enquiries'))
      .finally(() => setLoading(false))
  }, [page, pageSize, filter])

  async function handleStatus(id: string, status: 'sent' | 'responded' | 'fulfilled') {
    try {
      setMutationError(null)
      await updateEnquiryStatus(id, status)
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Status update failed')
    }
  }

  const visible = enquiries

  const badge: Record<string, string> = {
    sent:      'bg-yellow-100 text-yellow-700',
    responded: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
  if (error)   return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-6 pb-6">
      {mutationError && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {mutationError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries <span className="text-base font-normal text-gray-400">({total})</span></h1>
        <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 scrollbar-hide flex-nowrap sm:w-auto">
          {(['all','sent','responded','fulfilled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize shrink-0 ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map(e => {
          const items = (e.items as Array<{ product_name: string; quantity: number }>) ?? []
          return (
            <div key={e.id} className="w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${badge[e.status]}`}>{e.status}</span>
                    <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-0.5">
                    {items.map((item, i) => <li key={i}>• {item.product_name} × {item.quantity}</li>)}
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
                  {e.status !== 'responded' && <button onClick={() => handleStatus(e.id, 'responded')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors w-full sm:w-auto">Mark Responded</button>}
                  {e.status !== 'fulfilled' && <button onClick={() => handleStatus(e.id, 'fulfilled')} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors w-full sm:w-auto">Mark Fulfilled</button>}
                </div>
              </div>
            </div>
          )
        })}
        {visible.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No enquiries in this status.</div>}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex sm:items-center">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Prev</button>
          <div className="text-sm text-gray-500">Page {page}</div>
          <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>
      </div>
  )
}

export default AdminEnquiries
