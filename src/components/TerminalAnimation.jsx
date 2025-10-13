import { useEffect, useRef, useState, useMemo } from 'react'

export default function TerminalAnimation({ steps = [], intervalMs = 1000 }) {
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1 = normal speed, 0.5 = half speed, 2 = double speed
  const timerRef = useRef(null)

  useEffect(() => {
    if (!playing) return
    const dynamicInterval = Math.max(100, intervalMs / speed) // Minimum 100ms interval
    timerRef.current = setInterval(() => {
      setIdx(i => {
        if (i + 1 >= steps.length) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, dynamicInterval)
    return () => clearInterval(timerRef.current)
  }, [playing, steps.length, intervalMs, speed])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const step = steps[idx] || {}

  const renderedArray = useMemo(() => {
    if (!step.array) return null
    const hl = new Set(step.highlight || [])
    return `[ ${step.array.map((v, i) => hl.has(i) ? `[${v}]` : v).join(' ')} ]`
  }, [step.array, step.highlight])

  const renderedList = useMemo(() => {
    if (typeof step.list === 'string') return step.list
    if (Array.isArray(step.list)) return step.list.join(' -> ') + ' -> null'
    return null
  }, [step.list])

  const renderedTree = typeof step.tree === 'string' ? step.tree : null

  const reset = () => { setIdx(0); setPlaying(false) }
  const next = () => setIdx(i => Math.min(i + 1, steps.length - 1))
  const prev = () => setIdx(i => Math.max(i - 1, 0))
  const restart = () => { setIdx(0); setPlaying(true) }

  return (
    <div>
      <div className="d-flex gap-2 mb-2 flex-wrap">
        <button className="btn btn-success btn-sm" onClick={() => setPlaying(true)} disabled={playing || idx >= steps.length - 1}>
          {playing ? 'Playing...' : 'Play'}
        </button>
        <button className="btn btn-warning btn-sm" onClick={() => setPlaying(false)} disabled={!playing}>Pause</button>
        <button className="btn btn-info btn-sm" onClick={restart} disabled={playing}>Restart</button>
        <button className="btn btn-secondary btn-sm" onClick={prev} disabled={idx === 0}>Prev</button>
        <button className="btn btn-secondary btn-sm" onClick={next} disabled={idx >= steps.length - 1}>Next</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={reset} disabled={idx === 0}>Reset</button>
        <span className="ms-auto text-muted small">Step {steps.length ? idx + 1 : 0} / {steps.length}</span>
      </div>

      <div className="d-flex gap-2 mb-2 align-items-center flex-wrap">
        <span className="text-muted small">Speed:</span>
        <div className="d-flex align-items-center gap-2" style={{ minWidth: '150px' }}>
          <input
            type="range"
            className="form-range"
            min="0.1"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span className="text-muted small" style={{ minWidth: '35px' }}>
            {speed.toFixed(1)}x
          </span>
        </div>
      </div>

      <div style={{
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        padding: '12px',
        borderRadius: '6px',
        minHeight: '180px',
        border: '1px solid #30363d',
        whiteSpace: 'pre-wrap'
      }}>
        <div style={{ color: '#58a6ff' }}>$ {step.message || ''}</div>
        {renderedArray && <div>{renderedArray}</div>}
        {renderedList && <div>{renderedList}</div>}
        {renderedTree && <div>{renderedTree}</div>}
        {step.output && <div>output: {String(step.output)}</div>}
      </div>
    </div>
  )
}
