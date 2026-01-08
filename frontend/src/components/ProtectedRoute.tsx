import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)

  // 检查用户是否已认证
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute