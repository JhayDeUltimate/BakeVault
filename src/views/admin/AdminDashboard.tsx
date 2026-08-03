import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import {
  getCategoriesCount, getProductsCount, getEnquiriesPage, getEnquiriesCount,
  getAnalyticsSummary, getAnalyticsRawEvents,
  type AnalyticsChartPoint, type TopProduct,
} from '@/lib/api'
import type { DBEnquiry } from '@/lib/database.types'

interface Stats {
  totalProducts: number
  availableProducts: number
  totalCategories: number
  totalEnquiries: number
  enquiriesThisWeek: number
  enquiriesOpen: number
}

type DateRange = 7 | 14 | 30

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<DBEnquiry[]>([])
  const [chartData, setChartData] = useState<AnalyticsChartPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [dateRange, setDateRange] = useState<DateRange>(7)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [csvError, setCsvError] = useState<string | null>(null)

  // Load core stats (use server-side counts + paginated recent enquiries)
  useEffect(() => {
    async function load() {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const [totalProducts, availableProducts, totalCategories, enquiriesPage, enquiriesThisWeek, enquiriesOpen] = await Promise.all([
          getProductsCount({ includeUnavailable: true }),
          getProductsCount({ includeUnavailable: false }),
          getCategoriesCount(),
          getEnquiriesPage({ page: 1, pageSize: 5 }),
          getEnquiriesCount({ since: weekAgo }),
          getEnquiriesCount({ status: 'sent' }),
        ])

        setStats({
          totalProducts,
          availableProducts,
          totalCategories,
          totalEnquiries: enquiriesPage.total,
          enquiriesThisWeek,
          enquiriesOpen,
        })
        setRecent(enquiriesPage.items)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load analytics (re-fetches when dateRange changes)
  useEffect(() => {
    async function loadAnalytics() {
      try {
        setAnalyticsLoading(true); setAnalyticsError(null)
        const { chart, topProducts: top, totals: t } = await getAnalyticsSummary(dateRange)
        setChartData(chart)
        setTopProducts(top)
        setTotals(t)
      } catch (e) {
        setAnalyticsError(e instanceof Error ? e.message : 'Analytics unavailable')
      } finally {
        setAnalyticsLoading(false)
      }
    }
    loadAnalytics()
  }, [dateRange])

  async function downloadCSV() {
    try {
      setDownloading(true)
      setCsvError(null)
      const events = await getAnalyticsRawEvents(dateRange)
      const rows = [
        ['id', 'event_type', 'session_id', 'page', 'product_name', 'category', 'created_at'],
        ...events.map(e => {
          const d = (e.event_data ?? {}) as Record<string, string>
          return [e.id, e.event_type, e.session_id ?? '', e.page ?? '', d.product_name ?? '', d.category ?? '', e.created_at]
        }),
      ]
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bakevault-analytics-${dateRange}d-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setCsvError('CSV download failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  const statCards = [
    { label: 'Total Products', value: stats!.totalProducts, sub: `${stats!.availableProducts} available`, color: 'text-orange-600' },
    { label: 'Categories', value: stats!.totalCategories, sub: 'product categories', color: 'text-blue-600' },
    { label: 'Total Enquiries', value: stats!.totalEnquiries, sub: `${stats!.enquiriesThisWeek} this week`, color: 'text-green-600' },
    { label: 'Pending Enquiries', value: stats!.enquiriesOpen, sub: 'awaiting response', color: 'text-yellow-600' },
  ]

  const analyticsCards = [
    { label: 'Page Views', value: totals['page_view'] ?? 0, color: 'text-blue-600' },
    { label: 'Product Views', value: totals['product_view'] ?? 0, color: 'text-purple-600' },
    { label: 'Add to Cart', value: totals['add_to_cart'] ?? 0, color: 'text-orange-600' },
    { label: 'Checkouts', value: totals['cart_checkout'] ?? 0, color: 'text-green-600' },
  ]

  const statusColor: Record<string, string> = {
    sent: 'bg-yellow-100 text-yellow-700',
    responded: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
  }

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-8 pb-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Store overview and storefront analytics</p>
      </div>

      {/* Store stat cards */}
      <div className="grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className={`text-3xl font-bold mb-1 ${c.color}`}>{c.value}</div>
            <div className="text-sm font-semibold text-gray-700">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Analytics section ─────────────────────────────────── */}
      <div className="w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Analytics header */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-gray-800">Storefront Analytics</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Client-side events from the public store only
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Date range pills */}
            <div className="flex gap-1">
              {([7, 14, 30] as DateRange[]).map(d => (
                <button key={d} onClick={() => setDateRange(d)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${dateRange === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                  {d}d
                </button>
              ))}
            </div>
            <button onClick={downloadCSV} disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Downloading…' : 'Export CSV'}
            </button>
            {csvError && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100 flex items-center justify-between">
                <span>{csvError}</span>
                <button onClick={() => setCsvError(null)} className="ml-3 text-red-400 hover:text-red-600" aria-label="Dismiss error">×</button>
              </div>
            )}
          </div>
        </div>

        {analyticsError ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">{analyticsError}</p>
            <p className="text-xs text-gray-300 mt-1">Run the SQL migration to enable analytics tracking.</p>
          </div>
        ) : analyticsLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Analytics summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-gray-100">
              {analyticsCards.map(c => (
                <div key={c.label} className="px-6 py-4 border-r border-gray-100 last:border-r-0">
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
                  <div className="text-[10px] text-gray-400">last {dateRange} days</div>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div className="px-4 pt-6 pb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 px-2">
                Storefront Activity Over Time
              </h3>
              {chartData.every(d => d.page_views === 0 && d.add_to_cart === 0) ? (
                <div className="flex items-center justify-center h-40 text-sm text-gray-300">
                  No events recorded yet in this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 180 : 240}>
                  <LineChart data={chartData} margin={{ top: 0, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      labelStyle={{ fontWeight: 700, color: '#374151' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="page_views" name="Page Views" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="product_views" name="Product Views" stroke="#a855f7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="add_to_cart" name="Add to Cart" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="checkouts" name="Checkouts" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top products */}
            {topProducts.length > 0 && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Most Added to Cart
                </h3>
                <div className="space-y-2">
                  {topProducts.map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-bold text-gray-400 shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate">{p.product_name}</p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        {p.count}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent enquiries */}
      <div className="w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="text-sm text-orange-500 hover:text-orange-600">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">No enquiries yet.</div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-50">
              {recent.map(e => {
                const items = (e.items as Array<{ product_name: string; quantity: number }>) ?? []
                return (
                  <div key={e.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[e.status] ?? ''}`}>{e.status}</span>
                      <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {items.slice(0, 2).map(i => `${i.product_name} ×${i.quantity}`).join(', ')}
                      {items.length > 2 && ` +${items.length - 2} more`}
                    </p>
                  </div>
                )
              })}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
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
            </div>
          </>
        )}
      </div>

    </div>
  )
}
