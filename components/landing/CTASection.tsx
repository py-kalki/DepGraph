import Link from 'next/link';

export default function CTASection() {
  return (
    <section
      style={{
        padding: '8rem 1.5rem',
        background: '#0D0D0D',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background graph nodes effect */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {[
          { x: '10%', y: '20%', size: 6, opacity: 0.15 },
          { x: '20%', y: '70%', size: 4, opacity: 0.1 },
          { x: '30%', y: '40%', size: 8, opacity: 0.12 },
          { x: '45%', y: '80%', size: 5, opacity: 0.08 },
          { x: '60%', y: '30%', size: 6, opacity: 0.1 },
          { x: '70%', y: '65%', size: 4, opacity: 0.12 },
          { x: '80%', y: '20%', size: 7, opacity: 0.1 },
          { x: '90%', y: '55%', size: 5, opacity: 0.08 },
          { x: '15%', y: '50%', size: 3, opacity: 0.15 },
          { x: '85%', y: '40%', size: 4, opacity: 0.1 },
        ].map((n, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: n.x, top: n.y,
              width: `${n.size}px`, height: `${n.size}px`,
              borderRadius: '50%',
              background: '#6C63FF',
              opacity: n.opacity,
            }}
          />
        ))}
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px', height: '300px',
            background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '0.3rem 0.875rem',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#6C63FF',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
          }}
        >
          Get started today
        </div>

        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}
        >
          Stop discovering dependency problems in production.
        </h2>

        <p
          style={{
            fontSize: '1.0625rem',
            color: '#71717A',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}
        >
          Scan your project in under 30 seconds. No signup required for the first scan.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard"
            id="final-cta-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              background: '#6C63FF',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 0 0 1px rgba(108,99,255,0.4), 0 8px 32px rgba(108,99,255,0.3)',
            }}
          >
            Run Free Scan
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </Link>
          <Link
            href="/r/demo"
            id="final-cta-demo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              background: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            View Example Report
          </Link>
        </div>

        <div style={{ marginTop: '2rem', fontSize: '0.8125rem', color: '#52525B' }}>
          Free forever for public repos · No credit card required · Results in 30 seconds
        </div>
      </div>
    </section>
  );
}
