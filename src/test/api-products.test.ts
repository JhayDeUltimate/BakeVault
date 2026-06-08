import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProduct, getNextProductDisplayOrder } from '@/lib/api'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
    storage: { from: vi.fn() },
  },
}))

vi.mock('@/lib/admin-activity', () => ({
  logAdminActivity: vi.fn(),
}))

const mockedFrom = vi.mocked(supabase.from)

function nextOrderBuilder(displayOrder: number | null) {
  return {
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({
            data: displayOrder === null ? null : { display_order: displayOrder },
            error: null,
          })),
        })),
      })),
    })),
  }
}

function insertProductBuilder() {
  const insert = vi.fn((payload) => ({
    select: vi.fn(() => ({
      single: vi.fn(async () => ({
        data: {
          id: 'product-1',
          ...payload,
          created_at: '',
          updated_at: '',
          categories: null,
        },
        error: null,
      })),
    })),
  }))

  return { builder: { insert }, insert }
}

describe('product display order', () => {
  beforeEach(() => {
    mockedFrom.mockReset()
  })

  it('uses the next number after the highest product display order', async () => {
    mockedFrom.mockReturnValueOnce(nextOrderBuilder(7) as never)

    await expect(getNextProductDisplayOrder()).resolves.toBe(8)
  })

  it('starts at zero when no products exist', async () => {
    mockedFrom.mockReturnValueOnce(nextOrderBuilder(null) as never)

    await expect(getNextProductDisplayOrder()).resolves.toBe(0)
  })

  it('fills display_order on product creation when no explicit order is supplied', async () => {
    const insert = insertProductBuilder()
    mockedFrom
      .mockReturnValueOnce(nextOrderBuilder(4) as never)
      .mockReturnValueOnce(insert.builder as never)

    await createProduct({ name: 'Fresh Yeast', image_url: 'https://example.com/yeast.jpg' })

    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Fresh Yeast',
      slug: 'fresh-yeast',
      display_order: 5,
    }))
  })
})
