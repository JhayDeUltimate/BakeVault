export type ProductDescriptionValidation =
  | { ok: true; value: string }
  | { ok: false; error: string }

const FEATURE_HEADING = 'Key Features:'

function stripFeatureMarker(line: string): string {
  return line.replace(/^[•-]\s*/, '').trim()
}

export function normalizeProductDescription(input: string): ProductDescriptionValidation {
  const lines = input
    .trim()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  const headingIndex = lines.findIndex(line => line.toLowerCase() === FEATURE_HEADING.toLowerCase())

  if (headingIndex <= 0) {
    return {
      ok: false,
      error: 'Add a short summary line, then a "Key Features:" heading.',
    }
  }

  const summary = lines.slice(0, headingIndex).join(' ').trim()
  if (!summary) {
    return {
      ok: false,
      error: 'Add a short summary line before "Key Features:".',
    }
  }

  const features = lines
    .slice(headingIndex + 1)
    .map(stripFeatureMarker)
    .filter(Boolean)

  if (features.length < 2 || features.length > 6) {
    return {
      ok: false,
      error: 'Add 2 to 6 feature bullets after "Key Features:".',
    }
  }

  return {
    ok: true,
    value: `${summary}\n\n${FEATURE_HEADING}\n${features.map(feature => `• ${feature}`).join('\n')}`,
  }
}
