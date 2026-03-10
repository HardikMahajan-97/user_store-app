import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'

export default function RoleRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    const redirectTo =
      user.role === ROLES.ADMIN ? '/admin/dashboard' : '/student/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  return children
}
