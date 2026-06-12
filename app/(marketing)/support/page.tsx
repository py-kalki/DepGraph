import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Support — DepGraph',
  description: 'Get help with your DepGraph account, billing, or technical issues.',
};

export default function SupportPage() {
  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar />
      
      <main style={{ flex: 1, padding: '8rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1.5rem', lineHeight: 1.05 }}>
          Support.
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#888888', lineHeight: 1.6, marginBottom: '4rem', maxWidth: '600px' }}>
          Need help with your account, billing, or experiencing a technical issue? We're here to get you back on track.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '5rem' }}>
          
          <div className="hover-card" style={{ background: '#0A0A0A', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Email Us</h2>
            <p style={{ color: '#888888', marginBottom: '2.5rem', lineHeight: 1.6, flex: 1 }}>
              For account issues, billing questions, or enterprise inquiries. We typically respond within 24 hours.
            </p>
            <a href="mailto:support@depgraph.vedanshh.dev" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#000000', padding: '0.875rem 1.5rem', fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.01em', textDecoration: 'none', transition: 'opacity 0.2s' }}>
              support@depgraph.vedanshh.dev
            </a>
          </div>

          <div className="hover-card" style={{ background: '#0A0A0A', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Documentation</h2>
            <p style={{ color: '#888888', marginBottom: '2.5rem', lineHeight: 1.6, flex: 1 }}>
              Most questions about the CLI, GitHub Action setup, and API endpoints are answered in our docs.
            </p>
            <Link href="/docs" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '0.875rem 1.5rem', fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.01em', textDecoration: 'none', transition: 'border-color 0.2s' }}>
              View Documentation
            </Link>
          </div>

        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          Common Troubleshooting
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              GitHub Action fails with "401 Unauthorized"
            </h3>
            <p style={{ color: '#888888', lineHeight: 1.6 }}>
              Ensure your <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>DEPGRAPH_API_KEY</code> secret is set correctly in your repository settings. If you recently downgraded from a Pro to a Free plan, your API keys have been automatically deactivated.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              CLI says "Rate limited"
            </h3>
            <p style={{ color: '#888888', lineHeight: 1.6 }}>
              Free plans are limited to 10 scans per day to prevent abuse. If you are scanning continuously in CI pipelines, please provide your API key or consider upgrading to a Pro plan for unlimited scans.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              My project score isn't updating
            </h3>
            <p style={{ color: '#888888', lineHeight: 1.6 }}>
              Project scores are heavily cached to respect npm and GitHub API rate limits. Scores are recomputed automatically every 24 hours. Pro users can force an immediate re-scan from the dashboard.
            </p>
          </div>
        </div>

      </main>

      <FooterSection />
    </div>
  );
}
