import type { DBProductWithCategory } from './database.types'
import type { Product }               from './types'
import { FALLBACK_IMAGE }             from './image'

export function mapDBProduct(p: DBProductWithCategory): Product {
  return {
    id:          p.id,
    name:        p.name,
    category:    p.categories?.name ?? 'Other Products',
    description: p.description ?? undefined,
    price:       p.price_type === 'retail' ? 'Retail' : 'Wholesale',
    image:       p.image_url ?? FALLBACK_IMAGE,
  }
}
