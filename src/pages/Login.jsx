import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return setError('Please fill in all fields')
    setLoading(true)
    setError('')
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) setError(error.message)
      else if (isSignUp) setError('Check your email for the confirmation link!')
      else navigate('/')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative" 
         style={{ 
           background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d2818 100%)',
           overflow: 'hidden'
         }}>
      
      {/* Animated background elements */}
      <div className="position-absolute" style={{
        top: '10%',
        left: '10%',
        width: '20px',
        height: '20px',
        background: '#00ff41',
        borderRadius: '50%',
        animation: 'pulse 2s infinite',
        opacity: 0.6
      }}></div>
      
      <div className="position-absolute" style={{
        top: '20%',
        right: '15%',
        width: '15px',
        height: '15px',
        background: '#39ff14',
        borderRadius: '50%',
        animation: 'pulse 3s infinite',
        opacity: 0.4
      }}></div>
      
      <div className="position-absolute" style={{
        bottom: '30%',
        left: '20%',
        width: '25px',
        height: '25px',
        background: '#00ff88',
        borderRadius: '50%',
        animation: 'pulse 2.5s infinite',
        opacity: 0.5
      }}></div>

      {/* Matrix-style lines */}
      <div className="position-absolute" style={{
        top: 0,
        left: '30%',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent, #00ff41, transparent)',
        animation: 'matrixFall 4s infinite linear',
        opacity: 0.3
      }}></div>
      
      <div className="position-absolute" style={{
        top: 0,
        right: '25%',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent, #39ff14, transparent)',
        animation: 'matrixFall 5s infinite linear',
        animationDelay: '1s',
        opacity: 0.2
      }}></div>

      <div className="card shadow-lg border-0 position-relative" style={{ 
        width: 420, 
        borderRadius: 15, 
        backdropFilter: 'blur(15px)', 
        backgroundColor: 'rgba(13, 17, 23, 0.95)',
        border: '1px solid rgba(0, 255, 65, 0.2)',
        boxShadow: '0 0 30px rgba(0, 255, 65, 0.1)'
      }}>
        
        {/* Glitch effect overlay */}
        <div className="position-absolute" style={{
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #00ff41, #39ff14, #00ff88)',
          animation: 'glitch 3s infinite'
        }}></div>

        <div className="card-body p-5">

          {/* Header */}
          <div className="text-center mb-4">
            <div style={{ 
              width: 70, 
              height: 70, 
              background: 'linear-gradient(135deg, #00ff41 0%, #39ff14 100%)', 
              borderRadius: '50%', 
              margin: '0 auto', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#000', 
              fontSize: 24, 
              fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
              animation: 'pulse 2s infinite'
            }}>
              <i className="fas fa-terminal"></i>
            </div>
            <h3 className="card-title text-light fw-bold mb-2" style={{ 
              textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
              fontFamily: 'monospace'
            }}>
              &gt; CODE_75.exe
            </h3>
            <p className="text-light mb-0" style={{ opacity: 0.8 }}>
              {isSignUp ? 'Initializing new user account...' : 'Authenticating user credentials...'}
            </p>
          </div>

          {error && (
            <div className="alert border-0 shadow-sm" 
                 style={{ 
                   backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                   border: '1px solid rgba(255, 0, 0, 0.3)',
                   color: '#ff6b6b'
                 }} 
                 role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-semibold text-light">
                <i className="fas fa-user me-2 text-success"></i>Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                placeholder="user@domain.com"
                required
                style={{
                  backgroundColor: 'rgba(22, 27, 34, 0.8)',
                  border: '1px solid rgba(0, 255, 65, 0.3)',
                  color: '#00ff41',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold text-light">
                <i className="fas fa-lock me-2 text-success"></i>Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  backgroundColor: 'rgba(22, 27, 34, 0.8)',
                  border: '1px solid rgba(0, 255, 65, 0.3)',
                  color: '#00ff41',
                  borderRadius: '8px'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn w-100 mb-4 text-dark fw-bold py-3"
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #00ff41 0%, #39ff14 100%)', 
                border: 'none', 
                borderRadius: 10, 
                fontSize: 16,
                boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = '0 0 30px rgba(0, 255, 65, 0.6)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <i className="fas fa-sign-in-alt me-2"></i>
              )}
              {isSignUp ? 'CREATE_ACCOUNT' : 'AUTHENTICATE'}
            </button>
          </form>

          <div className="text-center mb-3">
            <button
              type="button"
              className="btn btn-link text-decoration-none fw-semibold"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              style={{ color: '#00ff41' }}
            >
              {isSignUp ? '&lt; Return to Login' : '&gt; Create New Account'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-decoration-none d-flex align-items-center justify-content-center" 
                  style={{ color: '#39ff14', opacity: 0.8 }}>
              <i className="fas fa-arrow-left me-2"></i> Back to Main Terminal
            </Link>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes matrixFall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
      `}</style>
    </div>
  )
}
