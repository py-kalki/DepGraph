import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Support — DepGraph',
  description: 'Get help with your DepGraph account, billing, or technical issues.',
};

export default function SupportPage() {
  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
        <div className="bg-radial-glow"></div>
        
        <section style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--brand-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Support
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
            How can we <span className="hero-title-accent">help you?</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Need help with your account, billing, or experiencing an issue? We're here to get you back on track.
          </p>
        </section>

        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            
            {/* Contact Email Block */}
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                ✉️
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Email Us</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                For account issues, billing questions, or enterprise inquiries, send us an email. We typically respond within 24 hours.
              </p>
              <a href="mailto:vedanshh.dev@gmail.com" className="btn-premium">
                vedanshh.dev@gmail.com
              </a>
            </div>

            {/* Documentation Block */}
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(29, 158, 117, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                📚
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Documentation</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Most questions about the CLI, GitHub Action setup, and API endpoints are answered in our docs.
              </p>
              <Link href="/docs" id="hero-cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none' }}>
                View Documentation
              </Link>
            </div>

          </div>

          {/* Common Issues Section */}
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>
            Common Troubleshooting
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#EF4444', marginBottom: '0.75rem' }}>
                GitHub Action fails with "401 Unauthorized"
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Ensure your <code>DEPGRAPH_API_KEY</code> secret is set correctly in your repository settings. If you recently downgraded from a Pro to a Free plan, your API keys have been automatically deactivated.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#EAB308', marginBottom: '0.75rem' }}>
                CLI says "Rate limited"
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Free plans are limited to 10 scans per day to prevent abuse. If you are scanning continuously in CI pipelines, please provide your API key or consider upgrading to a Pro plan for unlimited scans.
              </p>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#3B82F6', marginBottom: '0.75rem' }}>
                My project score isn't updating
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Project scores are heavily cached to respect npm and GitHub API rate limits. Scores are recomputed automatically every 24 hours. Pro users can force an immediate re-scan from the dashboard.
              </p>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </>
  );
}
