import React, { useState, useEffect, useRef } from 'react'
import { createProduct, updateProduct, deleteProduct, deleteProductImage, getProductsPage, getProductsCount } from '../../lib/api'
import ProductForm, { type ProductFormData } from '../../components/admin/ProductForm'
import type { DBProductWithCategory } from '../../lib/database.types'

type Modal = { mode: 'add' } | { mode: 'edit'; product: DBProductWithCategory } | null
type SortKey = 'name' | 'category' | 'updated_at' | 'created_at' | 'is_available' | 'is_featured'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name (A–Z)' },
  { key: 'category', label: 'Category' },
  { key: 'is_available', label: 'Available' },
  { key: 'is_featured', label: 'Hero' },
  { key: 'updated_at', label: 'Last Updated' },
  { key: 'created_at', label: 'Date Added' },
]

export default function AdminProducts() {
  const [products, setProducts] = useState<DBProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [availableCount, setAvailableCount] = useState<number | null>(null)
  const [page, setPage] = useState<number>(1)
  const [pageSize] = useState<number>(20)
  const [modal, setModal] = useState<Modal>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  // Debounce search: only update the query value 350ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // reset to page 1 on new search
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'updated_at' || key === 'created_at' ? 'desc' : 'asc')
    }
  }

  // All sorting is now server-side -- no client-side re-sorting needed
  const sorted = products

  // Fetch page
  async function fetchPage() {
    setLoading(true); setError(null)
    try {
      const res = await getProductsPage({ page, pageSize, search: debouncedSearch || undefined, includeUnavailable: true, sortKey, sortDir })
      setProducts(res.items)
      setTotal(res.total)
      try {
        const available = await getProductsCount({ includeUnavailable: false })
        setAvailableCount(available)
      } catch { }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Initial + dependency-driven fetch
  useEffect(() => {
    fetchPage().finally(() => { if (initialLoad) setInitialLoad(false) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, sortKey, sortDir])

  // refetch helper used by mutations
  const refetch = fetchPage

  async function handleSave(data: ProductFormData) {
    if (modal?.mode === 'add') await createProduct(data)
    if (modal?.mode === 'edit') await updateProduct(modal.product.id, data)
    setModal(null); refetch()
  }

  async function handleDelete(product: DBProductWithCategory) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      setSaving(product.id)
      setDeleteError(null)
      const rawUrls = Array.isArray(product.image_urls) ? product.image_urls : []
      const urls = [
        ...rawUrls.filter((u): u is string => typeof u === 'string'),
        ...(product.image_url && !rawUrls.includes(product.image_url) ? [product.image_url] : []),
      ]
      await Promise.all(urls.map(u => deleteProductImage(u)))
      await deleteProduct(product.id)
      refetch()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  async function toggleAvailable(product: DBProductWithCategory) {
    if (toggling === product.id) return
    try {
      setToggling(product.id)
      setDeleteError(null)
      await updateProduct(product.id, { is_available: !product.is_available })
      refetch()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Toggle failed')
    } finally {
      setToggling(null)
    }
  }

  if (initialLoad && loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">
            {total} total · {availableCount !== null ? `${availableCount} available` : '— available'}
          </p>
        </div>
        <button onClick={() => setModal({ mode: 'add' })}
          className="flex w-full items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Inline delete error */}
      {deleteError && (
        <div className="flex items-center justify-between bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-4 text-red-400 hover:text-red-600 transition-colors shrink-0"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search + Sort controls row */}
      <div className="w-full max-w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
            {!initialLoad && loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide shrink-0">Sort by:</span>
          <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 -mb-1 scrollbar-hide">
            {SORT_OPTIONS.map(opt => {
              const isActive = sortKey === opt.key
              const arrow = isActive ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
              return (
                <button key={opt.key} type="button" onClick={() => handleSort(opt.key)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${isActive
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                    }`}>
                  {opt.label}{arrow}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {sorted.map(p => (
          <div key={p.id} className="w-full min-w-0 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex gap-3">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                : <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">IMG</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.categories?.name ?? '—'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => toggleAvailable(p)} disabled={toggling === p.id}
                    className={`relative w-9 h-5 rounded-full transition-colors ${toggling === p.id ? 'opacity-50' : ''} ${p.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.is_available ? 'translate-x-4' : ''}`} />
                  </button>
                  <span className="text-xs text-gray-400">{p.is_available ? 'Available' : 'Hidden'}</span>
                  {p.is_featured && <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Hero</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => setModal({ mode: 'edit', product: p })}
                  className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(p)} disabled={saving === p.id}
                  className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-50">
                  {saving === p.id ? (
                    <div className="w-4 h-4 border-2 border-red-200 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400 bg-white rounded-xl border border-gray-100">
            {search ? 'No products match that search.' : 'No products yet — add one!'}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Available</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Hero</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 text-xs shrink-0 font-bold">IMG</div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                        {Array.isArray(p.image_urls) && (p.image_urls as string[]).length > 1 && (
                          <p className="text-[10px] text-gray-400">{(p.image_urls as string[]).length} photos</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.categories?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailable(p)}
                      disabled={toggling === p.id}
                      aria-label={p.is_available ? 'Mark unavailable' : 'Mark available'}
                      className={`relative w-9 h-5 rounded-full transition-colors ${toggling === p.id ? 'opacity-50 cursor-not-allowed' : ''
                        } ${p.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.is_available ? 'translate-x-4' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Hero</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(p.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal({ mode: 'edit', product: p })}
                        className="text-gray-400 hover:text-orange-500 transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(p)} disabled={saving === p.id}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40" title="Delete">
                        {saving === p.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            {search ? 'No products match that search.' : 'No products yet — add one!'}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex sm:items-center">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Prev</button>
          <div className="text-sm text-gray-500">Page {page}</div>
          <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">
                {modal.mode === 'add' ? 'Add Product' : `Edit — ${modal.product.name}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <ProductForm
                key={modal.mode === 'edit' ? modal.product.id : '__new__'}
                initial={modal.mode === 'edit' ? modal.product : null}
                nextDisplayOrder={total}
                onSave={handleSave}
                onCancel={() => setModal(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
