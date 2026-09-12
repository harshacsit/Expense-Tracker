import React from 'react'

/**
 * ErrorBoundary — catches unhandled render errors and shows a friendly
 * error screen instead of a blank page. In dev mode it also prints the
 * full stack trace so you can debug quickly.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('FairShare ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0a0a0f',
          color: '#fff', fontFamily: 'Inter, sans-serif', padding: '24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px', maxWidth: '480px' }}>
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6070f5, #a855f7)', color: '#fff',
              fontWeight: 600, fontSize: '14px'
            }}
          >
            Reload App
          </button>
          {import.meta.env.DEV && (
            <pre style={{
              marginTop: '24px', padding: '16px', background: 'rgba(255,0,0,0.1)',
              border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', fontSize: '12px',
              color: 'rgba(255,80,80,0.9)', maxWidth: '640px', overflowX: 'auto', textAlign: 'left'
            }}>
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
