import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Home from './pages/Home'
import ProblemPage from './pages/ProblemPage'
import Login from './pages/Login'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
          <Header />
          <div className="flex-grow-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/problems/:id" element={
                <ProtectedRoute>
                  <ProblemPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}