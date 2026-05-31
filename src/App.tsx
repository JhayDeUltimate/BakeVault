import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from '@/lib/cart-context'
import PublicLayout from '@/components/PublicLayout'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ScrollToTop from '@/components/ScrollToTop'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy-load route pages so the first visit only downloads the shell + active page
const HomePage           = lazy(() => import('@/views/HomePage'))
const CatalogPage        = lazy(() => import('@/views/CatalogPage'))
const AboutPage          = lazy(() => import('@/views/AboutPage'))
const FAQPage            = lazy(() => import('@/views/FAQPage'))
const HowToOrderPage     = lazy(() => import('@/views/HowToOrderPage'))
const DeliveryPage       = lazy(() => import('@/views/DeliveryPage'))
const ContactPage        = lazy(() => import('@/views/ContactPage'))
const TermsPage          = lazy(() => import('@/views/TermsPage'))
const PrivacyPage        = lazy(() => import('@/views/PrivacyPage'))
const ProductPage        = lazy(() => import('@/views/ProductPage'))
const YogurtStarterPage  = lazy(() => import('@/views/landing/YogurtStarterPage'))
const KefirStarterPage   = lazy(() => import('@/views/landing/KefirStarterPage'))
const BreadImproverPage  = lazy(() => import('@/views/landing/BreadImproverPage'))
const NotFoundPage       = lazy(() => import('@/views/NotFoundPage'))

// Lazy-load all admin views so storefront visitors never download admin code
const AdminLogin          = lazy(() => import('@/views/admin/AdminLogin'))
const AdminResetPassword  = lazy(() => import('@/views/admin/AdminResetPassword'))
const AdminLayout         = lazy(() => import('@/views/admin/AdminLayout'))
const AdminDashboard      = lazy(() => import('@/views/admin/AdminDashboard'))
const AdminProducts       = lazy(() => import('@/views/admin/AdminProducts'))
const AdminProductEditor  = lazy(() => import('@/views/admin/AdminProductEditor'))
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

const PublicSpinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="w-8 h-8 border-4 border-orange-100 border-t-brand-orange rounded-full animate-spin" />
  </div>
)

function publicPage(page: React.ReactNode) {
  return <Suspense fallback={<PublicSpinner />}>{page}</Suspense>
}

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={publicPage(<HomePage />)} />
            <Route path="/catalog" element={publicPage(<CatalogPage />)} />
            <Route path="/about" element={publicPage(<AboutPage />)} />
            <Route path="/faq" element={publicPage(<FAQPage />)} />
            <Route path="/how-to-order" element={publicPage(<HowToOrderPage />)} />
            <Route path="/delivery" element={publicPage(<DeliveryPage />)} />
            <Route path="/contact" element={publicPage(<ContactPage />)} />
            <Route path="/terms" element={publicPage(<TermsPage />)} />
            <Route path="/privacy" element={publicPage(<PrivacyPage />)} />
            <Route path="/products/:slug" element={publicPage(<ProductPage />)} />
            {/* SEO landing pages */}
            <Route path="/yogurt-starter-lagos" element={publicPage(<YogurtStarterPage />)} />
            <Route path="/kefir-starter-lagos" element={publicPage(<KefirStarterPage />)} />
            <Route path="/bread-improver-lagos" element={publicPage(<BreadImproverPage />)} />
            {/* 404 — rendered inside the public layout so header/footer are present */}
            <Route path="*" element={publicPage(<NotFoundPage />)} />
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
            <Route path="products/new" element={<AdminProductEditor />} />
            <Route path="products/:id/edit" element={<AdminProductEditor />} />
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
