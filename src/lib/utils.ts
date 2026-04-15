import type { DBProductWithCategory } from './database.types'
import type { Product, Category } from './types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200'

export function mapDBProduct(p: DBProductWithCategory): Product {
  return {
    id:          p.id,
    name:        p.name,
    category:    (p.categories?.name ?? 'Other Products') as Category,
    description: p.description ?? undefined,
    price:       p.price_type === 'retail' ? 'Retail' : 'Wholesale',
    image:       p.image_url ?? FALLBACK_IMAGE,
  }
}