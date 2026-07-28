'use client';

/**
 * Root error boundary.
 *
 * Catches failures in the root layout itself. Because it replaces the whole
 * document it must render its own <html>/<body>. Providing this also stops
 * Next falling back to the pages-router `_error` document during prerender.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070709',
          color: '#f4f4f8',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#de181b',
              margin: 0,
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.75rem 0 0' }}>
            We hit an unexpected error
          </h1>
          <p style={{ color: '#7a8499', margin: '0.75rem 0 1.75rem' }}>
            Please try again. If the problem persists, contact the RFT360 team.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#de181b',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.7rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
