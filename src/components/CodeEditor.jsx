import { Editor } from '@monaco-editor/react'
import { useState, useEffect, useRef } from 'react'

const LANGUAGE_OPTIONS = [
  { id: 63, value: "javascript", label: "JavaScript (Node.js)" },
  { id: 62, value: "java", label: "Java" }
]

export default function CodeEditor({ code, setCode, language, setLanguage, onRun, running, className = '' }) {
  const containerRef = useRef(null)
  const [editorHeight, setEditorHeight] = useState(400)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768
    setIsMobile(checkMobile())

    const updateHeight = () => {
      const mobile = checkMobile()
      setIsMobile(mobile)
      
      if (mobile) {
        // Mobile: use viewport height minus header, padding, and output area
        const vh = window.innerHeight
        // Account for: navbar (~60px), problem panel header (~100px), editor header (~50px), output area (~250px), padding (~40px)
        const mobileHeight = Math.max(250, Math.min(400, vh - 500))
        setEditorHeight(mobileHeight)
      } else {
        // Desktop: calculate based on container or viewport
        if (containerRef.current) {
          const container = containerRef.current.closest('.editor-panel')
          if (container) {
            const rect = container.getBoundingClientRect()
            if (rect.height > 200) {
              // Account for header, padding, and output area
              const availableHeight = rect.height - 300
              if (availableHeight > 300) {
                setEditorHeight(Math.min(600, availableHeight))
                return
              }
            }
          }
        }
        // Fallback to viewport calculation
        const vh = window.innerHeight
        setEditorHeight(Math.max(400, Math.min(600, Math.floor(vh * 0.5))))
      }
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)
    
    // Recalculate after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updateHeight, 100)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`card mb-3 ${className}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: isMobile ? 'auto' : '100%',
        minHeight: isMobile ? `${editorHeight + 60}px` : '400px'
      }}
    >
      <div className="card-header d-flex gap-2 align-items-center flex-wrap" style={{ flexShrink: 0, padding: isMobile ? '8px' : '12px' }}>
        <select
          className="form-select form-select-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            width: isMobile ? '100%' : 'auto', 
            minWidth: isMobile ? '100%' : '180px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          {LANGUAGE_OPTIONS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <button 
          className={`btn btn-primary ${isMobile ? 'btn-sm w-100 mt-2' : 'btn-sm ms-auto'}`} 
          onClick={onRun} 
          disabled={running}
          style={{ fontSize: isMobile ? '12px' : '14px' }}
        >
          {running ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Running...
            </>
          ) : (
            'Run Code'
          )}
        </button>
      </div>
      <div 
        className="card-body p-0" 
        style={{ 
          flex: isMobile ? 'none' : 1,
          minHeight: `${editorHeight}px`,
          height: `${editorHeight}px`,
          maxHeight: isMobile ? 'none' : `${editorHeight}px`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Editor
          height={`${editorHeight}px`}
          width="100%"
          defaultLanguage="javascript"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            fontSize: isMobile ? 12 : 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: !isMobile, // Disable on mobile to prevent issues
            scrollBeyondLastLine: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false
            },
            readOnly: false,
            contextmenu: !isMobile, // Disable context menu on mobile
            quickSuggestions: !isMobile, // Disable suggestions on mobile for better performance
            suggestOnTriggerCharacters: !isMobile,
            acceptSuggestionOnCommitCharacter: !isMobile,
            acceptSuggestionOnEnter: isMobile ? 'off' : 'on',
            // Mobile-specific optimizations
            ...(isMobile && {
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 2,
              renderWhitespace: 'none',
              occurrencesHighlight: false,
              selectionHighlight: false,
              renderLineHighlight: 'none'
            })
          }}
          loading={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: `${editorHeight}px`,
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
  const langMap = {
    'javascript': 63,
    'java': 62
  }
  return langMap[language] || 63
}
