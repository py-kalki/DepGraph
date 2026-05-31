// =============================================================================
// DepGraph — Login Page (/login)
// Public page — GitHub OAuth entry point.
// PRD §F-04: GitHub OAuth only (V1).
// =============================================================================

import type { Metadata } from 'next';
import { LoginButton } from '@/components/auth/LoginButton';

export const metadata: Metadata = {
  title: 'Sign In — DepGraph',
  description: 'Sign in with GitHub to track your project dependency health.',
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo" aria-label="DepGraph">
          Dep<span>Graph</span>
        </div>
        <p className="login-tagline">
          Dependency health scores &amp; abandonment risk for every npm package in your project.
        </p>

        <LoginButton />

        <p className="login-terms">
          By signing in you agree to our{' '}
          <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
