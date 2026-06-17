import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from '@/lib/cart-context'
import PublicLayout from '@/components/PublicLayout'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ScrollToTop from '@/components/ScrollToTop'
import ErrorBoundary from '@/components/ErrorBoundary'
import RouteErrorBoundary from '@/components/RouteErrorBoundary'
import { Analytics } from '@vercel/analytics/react'

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
const LeaveReviewPage    = lazy(() => import('@/views/LeaveReviewPage'))
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

function publicPage(page: React.ReactNode, name?: string) {
  return (
    <RouteErrorBoundary routeName={name}>
      <Suspense fallback={<PublicSpinner />}>{page}</Suspense>
    </RouteErrorBoundary>
  )
}

function adminPage(page: React.ReactNode, name?: string, fallback: React.ReactNode = <AdminSpinner />) {
  return (
    <RouteErrorBoundary routeName={name}>
      <Suspense fallback={fallback}>{page}</Suspense>
    </RouteErrorBoundary>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={publicPage(<HomePage />, 'Home')} />
            <Route path="/catalog" element={publicPage(<CatalogPage />, 'Catalog')} />
            <Route path="/about" element={publicPage(<AboutPage />, 'About')} />
            <Route path="/faq" element={publicPage(<FAQPage />, 'FAQ')} />
            <Route path="/how-to-order" element={publicPage(<HowToOrderPage />, 'How to Order')} />
            <Route path="/delivery" element={publicPage(<DeliveryPage />, 'Delivery')} />
            <Route path="/contact" element={publicPage(<ContactPage />, 'Contact')} />
            <Route path="/terms" element={publicPage(<TermsPage />, 'Terms')} />
            <Route path="/privacy" element={publicPage(<PrivacyPage />, 'Privacy')} />
            <Route path="/products/:slug" element={publicPage(<ProductPage />, 'Product')} />
            <Route path="/leave-review" element={publicPage(<LeaveReviewPage />, 'Leave Review')} />
            {/* SEO landing pages */}
            <Route path="/yogurt-starter-lagos" element={publicPage(<YogurtStarterPage />, 'Yogurt Starter')} />
            <Route path="/kefir-starter-lagos" element={publicPage(<KefirStarterPage />, 'Kefir Starter')} />
            <Route path="/bread-improver-lagos" element={publicPage(<BreadImproverPage />, 'Bread Improver')} />
            {/* 404 — rendered inside the public layout so header/footer are present */}
            <Route path="*" element={publicPage(<NotFoundPage />, 'Not Found')} />
          </Route>

          {/* Admin — lazy-loaded, never included in the storefront bundle */}
          <Route path="/admin/login" element={adminPage(<AdminLogin />, 'Admin Login', null)} />
          <Route path="/admin/reset-password" element={adminPage(<AdminResetPassword />, 'Password Reset', null)} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {adminPage(<AdminLayout />, 'Admin')}
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={adminPage(<AdminDashboard />, 'Admin Dashboard')} />
            <Route path="products" element={adminPage(<AdminProducts />, 'Admin Products')} />
            <Route path="products/new" element={adminPage(<AdminProductEditor />, 'Product Editor')} />
            <Route path="products/:id/edit" element={adminPage(<AdminProductEditor />, 'Product Editor')} />
            <Route path="categories" element={adminPage(<AdminCategories />, 'Admin Categories')} />
            <Route path="enquiries" element={adminPage(<AdminEnquiries />, 'Admin Enquiries')} />
            <Route path="requests" element={adminPage(<AdminProductRequests />, 'Product Requests')} />
            <Route path="testimonials" element={adminPage(<AdminTestimonials />, 'Admin Testimonials')} />
            <Route path="faq" element={adminPage(<AdminFAQ />, 'Admin FAQ')} />
            <Route path="settings"     element={adminPage(<AdminSettings />, 'Admin Settings')} />
            <Route path="activity"     element={adminPage(<AdminActivityLogs />, 'Admin Activity')} />
          </Route>
        </Routes>
      </CartProvider>
    </ErrorBoundary>
  )
}
