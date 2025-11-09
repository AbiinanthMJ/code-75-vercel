import { Editor } from '@monaco-editor/react'
import { useEffect, useState } from 'react'

const LANGUAGE_OPTIONS = [
  { id: 63, value: "javascript", label: "JavaScript (Node.js)" },
  { id: 62, value: "java", label: "Java" },
  { id: 54, value: "cpp", label: "C++" }
];

export default function CodeEditor({ code, setCode, language, setLanguage, onRun, running, height = '400px', className = '' }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={`card mb-3 ${className}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

      <div className="card-body p-0 flex-grow-1" style={{ minHeight: 0, height: isMobile ? '400px' : '100%' }}>
        <Editor
          height={isMobile ? '400px' : '100%'}
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
            automaticLayout: !isMobile, // Disable automaticLayout on mobile to prevent infinite scroll
            scrollBeyondLastLine: false
          }}
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
