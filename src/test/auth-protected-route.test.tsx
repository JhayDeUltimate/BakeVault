import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { vi, describe, it, expect } from 'vitest'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { AuthContext } from '@/lib/auth-context'

const defaultAuth = {
  user: null,
  loading: false,
  isAdmin: false,
  isAdminChecking: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}

function mockAuthState(overrides: Partial<typeof defaultAuth>) {
  return { ...defaultAuth, ...overrides }
}

function renderWithAuth(authState: ReturnType<typeof mockAuthState>) {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <AuthContext.Provider value={authState}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /admin/login', () => {
    renderWithAuth(mockAuthState({ user: null, loading: false }))
    expect(screen.getByText('Login Page')).toBeTruthy()
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  it('shows spinner while auth is loading', () => {
    renderWithAuth(mockAuthState({ user: null, loading: true }))
    expect(screen.queryByText('Login Page')).toBeNull()
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  it('redirects authenticated non-admin to /admin/login', () => {
    renderWithAuth(mockAuthState({
      user: { id: 'user-1', email: 'notadmin@test.com' } as any,
      loading: false,
      isAdmin: false,
      isAdminChecking: false,
    }))
    expect(screen.getByText('Login Page')).toBeTruthy()
  })

  it('renders children for authenticated admin', () => {
    renderWithAuth(mockAuthState({
      user: { id: 'admin-1', email: 'admin@test.com' } as any,
      loading: false,
      isAdmin: true,
      isAdminChecking: false,
    }))
    expect(screen.getByText('Admin Content')).toBeTruthy()
  })
})
