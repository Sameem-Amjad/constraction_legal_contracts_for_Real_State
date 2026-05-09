import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>404</h1>
        <p style={{ color: '#6b7280' }}>Page not found.</p>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          Go home
        </Link>
      </body>
    </html>
  )
}
