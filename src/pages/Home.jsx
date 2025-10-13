import ProblemList from '../components/ProblemList'
import { useTheme } from '../contexts/ThemeContext'
export default function Home() {
  const { isDark } = useTheme()
  return (
    <div className={`${isDark ? 'bg-dark text-light' : 'bg-light text-dark'} min-vh-100`}>
      <div className="container-fluid px-4 py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h1 className={`fw-bold mb-2 ${isDark ? 'text-light' : 'text-dark'}`}>
                  <i className="fas fa-code me-3 text-success"></i>
                  Blind 75 Problems
                </h1>
                <p className={`${isDark ? 'text-light' : 'text-muted'} mb-0`}>
                  Master the most important coding interview questions
                </p>
              </div>
              <div className="text-end">
                <div className={`badge bg-success fs-6 px-3 py-2 ${isDark ? 'text-dark' : 'text-white'}`}>
                  <i className="fas fa-trophy me-2"></i>75 Problems
                </div>
              </div>
            </div>
          </div>
        </div>
        <ProblemList />
      </div>
    </div>
  )
}