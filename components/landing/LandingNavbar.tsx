'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function LandingNavbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing',  href: '#pricing'  },
    { label: 'Docs',     href: '/docs'     },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
          background: scrolled ? 'rgba(0,0,0,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1160px', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 1.25rem', height: '60px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center',
              textDecoration: 'none', color: '#FFFFFF',
              fontSize: '1.35rem', letterSpacing: '-0.04em',
            }}
          >
            <span style={{ fontWeight: 300, fontStyle: 'italic' }}>dep</span>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-sans)' }}>Graph</span>
          </Link>

          {/* Desktop nav links */}
          <nav
            className="landing-nav-links"
            style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontSize: '0.875rem', fontWeight: 600, color: '#888888',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#888888'; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div
            className="landing-nav-links"
            style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}
          >
            <a
              href="https://github.com/py-kalki/DepGraph"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.875rem', fontWeight: 600,
                color: '#888888', textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#888888'; }}
            >
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>

            {session ? (
              <Link
                href="/dashboard"
                style={{
                  padding: '0.5rem 1.25rem',
                  background: '#FFFFFF', color: '#000000',
                  fontWeight: 700, fontSize: '0.875rem',
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                Dashboard
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  href="/login"
                  className="landing-nav-links"
                  style={{
                    fontSize: '0.875rem', fontWeight: 600,
                    color: '#888888', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#888888'; }}
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: '#FFFFFF', color: '#000000',
                    fontWeight: 700, fontSize: '0.875rem',
                    textDecoration: 'none', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="landing-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none',
              background: 'none', border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#FFFFFF',
            }}
          >
            {menuOpen ? (
              // X icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              // Hamburger
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div
            style={{
              background: 'rgba(0,0,0,0.97)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '0.875rem 0.5rem',
                  fontSize: '1rem', fontWeight: 600, color: '#FFFFFF',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/py-kalki/DepGraph"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.875rem 0.5rem',
                fontSize: '1rem', fontWeight: 600, color: '#888888',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              GitHub
            </a>
            <div style={{ paddingTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    flex: 1, textAlign: 'center',
                    padding: '0.75rem 1.25rem',
                    background: '#FFFFFF', color: '#000000',
                    fontWeight: 700, fontSize: '0.9375rem',
                    textDecoration: 'none',
                  }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      flex: 1, textAlign: 'center',
                      padding: '0.75rem 1.25rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF', fontWeight: 600, fontSize: '0.9375rem',
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      flex: 1, textAlign: 'center',
                      padding: '0.75rem 1.25rem',
                      background: '#FFFFFF', color: '#000000',
                      fontWeight: 700, fontSize: '0.9375rem',
                      textDecoration: 'none',
                    }}
                  >
                    Start Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Inline responsive styles for navbar */}
      <style>{`
        @media (max-width: 767px) {
          .landing-nav-links { display: none !important; }
          .landing-hamburger { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </>
  );
}
