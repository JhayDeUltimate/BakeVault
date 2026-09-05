import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProducts } from '@/hooks/useProducts'
import { getProducts } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  getProducts: vi.fn(),
}))

const mockedGetProducts = vi.mocked(getProducts)

type UseProductsTestProps = {
  featuredOnly?: boolean | undefined
  includeUnavailable?: boolean | undefined
}

describe('useProducts', () => {
  beforeEach(() => {
    mockedGetProducts.mockReset()
    mockedGetProducts.mockResolvedValue([])
  })

  it('normalizes falsy boolean options before comparing dependencies', async () => {
    const initialProps: UseProductsTestProps = { featuredOnly: false, includeUnavailable: false }

    const { rerender } = renderHook(
      (props: UseProductsTestProps) => useProducts(props),
      { initialProps }
    )

    await waitFor(() => expect(mockedGetProducts).toHaveBeenCalledTimes(1))

    rerender({ featuredOnly: undefined, includeUnavailable: undefined })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockedGetProducts).toHaveBeenCalledTimes(1)
    expect(mockedGetProducts).toHaveBeenLastCalledWith({
      categoryId: null,
      search: undefined,
      featuredOnly: false,
      includeDescription: false,
      includeUnavailable: false,
      limit: undefined,
      refetchOnFocus: false,
    })
  })
})
