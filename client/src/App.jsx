import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>FenmoAI</h1>
        <p className="subtitle">System Dashboard</p>
      </header>

      <main className="main">
        <div className="card">
          <h2>System Health</h2>
          {loading ? (
            <p className="loading">Checking server status...</p>
          ) : health ? (
            <div className="health-grid">
              <div className="health-item">
                <span className="label">Status</span>
                <span className={`value status-${health.status}`}>
                  {health.status.toUpperCase()}
                </span>
              </div>
              <div className="health-item">
                <span className="label">Environment</span>
                <span className="value">{health.environment}</span>
              </div>
              <div className="health-item">
                <span className="label">Uptime</span>
                <span className="value">
                  {Math.floor(health.uptime)}s
                </span>
              </div>
              <div className="health-item">
                <span className="label">Node Version</span>
                <span className="value">{health.version}</span>
              </div>
              <div className="health-item">
                <span className="label">Memory (Heap Used)</span>
                <span className="value">
                  {health.memoryUsage?.heapUsed}
                </span>
              </div>
              <div className="health-item">
                <span className="label">Timestamp</span>
                <span className="value">
                  {new Date(health.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="error">Unable to reach server</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
