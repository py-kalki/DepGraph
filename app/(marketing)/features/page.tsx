import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import Link from 'next/link';

export const metadata = {
  title: 'Features — DepGraph',
  description: 'Predict dependency abandonment, protect your supply chain, and fix issues before they break your app.',
};

export default function FeaturesPage() {
  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="bg-radial-glow"></div>
        
        {/* Hero Header */}
        <section className="features-hero" aria-labelledby="features-title">
          <div className="container" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '4rem' }}>
            <h1 id="features-title" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
              Everything you need to <span className="hero-title-accent">predict failure.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              DepGraph combines health forecasting, supply chain monitoring, and automated migration paths in a single platform designed for developers.
            </p>
          </div>
        </section>

        {/* Features List */}
        <div className="container" style={{ paddingBottom: '8rem', maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
            
            {/* Feature 1: Health Engine */}
            <article className="glass-panel" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'rgba(55, 138, 221, 0.1)', color: '#378ADD', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(55, 138, 221, 0.2)' }}>
                  🔮 Predictive Health
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Health Score Engine</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Every dependency gets a daily 0-100 health score based on six signals: maintenance activity, bus factor, issue health, download trends, dependency freshness, and known CVEs.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li>✓ Spot 1-maintainer packages</li>
                  <li>✓ See download trend slopes</li>
                  <li>✓ View open critical issues</li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>node-forge</span>
                  <span style={{ color: '#EF9F27', fontWeight: 'bold' }}>24/100</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '0.5rem' }}>⚠️ 3 open critical CVEs</p>
                  <p style={{ marginBottom: '0.5rem' }}>⚠️ Bus factor: 1</p>
                  <p>↳ Known vulnerabilities unfixed for 14 months.</p>
                </div>
              </div>
            </article>

            {/* Feature 2: CLI */}
            <article className="glass-panel" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'rgba(29, 158, 117, 0.1)', color: '#1D9E75', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(29, 158, 117, 0.2)' }}>
                  ⚡ Zero Friction
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Zero-Install CLI</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Run <code>npx depgraph check</code> in any Node.js project to get an instant health report directly in your terminal. No login or configuration required.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Scans deep into your transitive graph to find hidden risks, outputting a color-coded table and a shareable web link to view the full report.
                </p>
              </div>
              <div style={{ background: '#0a0c10', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', order: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EAB308' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E' }} />
                </div>
                <p style={{ color: '#10B981', marginBottom: '1rem' }}>$ npx depgraph check</p>
                <p style={{ color: '#9CA3AF', marginBottom: '1rem' }}>DepGraph v1.0 — Scanning 247 dependencies...</p>
                <p style={{ color: '#3B82F6', marginBottom: '1rem' }}>Project Health Score: 71 / 100 ▓▓▓▓▓▓▓░░░</p>
                <p style={{ color: '#EF4444' }}>CRITICAL (2)</p>
              </div>
            </article>

            {/* Feature 3: CI/CD */}
            <article className="glass-panel" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  🛡️ Supply Chain Protection
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>CI/CD Integration</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Catch bad dependencies before they reach production. Our GitHub Action analyzes every Pull Request, commenting with a detailed score breakdown.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Set custom risk thresholds (e.g. <code>fail-on: critical</code>) to automatically block PRs that introduce unmaintained or compromised packages.
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontWeight: 600, color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>depgraph-bot commented</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Overall Score: 74/100 (↓ from 79)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', color: '#fff', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <span>Package</span><span>Score</span><span>Risk</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>axios@1.6.0</span><span>88</span><span style={{ color: '#1D9E75' }}>Low</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>left-pad@1.3.0</span><span>8</span><span style={{ color: '#E24B4A' }}>Critical ✗</span>
                </div>
              </div>
            </article>

            {/* Feature 4: Web Dashboard */}
            <article className="glass-panel" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'rgba(239, 159, 39, 0.1)', color: '#EF9F27', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(239, 159, 39, 0.2)' }}>
                  📈 Continuous Monitoring
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Proactive Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Connect your repositories and let DepGraph monitor them 24/7. Receive weekly email digests and instant alerts if a core dependency drops into the Critical risk band.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Use the dashboard to track historical health trends over 365 days and export SBOMs (Software Bill of Materials) for compliance.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', order: 1 }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239, 159, 39, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🔔</div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Alert: Score Drop</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>express dropped from 82 to 74</p>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(226, 75, 74, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚨</div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Critical Vulnerability</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>CVE-2026-1023 in lodash</p>
                  </div>
                </div>
              </div>
            </article>

          </div>
          
          {/* CTA Section */}
          <div style={{ textAlign: 'center', marginTop: '6rem', padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>Ready to secure your dependencies?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Join thousands of developers catching abandonment risks before they hit production.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/login" className="btn-premium">
                Start for free
              </Link>
              <Link href="/pricing" id="hero-cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none' }}>
                View Pricing
              </Link>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </>
  );
}
