import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TerminalAnimation from '../components/TerminalAnimation'
import CodeEditor, { languageToJudge0Id } from '../components/CodeEditor'
import TestResults from '../components/TestResults'
import SolvedStatus from '../components/SolvedStatus'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function ProblemPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [code, setCode] = useState('// Write your solution here\n')
  const [language, setLanguage] = useState('javascript')
  const [runLoading, setRunLoading] = useState(false)
  const [runResults, setRunResults] = useState([])
  const [leftPanelWidth, setLeftPanelWidth] = useState(40)
  const [isSolved, setIsSolved] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isResizing = useRef(false)

  const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY?.trim()
  const judgeApi = 'https://judge0-ce.p.rapidapi.com'

  useEffect(() => {
    let ignore = false
    supabase.from('problems')
      .select('id, title, description, example, steps, categories(name)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!ignore) {
          if (error) setError(error.message)
          else setProblem(data)
          setLoading(false)
        }
      })
    return () => { ignore = true }
  }, [id])

  useEffect(() => {
    if (language === 'java') {
      setCode(`class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        System.out.println("Java code is working!");
    }
}`)
    } else if (language === 'javascript') {
      setCode(`// Test your code here
console.log("Hello World!");
console.log("JavaScript is working!");
console.log("Current time:", new Date().toLocaleTimeString());`)
    }
  }, [language])
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return // Don't enable resize on mobile
    
    const move = e => {
      if (!isResizing.current) return
      const container = document.querySelector('.leetcode-layout')
      if (!container) return
      const newWidth = ((e.clientX - container.getBoundingClientRect().left) / container.offsetWidth) * 100
      setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 70))
    }
    const up = () => { isResizing.current = false; document.body.style.cursor = 'default'; document.body.style.userSelect = 'auto' }
    if (isResizing.current) {
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isResizing.current, isMobile])
  const handleMouseDown = () => { if (!isMobile) isResizing.current = true }

  const wrapSource = (src, lang) => {
    if (lang === 'java') return src
    if (lang === 'javascript') return src
    return src
  }

  const runAll = async () => {
    if (!rapidKey) {
      setRunResults([{ output: 'RapidAPI key missing. Please add VITE_RAPIDAPI_KEY to your .env file', hasError: true }])
      return
    }
    
    setRunLoading(true)
    setRunResults([])
    const languageId = languageToJudge0Id(language)

    try {
      console.log('Running code:', code)
      console.log('Language ID:', languageId)
      console.log('RapidAPI Key exists:', !!rapidKey)
      
      const res = await fetch(`${judgeApi}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': rapidKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' 
        },
        body: JSON.stringify({ 
          source_code: code, 
          language_id: languageId, 
          stdin: '',
          wait: true,
          base64_encoded: false
        })
      })
      
      console.log('Response status:', res.status)
      console.log('Response headers:', res.headers)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`)
      }
      
      const data = await res.json()
      console.log('Full API Response:', data)
      
      const stdout = data.stdout || ''
      const stderr = data.stderr || ''
      const compile_output = data.compile_output || ''
      const status = data.status
      
      console.log('Parsed data:', { stdout, stderr, compile_output, status })
      
      // Check for compilation errors
      if (compile_output) {
        console.log('Compilation error detected')
        setRunResults([{ output: `Compilation Error:\n${compile_output}`, hasError: true }])
      }
      // Check for runtime errors
      else if (stderr) {
        console.log('Runtime error detected')
        setRunResults([{ output: `Runtime Error:\n${stderr}`, hasError: true }])
      }
      // Check if execution was successful
      else if (status && status.id === 3) {
        console.log('Execution successful')
        setRunResults([{ output: stdout || 'Code executed successfully with no output', hasError: false }])
      }
      // Other status codes (timeout, etc.)
      else if (status && status.id !== 3) {
        const statusMessages = {
          1: 'In Queue',
          2: 'Processing', 
          3: 'Accepted',
          4: 'Runtime Error',
          5: 'Time Limit Exceeded',
          6: 'Compilation Error',
          7: 'Wrong Answer',
          8: 'Memory Limit Exceeded',
          9: 'Output Limit Exceeded',
          10: 'Internal Error'
        }
        console.log('Execution status:', status.id, statusMessages[status.id])
        setRunResults([{ output: `Execution Status: ${statusMessages[status.id] || 'Unknown status'} (ID: ${status.id})`, hasError: true }])
      }
      // Fallback - show whatever output we have
      else {
        console.log('Fallback case - showing raw output')
        setRunResults([{ output: stdout || 'No output produced', hasError: false }])
      }
    } catch (error) {
      console.error('Execution error:', error)
      setRunResults([{ output: `Error: ${error.message}`, hasError: true }])
    }

    setRunLoading(false)
  }

  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${isDark ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className={`${isDark ? 'text-light' : 'text-muted'}`}>Loading problem...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDark ? 'bg-dark' : 'bg-light'}`}>
        <div className="alert alert-danger border-0 shadow-sm" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }
  
  if (!problem) {
    return (
      <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDark ? 'bg-dark' : 'bg-light'}`}>
        <div className="text-center">
          <i className="fas fa-search mb-3" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
          <h4 className={`${isDark ? 'text-light' : 'text-dark'}`}>Problem not found</h4>
          <Link className="btn btn-success" to="/">← Back to Problems</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`leetcode-layout ${isDark ? 'bg-dark' : 'bg-light'}`} 
         style={{ 
           display: 'flex', 
           flexDirection: isMobile ? 'column' : 'row',
           height: isMobile ? 'auto' : 'calc(100vh - 80px)',
           minHeight: isMobile ? '100vh' : 'calc(100vh - 80px)',
           overflow: isMobile ? 'visible' : 'hidden'
         }}>
      <div className="problem-panel" style={{ 
        width: isMobile ? '100%' : `${leftPanelWidth}%`, 
        minWidth: isMobile ? '100%' : 300, 
        maxWidth: isMobile ? '100%' : '70%', 
        borderRight: isMobile ? 'none' : `1px solid ${isDark ? '#333' : '#e1e4e8'}`,
        borderBottom: isMobile ? `1px solid ${isDark ? '#333' : '#e1e4e8'}` : 'none',
        overflow: 'auto', 
        backgroundColor: isDark ? '#1a1a1a' : '#f6f8fa',
        maxHeight: isMobile ? '50vh' : 'none',
        height: isMobile ? 'auto' : '100%'
      }}>
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <h3 className={`mb-0 me-3 ${isDark ? 'text-light' : 'text-dark'}`}>
                <i className="fas fa-code me-2 text-success"></i>
                {problem.title}
              </h3>
              {user && <SolvedStatus problemId={id} userId={user.id} onSolvedChange={setIsSolved} />}
            </div>
            <Link 
              className={`btn ${isDark ? 'btn-outline-light' : 'btn-outline-secondary'} btn-sm`} 
              to="/"
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-arrow-left me-1"></i> Back
            </Link>
          </div>
          
          {problem.categories?.name && (
            <div className="mb-4">
              <span className={`badge ${isDark ? 'bg-success' : 'bg-primary'} fs-6 px-3 py-2`}>
                <i className="fas fa-tag me-1"></i>
                {problem.categories.name}
              </span>
            </div>
          )}
          
          <div className={`card mb-4 border-0 shadow-sm ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <div className="card-body">
              <h5 className={`fw-bold mb-3 ${isDark ? 'text-light' : 'text-dark'}`}>
                <i className="fas fa-file-text me-2 text-success"></i>Description
              </h5>
              <p className={`${isDark ? 'text-light' : 'text-dark'}`} style={{ whiteSpace:'pre-wrap', lineHeight: '1.6' }}>
                {problem.description}
              </p>
            </div>
          </div>
          
          {problem.example && (
            <div className={`card mb-4 border-0 shadow-sm ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}>
              <div className="card-body">
                <h5 className={`fw-bold mb-3 ${isDark ? 'text-light' : 'text-dark'}`}>
                  <i className="fas fa-code me-2 text-success"></i>Example
                </h5>
                <pre className={`${isDark ? 'bg-dark text-success' : 'bg-light text-dark'} p-3 rounded border`}
                     style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {problem.example}
                </pre>
              </div>
            </div>
          )}
          
          <div className="mb-3">
            <h5 className={`fw-bold mb-3 ${isDark ? 'text-light' : 'text-dark'}`}>
              <i className="fas fa-play me-2 text-success"></i>Animation
            </h5>
            <TerminalAnimation steps={problem.steps || []} />
          </div>
        </div>
      </div>

      {!isMobile && (
        <div className="resize-handle" onMouseDown={handleMouseDown} style={{ 
          width:4, 
          cursor:'col-resize', 
          flexShrink:0, 
          background: isDark ? '#333' : '#e1e4e8' 
        }} />
      )}

      <div className="editor-panel" style={{ 
        flex: isMobile ? 'none' : 1, 
        width: isMobile ? '100%' : 'auto',
        minWidth: isMobile ? '100%' : 400, 
        display:'flex', 
        flexDirection:'column', 
        background: isDark ? '#1a1a1a' : '#fff',
        height: isMobile ? 'auto' : '100%',
        overflow: isMobile ? 'visible' : 'hidden'
      }}>
        <div className={`${isMobile ? 'p-2' : 'p-3'} d-flex flex-column`} style={{ 
          height: isMobile ? 'auto' : '100%',
          minHeight: isMobile ? 'auto' : '600px'
        }}>
          <div className={isMobile ? 'mb-3' : 'flex-grow-1 mb-3'} style={{ 
            minHeight: isMobile ? '300px' : '400px',
            height: isMobile ? 'auto' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              language={language} 
              setLanguage={setLanguage} 
              onRun={runAll} 
              running={runLoading} 
              className="" 
            />
          </div>
          <div className={isMobile ? '' : 'flex-grow-1'} style={{ 
            minHeight: isMobile ? '200px' : '200px', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <TestResults results={runResults} loading={runLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
