import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />
  if (role && user.rol !== role) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute