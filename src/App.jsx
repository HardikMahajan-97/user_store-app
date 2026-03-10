import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ROLES } from './utils/constants'

import ProtectedRoute from './components/common/ProtectedRoute'
import RoleRoute from './components/common/RoleRoute'
import Layout from './components/layout/Layout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentDocuments from './pages/student/Documents'
import StudentChangePassword from './pages/student/ChangePassword'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import StudentSearch from './pages/admin/StudentSearch'
import BulkSearch from './pages/admin/BulkSearch'
import AdminStudentDocuments from './pages/admin/StudentDocuments'
import AdminChangePassword from './pages/admin/ChangePassword'

// 404
import NotFound from './pages/NotFound'

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <Navigate
      to={user?.role === ROLES.ADMIN ? '/admin/dashboard' : '/student/dashboard'}
      replace
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', fontSize: '14px' },
          }}
        />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <RoleRoute role={ROLES.STUDENT}>
                  <Layout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="change-password" element={<StudentChangePassword />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute role={ROLES.ADMIN}>
                  <Layout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="student-search" element={<StudentSearch />} />
            <Route path="bulk-search" element={<BulkSearch />} />
            <Route path="student-documents" element={<AdminStudentDocuments />} />
            <Route path="change-password" element={<AdminChangePassword />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
