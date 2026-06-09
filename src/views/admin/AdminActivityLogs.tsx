import React, { useEffect, useMemo, useState } from 'react'
import { getAdminActivityLogsPage } from '@/lib/api'
import type { DBAdminActivity } from '@/lib/database.types'
import SectionHeading from '@/components/ui/SectionHeading'

const PAGE_SIZE = 50

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<DBAdminActivity[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    getAdminActivityLogsPage({ page, pageSize: PAGE_SIZE })
      .then(data => {
        if (!mounted) return
        setLogs(data.items)
        setTotal(data.total)
      })
      .catch(e => { if (mounted) setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [page])

  const filtered = useMemo(() => {
    if (!filter.trim()) return logs
    const q = filter.toLowerCase()
    return logs.filter(l => (
      (l.admin_email ?? '').toLowerCase().includes(q) ||
      (l.action ?? '').toLowerCase().includes(q) ||
      (l.resource_type ?? '').toLowerCase().includes(q) ||
      (l.resource_id ?? '').toLowerCase().includes(q) ||
      JSON.stringify(l.details ?? {}).toLowerCase().includes(q)
    ))
  }, [logs, filter])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const visiblePage = Math.min(page, pageCount)
  const pageStart = total === 0 ? 0 : (visiblePage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(visiblePage * PAGE_SIZE, total)

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 pb-6">
      <SectionHeading eyebrow="Admin" title="Activity Log" description="Recent admin actions. Records are immutable and include admin id/email, action, resource, and details." />

      <div className="w-full min-w-0 overflow-hidden bg-white border border-gray-100 rounded-xl p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by action, admin email, resource..."
              className="w-full min-w-0 px-4 py-2 border border-gray-200 rounded-lg text-sm sm:w-96" />
            <div className="shrink-0 text-sm text-gray-500">
              Showing {filter.trim() ? `${filtered.length} matching on this page` : `${pageStart}-${pageEnd} of ${total}`}
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={visiblePage === 1 || loading}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-sm text-gray-500">Page {visiblePage} of {pageCount}</div>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
              disabled={visiblePage >= pageCount || loading}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">When</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Admin</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Resource</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.admin_email ?? row.admin_id ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.resource_type ?? '—'} {row.resource_id ? <span className="text-xs text-gray-400">#{row.resource_id}</span> : null}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <pre className="whitespace-pre-wrap max-h-32 overflow-auto text-[12px]">{JSON.stringify(row.details ?? {}, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
