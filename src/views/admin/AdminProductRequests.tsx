import React, { useState } from 'react'
import { useProductRequests } from '@/hooks'
import { updateProductRequestStatus } from '@/lib/api'
import type { DBProductRequest } from '@/lib/database.types'

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  reviewed:  'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
}

export default function AdminProductRequests() {
  const { requests, loading, error, refetch } = useProductRequests()
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'fulfilled'>('all')

  async function handleStatus(req: DBProductRequest, status: 'pending' | 'reviewed' | 'fulfilled') {
    await updateProductRequestStatus(req.id, status)
    refetch()
  }

  const visible = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
  if (error)   return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Requests</h1>
          <p className="text-sm text-gray-500">{requests.length} total · {requests.filter(r => r.status === 'pending').length} pending</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'reviewed', 'fulfilled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-12 text-center text-sm text-gray-400">
          No requests {filter !== 'all' ? `with status "${filter}"` : 'yet'}.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[r.status] ?? ''}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{r.product_name}</p>
                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">
                    {r.product_size && <span>Size: <strong className="text-gray-700">{r.product_size}</strong></span>}
                    {r.quantity      && <span>Qty: <strong className="text-gray-700">{r.quantity}</strong></span>}
                  </div>
                  {r.notes && <p className="mt-2 text-sm text-gray-600 italic">"{r.notes}"</p>}
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap">
                  {r.status !== 'reviewed' && (
                    <button onClick={() => handleStatus(r, 'reviewed')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
                      Mark Reviewed
                    </button>
                  )}
                  {r.status !== 'fulfilled' && (
                    <button onClick={() => handleStatus(r, 'fulfilled')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors">
                      Mark Fulfilled
                    </button>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => handleStatus(r, 'pending')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}