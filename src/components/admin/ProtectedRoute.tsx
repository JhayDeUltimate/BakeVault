import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />
  // If the user is signed in but lacks admin privileges, send them
  // to the admin login page so they can sign out or switch accounts.
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}