import { Editor } from '@monaco-editor/react'
import { useEffect, useState, useRef } from 'react'

const LANGUAGE_OPTIONS = [
  { id: 63, value: "javascript", label: "JavaScript (Node.js)" },
  { id: 62, value: "java", label: "Java" },
  { id: 54, value: "cpp", label: "C++" }
];

export default function CodeEditor({ code, setCode, language, setLanguage, onRun, running, height = '400px', className = '' }) {
  const containerRef = useRef(null)
  const [editorHeight, setEditorHeight] = useState(() => {
    // Initialize with a reasonable default based on viewport
    if (typeof window !== 'undefined') {
      const viewportHeight = window.innerHeight
      return Math.max(400, Math.floor(viewportHeight * 0.5))
    }
    return 400
  })
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    return false
  })

  useEffect(() => {
    const updateDimensions = () => {
      const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
      
      if (mobile) {
        // Mobile: use fixed height based on viewport
        const viewportHeight = window.innerHeight
        const mobileHeight = Math.min(350, Math.max(250, viewportHeight * 0.4))
        setEditorHeight(Math.floor(mobileHeight))
      } else {
        // Desktop: calculate based on container or use fallback
        if (containerRef.current) {
          // Try multiple parent levels to find the actual container
          let parent = containerRef.current.parentElement
          let attempts = 0
          while (parent && attempts < 3) {
            const rect = parent.getBoundingClientRect()
            const computedStyle = window.getComputedStyle(parent)
            const parentHeight = rect.height
            
            // Check if parent has a valid height
            if (parentHeight > 100 && computedStyle.height !== 'auto') {
              // Account for card header (~50px), padding, and margins
              const headerHeight = 50
              const padding = 24 // 12px top + 12px bottom
              const availableHeight = parentHeight - headerHeight - padding
              if (availableHeight > 300) {
                setEditorHeight(Math.floor(availableHeight))
                return
              }
            }
            parent = parent.parentElement
            attempts++
          }
          
          // If no valid parent found, try viewport-based calculation
          const viewportHeight = window.innerHeight
          // Calculate based on typical layout: header (80px) + problem panel + editor
          const availableViewport = viewportHeight - 80
          const calculatedHeight = Math.max(400, Math.floor(availableViewport * 0.6))
          setEditorHeight(calculatedHeight)
        } else {
          // Fallback to viewport calculation
          const viewportHeight = window.innerHeight
          const calculatedHeight = Math.max(400, Math.floor(viewportHeight * 0.5))
          setEditorHeight(calculatedHeight)
        }
      }
    }

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateDimensions, 50)

    // Update on resize
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', updateDimensions)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('orientationchange', updateDimensions)
    }
  }, [])

  // Separate effect for ResizeObserver (desktop only, after initial render)
  useEffect(() => {
    // Check if mobile at the start
    const checkIfMobile = () => {
      return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    
    if (checkIfMobile()) return

    let resizeObserver = null
    const timeoutId = setTimeout(() => {
      if (!containerRef.current || checkIfMobile()) return

      // Find the appropriate parent container to observe
      let targetParent = containerRef.current.parentElement
      let attempts = 0
      while (targetParent && attempts < 3) {
        const rect = targetParent.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(targetParent)
        if (rect.height > 100 && computedStyle.height !== 'auto') {
          // Capture the parent in a const for the observer
          const observedParent = targetParent
          resizeObserver = new ResizeObserver(() => {
            // Re-check mobile status in callback
            if (checkIfMobile() || !containerRef.current) return
            const rect = observedParent.getBoundingClientRect()
            if (rect.height > 100) {
              const headerHeight = 50
              const padding = 24
              const availableHeight = rect.height - headerHeight - padding
              if (availableHeight > 300) {
                setEditorHeight(Math.floor(availableHeight))
              }
            }
          })
          resizeObserver.observe(observedParent)
          break
        }
        targetParent = targetParent.parentElement
        attempts++
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [isMobile])

  return (
    <div 
      ref={containerRef}
      className={`card mb-3 ${className}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: isMobile ? 'auto' : className.includes('h-100') ? '100%' : 'auto',
        minHeight: isMobile ? `${editorHeight + 60}px` : '400px',
        maxHeight: isMobile ? 'none' : className.includes('h-100') ? '100%' : 'none'
      }}
    >
      <div className="card-header d-flex gap-2 align-items-center flex-shrink-0" style={{ padding: '8px 12px' }}>
        <select
          className="form-select form-select-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ fontSize: isMobile ? '12px' : '14px' }}
        >
          {LANGUAGE_OPTIONS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <button 
          className="btn btn-danger btn-sm ms-auto" 
          onClick={onRun} 
          disabled={running}
          style={{ fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '4px 8px' : '6px 12px' }}
        >
          {running ? 'Running…' : 'Run Code'}
        </button>
      </div>

      <div 
        className="card-body p-0" 
        style={{ 
          height: `${editorHeight}px`,
          minHeight: `${editorHeight}px`,
          maxHeight: `${editorHeight}px`,
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
            automaticLayout: false, // Always false to prevent issues
            scrollBeyondLastLine: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false
            },
            readOnly: false,
            domReadOnly: false,
            contextmenu: true,
            // Disable features that might use storage
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            // Mobile optimizations
            ...(isMobile && {
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 2
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
  if (language === 'java') return 62
  if (language === 'cpp') return 54
  return 63
}
