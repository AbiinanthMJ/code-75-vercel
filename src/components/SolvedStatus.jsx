import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useTheme } from '../contexts/ThemeContext'

export default function SolvedStatus({ problemId, userId, onSolvedChange }) {
  const { isDark } = useTheme()
  const [isSolved, setIsSolved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !problemId) return setLoading(false)

    const checkSolved = async () => {
      try {
        const { data, error } = await supabase
          .from('solved_status')
          .select('id')
          .eq('user_id', userId)
          .eq('problem_id', problemId)
          .single()

        if (!error || error.code === 'PGRST116') {
          setIsSolved(!!data)
        } else {
          console.error('Error checking solved status:', error)
        }
      } catch (err) {
        console.error('Error checking solved status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSolved()
  }, [userId, problemId])

  const toggleSolved = async (solve) => {
    if (!userId || !problemId) return

    try {
      if (solve) {
        const { error } = await supabase.from('solved_status').insert({ 
          user_id: userId, 
          problem_id: problemId 
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('solved_status')
          .delete()
          .eq('user_id', userId)
          .eq('problem_id', problemId)
        if (error) throw error
      }
      setIsSolved(solve)
      onSolvedChange?.(solve)
    } catch (err) {
      console.error('Error updating solved status:', err)
      alert('Failed to update solved status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className={`${isDark ? 'text-light' : 'text-muted'}`}>Loading...</span>
      </div>
    )
  }

  return (
    <div className="solved-status">
      {isSolved ? (
        <button 
          className="btn btn-success btn-sm px-3 py-2" 
          onClick={() => toggleSolved(false)}
          style={{ 
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)'
            e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)'
          }}
        >
          <i className="fas fa-check-circle me-2"></i> 
          Solved
        </button>
      ) : (
        <button 
          className={`btn btn-outline-success btn-sm px-3 py-2 ${isDark ? 'border-success text-success' : ''}`}
          onClick={() => toggleSolved(true)}
          style={{ 
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            border: `2px solid ${isDark ? '#28a745' : '#28a745'}`,
            color: isDark ? '#28a745' : '#28a745'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#28a745'
            e.target.style.color = 'white'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.color = isDark ? '#28a745' : '#28a745'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          <i className="far fa-circle me-2"></i> 
          Mark Solved
        </button>
      )}
    </div>
  )
}

// ✅ Simple indicator version for lists
export function SolvedIndicator({ problemId, userId, size = 'sm' }) {
  const { isDark } = useTheme()
  const [isSolved, setIsSolved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !problemId) return setLoading(false)

    const checkSolved = async () => {
      try {
        const { data, error } = await supabase
          .from('solved_status')
          .select('id')
          .eq('user_id', userId)
          .eq('problem_id', problemId)
          .single()

        if (!error || error.code === 'PGRST116') {
          setIsSolved(!!data)
        } else {
          console.error('Error checking solved status:', error)
        }
      } catch (err) {
        console.error('Error checking solved status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSolved()
  }, [userId, problemId])

  if (loading) {
    return (
      <div className="spinner-border spinner-border-sm text-success" role="status" style={{ width: '16px', height: '16px' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    )
  }

  return isSolved ? (
    <i
      className={`fas fa-check-circle text-success ${size === 'lg' ? 'fs-5' : 'fs-6'}`}
      title="Problem solved"
      style={{ 
        filter: 'drop-shadow(0 0 3px rgba(40, 167, 69, 0.5))',
        animation: 'pulse 2s infinite'
      }}
    />
  ) : (
    <i
      className={`far fa-circle ${isDark ? 'text-light' : 'text-muted'} ${size === 'lg' ? 'fs-5' : 'fs-6'}`}
      title="Problem not solved"
      style={{ opacity: 0.6 }}
    />
  )
}
