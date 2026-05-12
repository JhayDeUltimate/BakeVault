import React, { useEffect, useMemo, useState } from 'react'
import { getAdminActivityLogs } from '@/lib/api'
import type { DBAdminActivity } from '@/lib/database.types'
import SectionHeading from '@/components/ui/SectionHeading'

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<DBAdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    getAdminActivityLogs({ limit: 200 })
      .then(data => { if (mounted) setLogs(data) })
      .catch(e => { if (mounted) setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

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

  return (
    <div className="space-y-6 max-w-7xl">
      <SectionHeading eyebrow="Admin" title="Activity Log" description="Recent admin actions. Records are immutable and include admin id/email, action, resource, and details." />

      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by action, admin email, resource..."
              className="px-4 py-2 border border-gray-200 rounded-lg w-96 text-sm" />
            <div className="text-sm text-gray-500">Showing {filtered.length} of {logs.length}</div>
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
