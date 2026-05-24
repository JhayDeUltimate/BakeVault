/**
 * Validates that all required Vite environment variables are present and
 * non-empty at startup. Call this before rendering the React tree so failures
 * surface immediately instead of causing cryptic runtime errors.
 */

const REQUIRED = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const

export function validateEnv() {
  const missing = REQUIRED.filter((k) => !import.meta.env[k]?.trim())
  if (missing.length > 0) {
    throw new Error(
      `[BakeVault] Missing required environment variables: ${missing.join(', ')}`
    )
  }
}
