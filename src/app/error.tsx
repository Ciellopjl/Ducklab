'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#020403',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo deu errado</h2>
      <p style={{ color: '#888', marginBottom: '2rem', maxWidth: '400px' }}>
        {error.message || 'Ocorreu um erro inesperado.'}
      </p>
      <button
        onClick={reset}
        style={{
          background: '#00EB69',
          color: '#000',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '50px',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
