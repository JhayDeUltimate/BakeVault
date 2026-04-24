import React, { useMemo, useState } from 'react'
import { useProducts } from '../../hooks/index'
import { createProduct, updateProduct, deleteProduct, deleteProductImage } from '../../lib/api'
import ProductForm, { type ProductFormData } from '../../components/admin/ProductForm'
import type { DBProductWithCategory } from '../../lib/database.types'

type Modal   = { mode: 'add' } | { mode: 'edit'; product: DBProductWithCategory } | null
type SortKey = 'name' | 'category' | 'updated_at' | 'created_at' | 'is_available' | 'is_featured'
type SortDir = 'asc' | 'desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name',         label: 'Name (A–Z)'   },
  { key: 'category',     label: 'Category'     },
  { key: 'is_available', label: 'Available'    },
  { key: 'is_featured',  label: 'Hero'         },
  { key: 'updated_at',   label: 'Last Updated' },
  { key: 'created_at',   label: 'Date Added'   },
]

export default function AdminProducts() {
  const { products, loading, error, refetch } = useProducts({ includeUnavailable: true })
  const [modal,      setModal]    = useState<Modal>(null)
  const [search,     setSearch]   = useState('')
  const [saving,     setSaving]   = useState<string | null>(null)
  const [sortKey,    setSortKey]  = useState<SortKey>('name')
  const [sortDir,    setSortDir]  = useState<SortDir>('asc')
  const [deleteError,setDeleteError] = useState<string | null>(null)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'updated_at' || key === 'created_at' ? 'desc' : 'asc')
    }
  }

  const sorted = useMemo(() => {
    const base = search.trim()
      ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : [...products]

    return base.sort((a, b) => {
      let va: string | number = '', vb: string | number = ''
      switch (sortKey) {
        case 'name':         va = a.name.toLowerCase();                     vb = b.name.toLowerCase();                     break
        case 'category':     va = (a.categories?.name ?? '').toLowerCase(); vb = (b.categories?.name ?? '').toLowerCase(); break
        case 'updated_at':   va = a.updated_at;                             vb = b.updated_at;                             break
        case 'created_at':   va = a.created_at;                             vb = b.created_at;                             break
        case 'is_available': va = a.is_available ? 1 : 0;                   vb = b.is_available ? 1 : 0;                   break
        case 'is_featured':  va = a.is_featured  ? 1 : 0;                   vb = b.is_featured  ? 1 : 0;                   break
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [products, search, sortKey, sortDir])

  async function handleSave(data: ProductFormData) {
    if (modal?.mode === 'add')  await createProduct(data)
    if (modal?.mode === 'edit') await updateProduct(modal.product.id, data)
    setModal(null); refetch()
  }

  async function handleDelete(product: DBProductWithCategory) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      setSaving(product.id)
      setDeleteError(null)
      const urls = Array.isArray(product.image_urls)
        ? product.image_urls as string[]
        : product.image_url ? [product.image_url] : []
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
    await updateProduct(product.id, { is_available: !product.is_available })
    refetch()
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">
            {products.length} total · {products.filter(p => p.is_available).length} available
          </p>
        </div>
        <button onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors">
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide shrink-0">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(opt => {
              const isActive = sortKey === opt.key
              const arrow = isActive ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
              return (
                <button key={opt.key} type="button" onClick={() => handleSort(opt.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    isActive
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                      aria-label={p.is_available ? 'Mark unavailable' : 'Mark available'}
                      className={`relative w-9 h-5 rounded-full transition-colors ${p.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
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

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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