import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../types'
import { useAuthStore } from '../stores/authStore'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'Teacher' ? '/teacher' : '/student'} replace />
  }

  return <Outlet />
}
