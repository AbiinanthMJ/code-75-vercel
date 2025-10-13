import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { SolvedIndicator } from './SolvedStatus'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function ProblemList() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [categories, setCategories] = useState([])
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: cats, error: e1 } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')
        const { data: probs, error: e2 } = await supabase
          .from('problems')
          .select('id, title, category_id')
          .order('title')

        if (e1 || e2) setError(e1?.message || e2?.message)
        else {
          setCategories(cats || [])
          setProblems(probs || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map()

    categories.forEach(c => map.set(c.id, { category: c, problems: [] }))

    // Filter problems based on search term
    const filteredProblems = problems.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filteredProblems.forEach(p => {
      if (!map.has(p.category_id)) {
        map.set(p.category_id, {
          category: { id: p.category_id, name: 'Uncategorized' },
          problems: []
        })
      }
      map.get(p.category_id).problems.push(p)
    })

    // Only return categories that have problems after filtering
    return Array.from(map.values())
      .filter(group => group.problems.length > 0)
      .sort((a, b) => a.category.name.localeCompare(b.category.name))
  }, [categories, problems, searchTerm])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className={`${isDark ? 'text-light' : 'text-muted'}`}>Loading problems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 shadow-sm" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="position-relative">
              <div className={`input-group shadow-sm`} 
                   style={{ 
                     borderRadius: '8px', 
                     border: `1px solid ${isDark ? '#333' : '#e9ecef'}`,
                     backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                     transition: 'all 0.3s ease'
                   }}
                   onFocus={(e) => {
                     e.currentTarget.style.borderColor = '#28a745'
                     e.currentTarget.style.boxShadow = '0 0 0 0.15rem rgba(40, 167, 69, 0.2)'
                   }}
                   onBlur={(e) => {
                     e.currentTarget.style.borderColor = isDark ? '#333' : '#e9ecef'
                     e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                   }}>
                <span className={`input-group-text border-0 ${isDark ? 'bg-transparent text-success' : 'bg-transparent text-success'}`}
                      style={{ borderTopLeftRadius: '7px', borderBottomLeftRadius: '7px', padding: '8px 12px' }}>
                  <i className="fas fa-search" style={{ fontSize: '0.9rem' }}></i>
                </span>
                <input
                  type="text"
                  className={`form-control border-0 ${isDark ? 'bg-transparent text-light' : 'bg-transparent text-dark'}`}
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    backgroundColor: 'transparent',
                    fontSize: '0.95rem',
                    padding: '8px 0',
                    borderTopRightRadius: '7px',
                    borderBottomRightRadius: '7px'
                  }}
                />
                {searchTerm && (
                  <button
                    className={`btn border-0 ${isDark ? 'text-light' : 'text-muted'} me-2`}
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                    style={{ 
                      backgroundColor: 'transparent',
                      fontSize: '0.9rem',
                      padding: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#dc3545'}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#fff' : '#6c757d'}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-center">
            <small className={`${isDark ? 'text-light' : 'text-muted'}`}>
              <i className="fas fa-filter me-1 text-success"></i>
              {grouped.reduce((total, group) => total + group.problems.length, 0)} result{grouped.reduce((total, group) => total + group.problems.length, 0) !== 1 ? 's' : ''} for "{searchTerm}"
            </small>
          </div>
        )}
      </div>

      {/* Problems Grid */}
      <div className="row g-4">
        {grouped.map(({ category, problems }) => (
        <div className="col-12 col-lg-6 col-xl-4" key={category.id}>
          <div className={`card h-100 border-0 shadow-sm ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}
               style={{ 
                 borderRadius: '16px',
                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                 border: isDark ? '1px solid #333' : '1px solid #e9ecef',
                 display: 'flex',
                 flexDirection: 'column',
                 overflow: 'hidden'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-5px)'
                 e.currentTarget.style.boxShadow = isDark 
                   ? '0 12px 40px rgba(40, 167, 69, 0.15)' 
                   : '0 12px 40px rgba(0, 0, 0, 0.12)'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'translateY(0)'
                 e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
               }}>
            
            {/* Category Header */}
            <div className="card-header border-0 bg-transparent pt-4 pb-2">
              <div className="d-flex align-items-center">
                <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm`}
                     style={{ 
                       width: '48px', 
                       height: '48px',
                       background: category.name === 'Arrays' 
                         ? 'linear-gradient(135deg, #28a745, #20c997)' 
                         : 'linear-gradient(135deg, #007bff, #6610f2)'
                     }}>
                  <i className={`fas ${category.name === 'Arrays' ? 'fa-layer-group' : 'fa-sort'} text-white`} 
                     style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className={`fw-bold mb-1 ${isDark ? 'text-light' : 'text-dark'}`} 
                      style={{ fontSize: '1.25rem' }}>
                    {category.name}
                  </h5>
                  <div className="d-flex align-items-center">
                    <span className={`badge ${isDark ? 'bg-success' : 'bg-success'} me-2`} 
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      {problems.length} {problems.length === 1 ? 'problem' : 'problems'}
                    </span>
                    <small className={`${isDark ? 'text-light' : 'text-muted'} opacity-75`}>
                      <i className="fas fa-clock me-1"></i>
                      ~{Math.ceil(problems.length * 0.5)}h
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body pt-0 flex-grow-1 d-flex flex-column">
              {problems.length === 0 ? (
                <div className="text-center py-5">
                  <i className={`fas fa-folder-open mb-3 ${isDark ? 'text-light' : 'text-muted'} opacity-50`} 
                     style={{ fontSize: '2.5rem' }}></i>
                  <p className={`${isDark ? 'text-light' : 'text-muted'} mb-0 fw-medium`}>No problems yet.</p>
                </div>
              ) : (
                <div className="flex-grow-1">
                  {problems.map((p, index) => (
                    <div
                      className={`d-flex justify-content-between align-items-center py-3 px-0 ${index !== problems.length - 1 ? 'border-bottom' : ''}`}
                      key={p.id}
                      style={{ 
                        borderBottomColor: isDark ? '#333' : '#e9ecef',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(40, 167, 69, 0.05)' : 'rgba(40, 167, 69, 0.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <div className="d-flex align-items-center flex-grow-1">
                        {user && (
                          <SolvedIndicator
                            problemId={p.id}
                            userId={user.id}
                            size="sm"
                          />
                        )}
                        <div className={`${user ? 'ms-3' : 'ms-0'} flex-grow-1`}>
                          <h6 className={`mb-1 fw-semibold ${isDark ? 'text-light' : 'text-dark'}`}
                              style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                            {p.title}
                          </h6>
                          <div className="d-flex align-items-center">
                            <span className={`badge ${isDark ? 'bg-secondary' : 'bg-light text-dark'} me-2`}
                                  style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                              #{index + 1}
                            </span>
                            <small className={`${isDark ? 'text-light' : 'text-muted'} opacity-75`}>
                              <i className="fas fa-clock me-1"></i>
                              30min
                            </small>
                          </div>
                        </div>
                      </div>
                      <Link
                        className={`btn btn-sm ${isDark ? 'btn-outline-success' : 'btn-success'} px-3 py-2 fw-medium`}
                        to={`/problems/${p.id}`}
                        style={{ 
                          borderRadius: '10px', 
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <i className="fas fa-play me-1"></i>
                        Solve
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Footer */}
            {problems.length > 0 && (
              <div className="card-footer border-0 bg-transparent pb-4 pt-2">
                <div className="text-center">
                  <div className={`d-inline-flex align-items-center px-3 py-2 rounded-pill ${isDark ? 'bg-dark' : 'bg-light'}`}
                       style={{ 
                         border: `1px solid ${isDark ? '#333' : '#e9ecef'}`,
                         fontSize: '0.85rem'
                       }}>
                    <i className="fas fa-clock me-2 text-success"></i>
                    <span className={`${isDark ? 'text-light' : 'text-muted'} fw-medium`}>
                      ~{Math.ceil(problems.length * 0.5)}h total
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
