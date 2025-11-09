import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading){
    return(
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}
