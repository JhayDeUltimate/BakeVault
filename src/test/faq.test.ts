import { describe, expect, it } from 'vitest'
import { mapDBFAQs } from '@/lib/faq'
import type { DBFAQCategoryWithItems } from '@/lib/database.types'

describe('mapDBFAQs', () => {
  it('preserves category and item display ordering', () => {
    const rows = [
      {
        id: 'cat-2',
        title: 'Second',
        icon: 'M0 0',
        display_order: 20,
        is_visible: true,
        created_at: '',
        updated_at: '',
        faq_items: [
          { id: 'item-2', category_id: 'cat-2', question: 'B', answer: 'B', display_order: 2, is_visible: true, created_at: '', updated_at: '' },
          { id: 'item-1', category_id: 'cat-2', question: 'A', answer: 'A', display_order: 1, is_visible: true, created_at: '', updated_at: '' },
        ],
      },
      {
        id: 'cat-1',
        title: 'First',
        icon: 'M0 0',
        display_order: 10,
        is_visible: true,
        created_at: '',
        updated_at: '',
        faq_items: [],
      },
    ] satisfies DBFAQCategoryWithItems[]

    const mapped = mapDBFAQs(rows)

    expect(mapped.map(category => category.title)).toEqual(['First', 'Second'])
    expect(mapped[1].items.map(item => item.question)).toEqual(['A', 'B'])
  })
})
