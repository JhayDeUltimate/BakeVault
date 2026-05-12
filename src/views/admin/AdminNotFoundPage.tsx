import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function AdminNotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Admin — 404 Not Found</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="Requested admin page not found." />
      </Helmet>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-darkGray">Admin — 404 Not Found</h1>
        <p className="mt-4 text-sm text-gray-600">We couldn't find the admin page you requested. It may have been removed or the link is incorrect.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/admin/dashboard" className="inline-flex items-center px-4 py-2 bg-brand-brown text-white rounded-lg font-semibold hover:bg-brand-orange">Dashboard</Link>
          <Link to="/admin/login" className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg">Admin Login</Link>
          <Link to="/" className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg">Store</Link>
        </div>
      </main>
    </>
  )
}
