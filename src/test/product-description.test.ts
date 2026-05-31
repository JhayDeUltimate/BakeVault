import { describe, expect, it } from 'vitest'
import { normalizeProductDescription, parseProductDescription } from '@/lib/product-description'

describe('normalizeProductDescription', () => {
  it('accepts AI-style descriptions', () => {
    const result = normalizeProductDescription(`Premium cocoa powder for rich bakery recipes.

Key Features:
• Deep chocolate flavour
• Blends easily into batters`)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toContain('Key Features:')
      expect(result.value).toContain('• Deep chocolate flavour')
    }
  })

  it('normalizes hyphen bullets to storefront bullets', () => {
    const result = normalizeProductDescription(`Reliable baking powder for everyday production.

Key Features:
- Consistent rise
- Works for cakes and pastries`)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe(`Reliable baking powder for everyday production.

Key Features:
• Consistent rise
• Works for cakes and pastries`)
    }
  })

  it('keeps richer product detail sections after key features', () => {
    const result = normalizeProductDescription(`Starter culture for homemade probiotic yogurt.

Key Features:
- Contains live cultures
- Suitable for dairy yogurt

Product Details:
- Sachet format
- Used for milk fermentation

Best For:
- Home yogurt makers
- Small dairy businesses`)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toContain('Product Details:')
      expect(result.value).toContain('• Sachet format')
      expect(result.value).toContain('Best For:')
    }
  })

  it('rejects missing summary text', () => {
    const result = normalizeProductDescription(`Key Features:
• One
• Two`)

    expect(result).toEqual({
      ok: false,
      error: 'Add a short summary line, then a "Key Features:" heading.',
    })
  })

  it('rejects missing key features heading', () => {
    const result = normalizeProductDescription('Just a freeform paragraph.')

    expect(result.ok).toBe(false)
  })

  it('rejects too few or too many feature bullets', () => {
    expect(normalizeProductDescription(`Summary.

Key Features:
• One`).ok).toBe(false)

    expect(normalizeProductDescription(`Summary.

Key Features:
• One
• Two
• Three
• Four
• Five
• Six
• Seven
• Eight
• Nine`).ok).toBe(false)
  })
})

describe('parseProductDescription', () => {
  it('extracts summary, key features, and sections', () => {
    const parsed = parseProductDescription(`Starter culture for homemade probiotic yogurt.

Key Features:
• Contains live cultures
• Suitable for dairy yogurt

Usage Tips:
• Mix with warm milk
• Incubate according to recipe`)

    expect(parsed.summary).toBe('Starter culture for homemade probiotic yogurt.')
    expect(parsed.features).toEqual(['Contains live cultures', 'Suitable for dairy yogurt'])
    expect(parsed.sections).toEqual([
      { heading: 'Usage Tips', lines: ['• Mix with warm milk', '• Incubate according to recipe'] },
    ])
  })
})
