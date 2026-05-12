import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <Helmet>
        <title>404 Not Found — BakeVault</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="The requested page was not found." />
      </Helmet>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-darkGray">404 — Page Not Found</h1>
        <p className="mt-4 text-sm text-gray-600">We couldn't find <span className="font-mono">{location.pathname}</span>. It may have been removed or the link is incorrect.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-brand-brown text-white rounded-lg font-semibold hover:bg-brand-orange">Home</Link>
          <Link to="/catalog" className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg">Browse Catalog</Link>
          {isAdmin && (
            <Link to="/admin/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg">Admin Dashboard</Link>
          )}
        </div>
      </main>
    </>
  )
}
