'use client';

import Link from 'next/link';

const Crosshead = ({ style }: { style: React.CSSProperties }) => (
  <svg 
    width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{
      position: 'absolute',
      color: 'rgba(255,255,255,0.3)',
      ...style
    }}
  >
    <path d="M7.5 0V15M0 7.5H15" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-headline"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 5vw, 2rem)', // margin from the screen
        overflow: 'hidden',
        background: '#000000',
      }}
    >
      {/* Subtle Grid Background across the whole screen */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: 
            'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          backgroundPosition: 'center top',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      />

      {/* Colorful Gradient Glow (Vercel style) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          height: '600px',
          zIndex: 0,
          background: 'conic-gradient(from 180deg at 50% 100%, #1e3a8a 0deg, #0ea5e9 90deg, #10b981 180deg, #ef4444 270deg, #991b1b 360deg)',
          filter: 'blur(80px)',
          opacity: 0.5,
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }}
      />

      {/* The Grid Trap Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1160px',
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          marginTop: '60px', // clear navbar
          background: 'transparent',
        }}
      >
        {/* Crossheads at corners */}
        <Crosshead style={{ top: '-7.5px', left: '-7.5px' }} />
        <Crosshead style={{ top: '-7.5px', right: '-7.5px' }} />
        <Crosshead style={{ bottom: '-7.5px', left: '-7.5px' }} />
        <Crosshead style={{ bottom: '-7.5px', right: '-7.5px' }} />

        {/* Inner Content */}
        <div style={{ maxWidth: '900px', textAlign: 'center', padding: 'clamp(1rem, 5vw, 2rem)' }}>
          <h1
            id="hero-headline"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              marginBottom: '1.5rem',
            }}
          >
            Predict dependency failures before they reach production.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#888888',
              lineHeight: 1.6,
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
              fontWeight: 400,
            }}
          >
            DepGraph provides the developer tools and intelligence
            to build, scale, and secure a faster, more reliable supply chain.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#FFFFFF',
                color: '#000000',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Small triangle icon like Vercel */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L22 20H2L12 2Z" />
              </svg>
              Start Scanning
            </Link>

            <Link
              href="/r/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                background: '#111111',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'background 0.15s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#222222'}
              onMouseOut={(e) => e.currentTarget.style.background = '#111111'}
            >
              Get a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
