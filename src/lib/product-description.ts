type ProductDescriptionValidation =
  | { ok: true; value: string }
  | { ok: false; error: string }

interface ProductDescriptionSection {
  heading: string
  lines: string[]
}

export interface ParsedProductDescription {
  summary: string
  features: string[]
  sections: ProductDescriptionSection[]
}

const FEATURE_HEADING = 'Key Features:'
const OPTIONAL_HEADINGS = [
  'Product Description',
  'Product Details',
  'Specifications',
  'Best For',
  'Who Should Buy?',
  'Usage Tips',
  'Storage Tips',
  'Important Notes',
]

const HEADING_LABELS = new Map<string, string>([
  ['key features', 'Key Features'],
  ...OPTIONAL_HEADINGS.map(heading => [normaliseHeadingKey(heading), heading] as const),
])

const BULLET_PREFIX = /^(?:\u2022|-|\u00e2\u20ac\u00a2)\s*/

function normaliseHeadingKey(line: string): string {
  return line.trim().replace(/:$/, '').toLowerCase()
}

function headingFor(line: string): string | null {
  return HEADING_LABELS.get(normaliseHeadingKey(line)) ?? null
}

function stripFeatureMarker(line: string): string {
  return line.replace(BULLET_PREFIX, '').trim()
}

function formatHeading(heading: string): string {
  return heading.endsWith('?') ? heading : `${heading}:`
}

function normaliseSectionLine(line: string): string {
  const stripped = stripFeatureMarker(line)
  if (!stripped) return ''
  return BULLET_PREFIX.test(line) ? `\u2022 ${stripped}` : stripped
}

export function parseProductDescription(input: string | null | undefined): ParsedProductDescription {
  const lines = (input ?? '')
    .trim()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  const featureHeadingIndex = lines.findIndex(line => headingFor(line) === 'Key Features')
  const summary = featureHeadingIndex > 0
    ? lines.slice(0, featureHeadingIndex).join(' ').trim()
    : featureHeadingIndex === 0 ? '' : lines[0] ?? ''

  if (featureHeadingIndex < 0) {
    return { summary, features: [], sections: [] }
  }

  const sections: ProductDescriptionSection[] = []
  const features: string[] = []
  let currentSection: ProductDescriptionSection | null = null

  for (const line of lines.slice(featureHeadingIndex + 1)) {
    const heading = headingFor(line)
    if (heading && heading !== 'Key Features') {
      currentSection = { heading, lines: [] }
      sections.push(currentSection)
      continue
    }

    if (currentSection) {
      const sectionLine = normaliseSectionLine(line)
      if (sectionLine) currentSection.lines.push(sectionLine)
    } else {
      const feature = stripFeatureMarker(line)
      if (feature) features.push(feature)
    }
  }

  return { summary, features, sections: sections.filter(section => section.lines.length > 0) }
}

export function normalizeProductDescription(input: string): ProductDescriptionValidation {
  const parsed = parseProductDescription(input)

  if (!parsed.summary || !parsed.features.length) {
    return {
      ok: false,
      error: 'Add a short summary line, then a "Key Features:" heading.',
    }
  }

  if (parsed.features.length < 2 || parsed.features.length > 8) {
    return {
      ok: false,
      error: 'Add 2 to 8 feature bullets after "Key Features:".',
    }
  }

  const sectionBlocks = parsed.sections.map(section => [
    formatHeading(section.heading),
    ...section.lines,
  ].join('\n'))

  return {
    ok: true,
    value: [
      parsed.summary,
      [FEATURE_HEADING, ...parsed.features.map(feature => `\u2022 ${feature}`)].join('\n'),
      ...sectionBlocks,
    ].join('\n\n'),
  }
}
