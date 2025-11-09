import { Editor } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'

const LANGUAGE_OPTIONS = [
  { id: 63, value: "javascript", label: "JavaScript (Node.js)" },
  { id: 62, value: "java", label: "Java" },
  { id: 54, value: "cpp", label: "C++" }
];

export default function CodeEditor({ code, setCode, language, setLanguage, onRun, running, height = '400px', className = '' }) {
  const editorContainerRef = useRef(null)
  const [editorHeight, setEditorHeight] = useState(400)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateEditorSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      if (!editorContainerRef.current) return
      
      const container = editorContainerRef.current
      const rect = container.getBoundingClientRect()
      
      // Set fixed height on mobile to prevent infinite scroll
      if (mobile) {
        setEditorHeight(300) // Fixed height for mobile
      } else if (rect.height > 0) {
        // Use container height on desktop
        const newHeight = Math.max(300, rect.height - 10)
        setEditorHeight(newHeight)
      }
    }

    // Initial check after component mounts
    updateEditorSize()
    window.addEventListener('resize', updateEditorSize)

    return () => {
      window.removeEventListener('resize', updateEditorSize)
    }
  }, [])

  // Separate effect for ResizeObserver after ref is available
  useEffect(() => {
    if (!editorContainerRef.current || isMobile) return

    const resizeObserver = new ResizeObserver(() => {
      if (!editorContainerRef.current) return
      const rect = editorContainerRef.current.getBoundingClientRect()
      if (rect.height > 0 && !isMobile) {
        setEditorHeight(Math.max(300, rect.height - 10))
      }
    })

    resizeObserver.observe(editorContainerRef.current)

    return () => {
      resizeObserver.disconnect()
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
        className="card-body p-0 flex-grow-1" 
        style={{ 
          minHeight: isMobile ? `${editorHeight}px` : 0,
          maxHeight: isMobile ? `${editorHeight}px` : 'none',
          height: isMobile ? `${editorHeight}px` : '100%',
          overflow: 'hidden',
          position: 'relative'
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
          loading={<div style={{ padding: '20px', textAlign: 'center' }}>Loading editor...</div>}
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
