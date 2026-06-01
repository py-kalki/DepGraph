'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LandingNavbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`modern-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="logo-box">
            <span>D</span>
          </div>
          DepGraph
        </Link>

        {/* Center Links */}
        <nav className="navbar-links" style={{ display: 'flex', gap: '2rem', padding: '0.5rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" className="nav-link" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Home</Link>
          <Link href="/features" className="nav-link" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Features</Link>
          <Link href="/pricing" className="nav-link" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Pricing</Link>
          <Link href="/docs" className="nav-link" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Documentation</Link>
          <Link href="/support" className="nav-link" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Contact Us</Link>
        </nav>

        {/* Right CTA */}
        <div className="navbar-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {session ? (
            <Link href="/dashboard" className="btn-premium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="nav-link hide-mobile" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                Sign In
              </Link>
              <Link href="/login" className="btn-premium" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
