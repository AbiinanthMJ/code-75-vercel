import { Editor } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'

const LANGUAGE_OPTIONS = [
  { id: 63, value: "javascript", label: "JavaScript (Node.js)" },
  { id: 62, value: "java", label: "Java" },
  { id: 54, value: "cpp", label: "C++" }
];

export default function CodeEditor({ code, setCode, language, setLanguage, onRun, running, height = '400px', className = '' }) {
  const editorContainerRef = useRef(null)
  const [editorHeight, setEditorHeight] = useState(() => {
    // Initialize with viewport-based height
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth < 768
      if (mobile) return 300
      const viewportHeight = window.innerHeight
      return Math.max(400, Math.min(600, viewportHeight * 0.5))
    }
    return 400
  })
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })

  useEffect(() => {
    // Immediately set initial state
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    
    if (mobile) {
      setEditorHeight(300)
    } else {
      // Desktop: use viewport-based initial height
      const viewportHeight = window.innerHeight
      const initialHeight = Math.max(400, Math.min(600, viewportHeight * 0.5))
      setEditorHeight(initialHeight)
    }

    const updateEditorSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      if (mobile) {
        setEditorHeight(300)
      } else {
        // For desktop, try to get container height
        if (editorContainerRef.current) {
          const container = editorContainerRef.current
          const rect = container.getBoundingClientRect()
          
          if (rect.height > 100) {
            // Container has a valid height
            setEditorHeight(Math.max(400, rect.height - 10))
          }
        } else {
          // Fallback to viewport calculation
          const viewportHeight = window.innerHeight
          const estimatedHeight = Math.max(400, Math.min(600, viewportHeight * 0.5))
          setEditorHeight(estimatedHeight)
        }
      }
    }

    // Update after a short delay to allow DOM to settle
    const timeoutId = setTimeout(updateEditorSize, 100)
    window.addEventListener('resize', updateEditorSize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateEditorSize)
    }
  }, [])

  // Separate effect for ResizeObserver after ref is available (desktop only)
  useEffect(() => {
    if (isMobile) return
    
    let resizeObserver = null
    
    // Wait a bit for ref to be available
    const timeoutId = setTimeout(() => {
      if (!editorContainerRef.current) return

      resizeObserver = new ResizeObserver(() => {
        if (!editorContainerRef.current || isMobile) return
        const rect = editorContainerRef.current.getBoundingClientRect()
        if (rect.height > 100) {
          setEditorHeight(Math.max(400, rect.height - 10))
        }
      })

      resizeObserver.observe(editorContainerRef.current)
    }, 200)

    return () => {
      clearTimeout(timeoutId)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [isMobile])

  return (
    <div className={`card mb-3 ${className}`} style={{ 
      height: isMobile ? 'auto' : '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="card-header d-flex gap-2 align-items-center flex-shrink-0">
        <select
          className="form-select form-select-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGE_OPTIONS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <button className="btn btn-danger btn-sm ms-auto" onClick={onRun} disabled={running}>
          {running ? 'Running…' : 'Run Code'}
        </button>
      </div>

      <div 
        ref={editorContainerRef}
        className="card-body p-0" 
        style={{ 
          minHeight: `${editorHeight}px`,
          height: `${editorHeight}px`,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e1e1e'
        }}
      >
        <Editor
          height={editorHeight}
          width="100%"
          defaultLanguage="javascript"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={v => setCode(v || '')}
          options={{
            fontSize: isMobile ? 12 : 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: !isMobile, // Disable on mobile to prevent infinite scroll
            scrollBeyondLastLine: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false
            },
            // Prevent touch gestures that cause scrolling issues
            disableLayerHinting: isMobile,
            // Optimize for mobile performance
            renderWhitespace: isMobile ? 'none' : 'selection',
            lineNumbersMinChars: isMobile ? 2 : 3
          }}
          loading={
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              height: `${editorHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1e1e1e',
              color: '#cccccc'
            }}>
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  )
}

export function languageToJudge0Id(language) {
  if (language === 'java') return 62
  if (language === 'cpp') return 54
  return 63
}
