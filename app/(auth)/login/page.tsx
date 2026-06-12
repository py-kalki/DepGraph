// =============================================================================
// DepGraph — Login Page (/login)
// Public page — GitHub OAuth entry point.
// Reads ?callbackUrl from the URL to redirect back (e.g. to a report page).
// =============================================================================

import type { Metadata } from 'next';
import { LoginButton } from '@/components/auth/LoginButton';
import Link from 'next/link';
import HoverCardEffect from '@/components/landing/HoverCardEffect';

export const metadata: Metadata = {
  title: 'Sign In — DepGraph',
  description: 'Sign in with GitHub to track your project dependency health.',
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  const safeCb = callbackUrl ?? '/dashboard';
  const isReportCallback = safeCb.startsWith('/r/');

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#000000',
      color: '#FFFFFF'
    }}>
      <HoverCardEffect />
      
      {/* Header */}
      <header style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'baseline', letterSpacing: '-0.02em' }}>
            <span style={{ fontWeight: 300, fontStyle: 'italic', marginRight: '0.05em' }}>dep</span>
            <span style={{ fontWeight: 800 }}>Graph</span>
          </div>
        </Link>
      </header>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        
        <div className="hover-card" style={{
          width: '100%',
          maxWidth: '420px',
          background: '#0A0A0A',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            {isReportCallback ? 'Save Your Report' : 'Access Intelligence'}
          </h1>
          
          <p style={{
            fontSize: '0.9375rem',
            color: '#888888',
            lineHeight: 1.6,
            marginBottom: '3rem'
          }}>
            {isReportCallback
              ? 'Sign in with GitHub to save this report to your dashboard and track it over time.'
              : 'Sign in to start tracking abandonment risk and health scores for your open-source dependencies.'
            }
          </p>

          {/* Pass callbackUrl so GitHub redirects back to the report */}
          <LoginButton callbackUrl={safeCb} />

          <div style={{
            marginTop: '3rem',
            fontSize: '0.8125rem',
            color: '#666666',
            lineHeight: 1.6
          }}>
            By signing in, you agree to our{' '}
            <Link href="/terms" style={{ color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms</Link> and{' '}
            <Link href="/privacy" style={{ color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </main>
  );
}
