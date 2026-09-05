/**
 * Client-side fuzzy search utility for BakeVault.
 *
 * Uses bigram (Dice) similarity to tolerate typos and partial words
 * without any external dependencies. Designed for small catalogs
 * (hundreds of products) where loading all items is cheap.
 */

/** Lowercase, strip diacritics/accents, collapse whitespace */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip combining diacritical marks
    .replace(/[^a-z0-9\s]/g, ' ')     // replace non-alphanumeric with space
    .replace(/\s+/g, ' ')
    .trim()
}

/** Generate character bigrams from a string */
function bigrams(text: string): Set<string> {
  const set = new Set<string>()
  const s = normalize(text)
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.slice(i, i + 2))
  }
  return set
}

/**
 * Dice coefficient between two strings' bigram sets.
 * Returns a value between 0 (no overlap) and 1 (identical).
 */
export function similarity(a: string, b: string): number {
  const bigramsA = bigrams(a)
  const bigramsB = bigrams(b)
  if (bigramsA.size === 0 && bigramsB.size === 0) return 1
  if (bigramsA.size === 0 || bigramsB.size === 0) return 0

  let intersectionSize = 0
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) intersectionSize++
  }

  return (2 * intersectionSize) / (bigramsA.size + bigramsB.size)
}

/** Minimum similarity score to consider a fuzzy match */
const MIN_SIMILARITY = 0.3

/** Bonus added when the query is an exact substring of the target */
const SUBSTRING_BONUS = 0.5

export interface FuzzyTarget {
  id: string
  /** Searchable text fields concatenated (e.g. product name + category name) */
  text: string
}

export interface FuzzyResult {
  id: string
  score: number
}

/**
 * Fuzzy-match a query against a list of targets.
 *
 * Scoring strategy:
 * 1. Exact normalized substring match → similarity score + SUBSTRING_BONUS
 * 2. All query tokens found as substrings → similarity score + 0.3
 * 3. Bigram similarity above threshold → raw similarity score
 *
 * Results are returned sorted by descending score (most relevant first).
 * Items below MIN_SIMILARITY with no substring/token match are excluded.
 */
export function fuzzyMatch(query: string, targets: FuzzyTarget[]): FuzzyResult[] {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return targets.map(t => ({ id: t.id, score: 1 }))

  const queryTokens = normalizedQuery.split(' ').filter(t => t.length > 0)
  const results: FuzzyResult[] = []

  for (const target of targets) {
    const normalizedTarget = normalize(target.text)
    let score = similarity(normalizedQuery, normalizedTarget)

    // Check each query token against the target individually for better
    // multi-word matching (e.g. "bread improver" should score well against
    // "premium bread improver for bakers")
    const tokenScores = queryTokens.map(token => {
      // Exact token substring match
      if (normalizedTarget.includes(token)) return 1
      // Find best similarity among target words for this token
      const targetWords = normalizedTarget.split(' ')
      let best = 0
      for (const word of targetWords) {
        const s = similarity(token, word)
        if (s > best) best = s
      }
      return best
    })

    const avgTokenScore = tokenScores.reduce((a, b) => a + b, 0) / tokenScores.length
    const allTokensSubstring = queryTokens.every(t => normalizedTarget.includes(t))

    // Boost scoring based on match quality
    if (normalizedTarget.includes(normalizedQuery)) {
      // Full query is an exact substring — strongest signal
      score = Math.max(score, avgTokenScore) + SUBSTRING_BONUS
    } else if (allTokensSubstring) {
      // All individual tokens found as substrings
      score = Math.max(score, avgTokenScore) + 0.3
    } else {
      // Use the better of overall similarity vs average token similarity
      score = Math.max(score, avgTokenScore)
    }

    if (score >= MIN_SIMILARITY) {
      results.push({ id: target.id, score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}
