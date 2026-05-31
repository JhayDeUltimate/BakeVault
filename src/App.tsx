import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from '@/lib/cart-context'
import PublicLayout from '@/components/PublicLayout'
import HomePage from '@/views/HomePage'
import CatalogPage from '@/views/CatalogPage'
import AboutPage from '@/views/AboutPage'
import FAQPage from '@/views/FAQPage'
import HowToOrderPage from '@/views/HowToOrderPage'
import DeliveryPage from '@/views/DeliveryPage'
import ContactPage from '@/views/ContactPage'
import TermsPage from '@/views/TermsPage'
import PrivacyPage from '@/views/PrivacyPage'
import ProductPage from '@/views/ProductPage'
import YogurtStarterPage from '@/views/landing/YogurtStarterPage'
import KefirStarterPage from '@/views/landing/KefirStarterPage'
import BreadImproverPage from '@/views/landing/BreadImproverPage'
import NotFoundPage from '@/views/NotFoundPage'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ScrollToTop from '@/components/ScrollToTop'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy-load all admin views so storefront visitors never download admin code
const AdminLogin          = lazy(() => import('@/views/admin/AdminLogin'))
const AdminResetPassword  = lazy(() => import('@/views/admin/AdminResetPassword'))
const AdminLayout         = lazy(() => import('@/views/admin/AdminLayout'))
const AdminDashboard      = lazy(() => import('@/views/admin/AdminDashboard'))
const AdminProducts       = lazy(() => import('@/views/admin/AdminProducts'))
const AdminCategories     = lazy(() => import('@/views/admin/AdminCategories'))
const AdminEnquiries      = lazy(() => import('@/views/admin/AdminEnquiries'))
const AdminProductRequests = lazy(() => import('@/views/admin/AdminProductRequests'))
const AdminTestimonials   = lazy(() => import('@/views/admin/AdminTestimonials'))
const AdminFAQ            = lazy(() => import('@/views/admin/AdminFAQ'))
const AdminSettings       = lazy(() => import('@/views/admin/AdminSettings'))
const AdminActivityLogs   = lazy(() => import('@/views/admin/AdminActivityLogs'))

const AdminSpinner = () => (
  <div className="flex justify-center py-20">
    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/how-to-order" element={<HowToOrderPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            {/* SEO landing pages */}
            <Route path="/yogurt-starter-lagos" element={<YogurtStarterPage />} />
            <Route path="/kefir-starter-lagos" element={<KefirStarterPage />} />
            <Route path="/bread-improver-lagos" element={<BreadImproverPage />} />
            {/* 404 — rendered inside the public layout so header/footer are present */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin — lazy-loaded, never included in the storefront bundle */}
          <Route path="/admin/login" element={
            <Suspense fallback={null}><AdminLogin /></Suspense>
          } />
          <Route path="/admin/reset-password" element={
            <Suspense fallback={null}><AdminResetPassword /></Suspense>
          } />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminSpinner />}>
                  <AdminLayout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="requests" element={<AdminProductRequests />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="settings"     element={<AdminSettings />} />
            <Route path="activity"     element={<AdminActivityLogs />} />
          </Route>
        </Routes>
      </CartProvider>
    </ErrorBoundary>
  )
}
