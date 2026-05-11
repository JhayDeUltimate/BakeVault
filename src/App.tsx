import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }          from '@/lib/auth-context'
import { CartProvider }          from '@/lib/cart-context'
import PublicLayout              from '@/components/PublicLayout'
import HomePage                  from '@/views/HomePage'
import CatalogPage               from '@/views/CatalogPage'
import AboutPage                 from '@/views/AboutPage'
import FAQPage                   from '@/views/FAQPage'
import HowToOrderPage            from '@/views/HowToOrderPage'
import DeliveryPage              from '@/views/DeliveryPage'
import ContactPage               from '@/views/ContactPage'
import TermsPage                 from '@/views/TermsPage'
import PrivacyPage               from '@/views/PrivacyPage'
import ProductPage               from '@/views/ProductPage'
import AdminLogin                from '@/views/admin/AdminLogin'
import AdminLayout               from '@/views/admin/AdminLayout'
import AdminDashboard            from '@/views/admin/AdminDashboard'
import AdminProducts             from '@/views/admin/AdminProducts'
import AdminCategories           from '@/views/admin/AdminCategories'
import AdminEnquiries            from '@/views/admin/AdminEnquiries'
import AdminProductRequests      from '@/views/admin/AdminProductRequests'
import AdminTestimonials         from '@/views/admin/AdminTestimonials'
import AdminSettings             from '@/views/admin/AdminSettings'
import ProtectedRoute            from '@/components/admin/ProtectedRoute'
import ScrollToTop               from '@/components/ScrollToTop'
import ErrorBoundary             from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
    <CartProvider>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/"        element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/about"   element={<AboutPage />} />
          <Route path="/faq"            element={<FAQPage />} />
          <Route path="/how-to-order"   element={<HowToOrderPage />} />
          <Route path="/delivery"       element={<DeliveryPage />} />
          <Route path="/contact"        element={<ContactPage />} />
          <Route path="/terms"          element={<TermsPage />} />
          <Route path="/privacy"        element={<PrivacyPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
        >
          <Route index                 element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="products"       element={<AdminProducts />} />
          <Route path="categories"     element={<AdminCategories />} />
          <Route path="enquiries"      element={<AdminEnquiries />} />
          <Route path="requests"       element={<AdminProductRequests />} />
          <Route path="testimonials"   element={<AdminTestimonials />} />
          <Route path="settings"       element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}