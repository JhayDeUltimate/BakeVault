import React, { useState } from 'react'
import { useProductRequests } from '@/hooks'
import { updateProductRequestStatus } from '@/lib/api'
import type { DBProductRequest } from '@/lib/database.types'

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  reviewed:  'bg-blue-100  text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
}

export default function AdminProductRequests() {
  const { requests, loading, error, refetch } = useProductRequests()
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'fulfilled'>('all')
  const [mutationError, setMutationError] = useState<string | null>(null)

  async function handleStatus(req: DBProductRequest, status: 'pending' | 'reviewed' | 'fulfilled') {
    try {
      setMutationError(null)
      await updateProductRequestStatus(req.id, status)
      refetch()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Status update failed')
    }
  }

  const visible = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
  if (error) return (
    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
  )

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-6 pb-6">
      {mutationError && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {mutationError}
        </div>
      )}
      {/* Header + filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {requests.length} total · {requests.filter(r => r.status === 'pending').length} pending
          </p>
        </div>
        <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 scrollbar-hide flex-nowrap sm:w-auto sm:shrink-0">
          {(['all', 'pending', 'reviewed', 'fulfilled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize shrink-0 ${
                filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Request cards */}
      {visible.length === 0 ? (
        <div className="w-full min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm py-12 text-center text-sm text-gray-400">
          No requests {filter !== 'all' ? `with status "${filter}"` : 'yet'}.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(r => (
            <div key={r.id} className="w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">

                {/* Left: details */}
                <div className="min-w-0 flex-1">
                  {/* Status + date */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[r.status] ?? ''}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Product name */}
                  <p className="font-semibold text-gray-800 text-sm mb-1">{r.product_name}</p>

                  {/* Size + Qty row */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                    {r.product_size && (
                      <span>Size: <strong className="text-gray-700">{r.product_size}</strong></span>
                    )}
                    {r.quantity && (
                      <span>Qty: <strong className="text-gray-700">{r.quantity}</strong></span>
                    )}
                  </div>

                  {/* Notes */}
                  {r.notes && (
                    <p className="text-sm text-gray-600 italic mb-2">"{r.notes}"</p>
                  )}

                  {/* ── Contact info ── shown prominently so admin can follow up */}
                  {r.contact_info ? (
                    <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs font-semibold text-orange-700">
                        {r.contact_info}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-300 italic mt-1">No contact info provided</p>
                  )}
                </div>

                {/* Right: action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
                  {r.status !== 'reviewed' && (
                    <button onClick={() => handleStatus(r, 'reviewed')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors w-full sm:w-auto">
                      Mark Reviewed
                    </button>
                  )}
                  {r.status !== 'fulfilled' && (
                    <button onClick={() => handleStatus(r, 'fulfilled')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors w-full sm:w-auto">
                      Mark Fulfilled
                    </button>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => handleStatus(r, 'pending')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium transition-colors w-full sm:w-auto">
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
