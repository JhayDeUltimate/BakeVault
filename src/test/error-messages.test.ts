import { describe, it, expect } from 'vitest'
import { friendlyErrorMessage, storefrontSubmissionErrorMessage } from '@/lib/error-messages'

describe('friendlyErrorMessage', () => {
  it('handles RLS permission errors', () => {
    const err = { message: 'row-level security policy violation for table admins' }
    expect(friendlyErrorMessage(err)).toContain('permission')
  })

  it('handles duplicate key errors', () => {
    const err = { message: 'duplicate key value', code: '23505' }
    expect(friendlyErrorMessage(err)).toBe('That item already exists.')
  })

  it('returns fallback for empty message', () => {
    expect(friendlyErrorMessage({})).toBe('Something went wrong. Please try again.')
  })

  it('handles check constraint for quote length', () => {
    const err = { message: 'new row violates check constraint check_quote_length' }
    expect(friendlyErrorMessage(err)).toContain('5000')
  })
})

describe('storefrontSubmissionErrorMessage', () => {
  it('maps network errors to connection message', () => {
    const err = new Error('Failed to fetch')
    expect(storefrontSubmissionErrorMessage(err)).toContain('connection')
  })

  it('returns fallback for RLS errors', () => {
    const err = { message: 'permission denied' }
    const result = storefrontSubmissionErrorMessage(err, 'Custom fallback.')
    expect(result).toBe('Custom fallback.')
  })
})
