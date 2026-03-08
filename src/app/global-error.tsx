'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
              Something went seriously wrong
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {error.message || 'A critical error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 500,
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
