import React, { useEffect, useState } from 'react'
import { getProducts, getCategories, getEnquiries } from '@/lib/api'
import type { DBEnquiry } from '@/lib/database.types'

interface Stats {
  totalProducts:    number
  availableProducts:number
  totalCategories:  number
  totalEnquiries:   number
  enquiriesThisWeek:number
  enquiriesOpen:    number
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [recent,  setRecent]  = useState<DBEnquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [allProducts, categories, enquiries] = await Promise.all([
          getProducts({ includeUnavailable: true }),
          getCategories(),
          getEnquiries(),
        ])

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        setStats({
          totalProducts:     allProducts.length,
          availableProducts: allProducts.filter(p => p.is_available).length,
          totalCategories:   categories.length,
          totalEnquiries:    enquiries.length,
          enquiriesThisWeek: enquiries.filter(e => new Date(e.created_at) > weekAgo).length,
          enquiriesOpen:     enquiries.filter(e => e.status === 'sent').length,
        })
        setRecent(enquiries.slice(0, 5))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
  if (error)   return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  const cards = [
    { label: 'Total Products',     value: stats!.totalProducts,     sub: `${stats!.availableProducts} available`, color: 'bg-orange-50 text-orange-600' },
    { label: 'Categories',         value: stats!.totalCategories,   sub: 'product categories',                   color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Enquiries',    value: stats!.totalEnquiries,    sub: `${stats!.enquiriesThisWeek} this week`, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Enquiries',  value: stats!.enquiriesOpen,     sub: 'awaiting response',                    color: 'bg-yellow-50 text-yellow-600' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className={`text-3xl font-bold mb-1 ${c.color.split(' ')[1]}`}>{c.value}</div>
            <div className="text-sm font-semibold text-gray-700">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Enquiries</h2>
          <a href="/admin/enquiries" className="text-sm text-orange-500 hover:text-orange-600">View all →</a>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">No enquiries yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(e => {
                const items = (e.items as Array<{ product_name: string; quantity: number }>) ?? []
                const statusColor: Record<string, string> = {
                  sent:      'bg-yellow-100 text-yellow-700',
                  responded: 'bg-blue-100 text-blue-700',
                  fulfilled: 'bg-green-100 text-green-700',
                }
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-700">
                      {items.slice(0, 2).map(i => `${i.product_name} ×${i.quantity}`).join(', ')}
                      {items.length > 2 && ` +${items.length - 2} more`}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[e.status] ?? ''}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}