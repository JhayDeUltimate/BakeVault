import { useCategories } from '@/hooks'
import { createProduct } from '@/lib/api'
import type { DBProductWithCategory } from '@/lib/database.types'

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<DBEnquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [filter,    setFilter]    = useState<'all' | 'sent' | 'responded' | 'fulfilled'>('all')

  useEffect(() => {
    getEnquiries().then(setEnquiries).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function handleStatus(id: string, status: 'sent' | 'responded' | 'fulfilled') {
    await updateEnquiryStatus(id, status)
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  const visible = filter === 'all' ? enquiries : enquiries.filter(e => e.status === filter)

  const badge: Record<string, string> = {
    sent:      'bg-yellow-100 text-yellow-700',
    responded: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
  if (error)   return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries <span className="text-base font-normal text-gray-400">({enquiries.length})</span></h1>
        <div className="flex gap-2 flex-wrap">
          {(['all','sent','responded','fulfilled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map(e => {
          const items = (e.items as Array<{ product_name: string; quantity: number }>) ?? []
          return (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
                <div className="flex gap-2 shrink-0">
                  {e.status !== 'responded' && <button onClick={() => handleStatus(e.id, 'responded')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">Mark Responded</button>}
                  {e.status !== 'fulfilled' && <button onClick={() => handleStatus(e.id, 'fulfilled')} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors">Mark Fulfilled</button>}
                </div>
              </div>
            </div>
          )
        })}
        {visible.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No enquiries in this status.</div>}
      </div>
    </div>
  )
}

export default AdminEnquiries
