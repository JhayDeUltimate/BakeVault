import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProductForm, { type ProductFormData } from '@/components/admin/ProductForm'
import { createProduct, getProductById, getProductsCount, updateProduct } from '@/lib/api'
import type { DBProductWithCategory } from '@/lib/database.types'

export default function AdminProductEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [product, setProduct] = useState<DBProductWithCategory | null>(null)
  const [nextDisplayOrder, setNextDisplayOrder] = useState(0)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        if (id) {
          const data = await getProductById(id)
          if (!cancelled) setProduct(data)
        } else {
          const count = await getProductsCount({ includeUnavailable: true })
          if (!cancelled) setNextDisplayOrder(count)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  async function handleSave(data: ProductFormData) {
    if (id) {
      await updateProduct(id, data)
    } else {
      await createProduct(data)
    }
    navigate('/admin/products')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className="text-sm font-semibold text-orange-600 hover:text-orange-700"
      >
        Back to products
      </button>
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="mb-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Back to products
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? `Edit - ${product?.name ?? 'Product'}` : 'Add Product'}
          </h1>
          <p className="text-sm text-gray-500">
            Edit each storefront product section manually or use AI Analyze as a starting point.
          </p>
        </div>
      </div>

      <ProductForm
        key={id ?? '__new__'}
        initial={product}
        nextDisplayOrder={nextDisplayOrder}
        onSave={handleSave}
        onCancel={() => navigate('/admin/products')}
      />
    </div>
  )
}
