'use client'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import AdminCategories from '@/pages-old/admin/AdminCategories'
import AdminDashboard from '@/pages-old/admin/AdminDashboard'
import AdminEnquiries from '@/pages-old/admin/AdminEnquiries'
import AdminLayout from '@/pages-old/admin/AdminLayout'
import AdminLogin from '@/pages-old/admin/AdminLogin'
import AdminProducts from '@/pages-old/admin/AdminProducts'
import AdminSettings from '@/pages-old/admin/AdminSettings'
import AdminTestimonials from '@/pages-old/admin/AdminTestimonials'

export default function AdminRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
