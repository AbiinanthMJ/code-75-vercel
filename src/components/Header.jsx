import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'

export default function Header() {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className={`navbar navbar-expand-lg ${isDark ? 'navbar-dark bg-dark' : 'navbar-light bg-light border-bottom'}`}>
      <div className="container-fluid">
        <Link className={`navbar-brand fw-bold ${isDark ? 'text-light' : 'text-dark'}`} to="/">
          <i className="fas fa-code me-2 text-success"></i>Code 75
        </Link>

        <div className="ms-auto d-flex align-items-center gap-3">
          <Link className={`nav-link ${isDark ? 'text-light' : 'text-dark'}`} to="/">
            <i className="fas fa-list me-1"></i>Problems
          </Link>

          <button
            className="btn border-0 position-relative"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{
              width: '50px',
              height: '28px',
              borderRadius: '14px',
              background: isDark 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDark 
                ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                : '0 4px 15px rgba(240, 147, 251, 0.4)',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = isDark 
                ? '0 6px 20px rgba(102, 126, 234, 0.6)' 
                : '0 6px 20px rgba(240, 147, 251, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = isDark 
                ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                : '0 4px 15px rgba(240, 147, 251, 0.4)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: isDark ? '24px' : '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <i 
                className={`fas ${isDark ? 'fa-moon' : 'fa-sun'}`}
                style={{
                  fontSize: '10px',
                  color: isDark ? '#667eea' : '#f5576c',
                  transition: 'all 0.3s ease'
                }}
              ></i>
            </div>
          </button>

          {user ? (
            <>
              <span className={`${isDark ? 'text-light' : 'text-dark'}`}>
                <i className="fas fa-user me-1"></i>{user.email}
              </span>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={signOut}
              >
                <i className="fas fa-sign-out-alt me-1"></i>Sign Out
              </button>
            </>
          ) : (
            <Link className="btn btn-success btn-sm" to="/login">
              <i className="fas fa-sign-in-alt me-1"></i>Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
