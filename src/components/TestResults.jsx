import { useTheme } from '../contexts/ThemeContext'

function ResultDisplay({ result, isDark }) {
  return (
    <div className={`p-4 ${isDark ? 'bg-dark' : 'bg-light'} border-0`}
         style={{ 
           borderRadius: '10px',
           border: result.hasError 
             ? `2px solid ${isDark ? '#dc3545' : '#dc3545'}` 
             : `2px solid ${isDark ? '#28a745' : '#28a745'}`,
           backgroundColor: isDark 
             ? (result.hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)')
             : (result.hasError ? 'rgba(220, 53, 69, 0.05)' : 'rgba(40, 167, 69, 0.05)')
         }}>
      {result.hasError ? (
        <div>
          <h6 className="text-danger mb-3 d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Execution Error
          </h6>
          <pre className={`mb-0 text-wrap p-3 rounded ${isDark ? 'bg-dark text-danger' : 'bg-light text-danger'}`}
               style={{ 
                 fontFamily: 'monospace', 
                 fontSize: '0.9rem',
                 border: `1px solid ${isDark ? '#dc3545' : '#dc3545'}`,
                 whiteSpace: 'pre-wrap',
                 wordBreak: 'break-word',
                 maxHeight: '300px',
                 overflow: 'auto'
               }}>
            {result.output}
          </pre>
        </div>
      ) : (
        <div>
          <h6 className="text-success mb-3 d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            Output
          </h6>
          <pre className={`mb-0 text-wrap p-3 rounded ${isDark ? 'bg-dark text-success' : 'bg-light text-success'}`}
               style={{ 
                 fontFamily: 'monospace', 
                 fontSize: '0.9rem',
                 border: `1px solid ${isDark ? '#28a745' : '#28a745'}`,
                 whiteSpace: 'pre-wrap',
                 wordBreak: 'break-word',
                 maxHeight: '300px',
                 overflow: 'auto'
               }}>
            {result.output}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function TestResults({ results = [], loading = false }) {
  const { isDark } = useTheme()

  return (
    <div className={`card border-0 shadow-sm h-100 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={`card-header border-0 flex-shrink-0 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <h5 className="mb-0 d-flex align-items-center">
          <i className="fas fa-terminal me-2 text-success"></i>
          Code Output
        </h5>
      </div>
      <div className="card-body p-0 flex-grow-1" style={{ overflow: 'auto', minHeight: 0 }}>
        {loading ? (
          <div className={`p-4 text-center ${isDark ? 'text-light' : 'text-muted'}`}>
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mb-0">Executing your code...</p>
          </div>
        ) : results.length === 0 ? (
          <div className={`p-4 text-center ${isDark ? 'text-light' : 'text-muted'}`}>
            <i className="fas fa-code mb-3" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
            <p className="mb-0">Click "Run Code" to execute your program</p>
          </div>
        ) : (
          <div className="p-3">
            {results.map((result, i) => (
              <ResultDisplay key={i} result={result} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
