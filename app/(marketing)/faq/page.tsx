import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import Link from 'next/link';

export const metadata = {
  title: 'FAQ — DepGraph',
  description: 'Frequently asked questions about DepGraph.',
};

export default function FAQPage() {
  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
        <div className="bg-radial-glow"></div>
        
        <section style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--brand-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            FAQ
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
            Frequently Asked <span className="hero-title-accent">Questions</span>
          </h1>
        </section>

        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <article className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                How does DepGraph calculate health scores?
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We analyze dozens of signals across three main areas: maintenance activity (commits, issues, bus factor) via the GitHub API, usage metrics (downloads, freshness) via the npm registry, and known vulnerabilities via OSV.dev. These are weighted to produce a single 0-100 score.
              </p>
            </article>

            <article className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                Does DepGraph support private repositories?
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Yes, private repository scanning and the GitHub Action are fully supported on the Pro and Team plans. Free plans are limited to public repositories. We only request the minimum required GitHub OAuth permissions to access your code.
              </p>
            </article>

            <article className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                How do I get an API key for the GitHub Action?
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                API keys are available to Pro and Team plan subscribers. You can generate one in your Account Settings after upgrading. Add it to your repository secrets as <code>DEPGRAPH_API_KEY</code> to enable CI/CD scanning.
              </p>
            </article>

            <article className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                Can I cancel my subscription at any time?
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Yes. You can cancel your subscription from your billing dashboard. You'll retain access to your plan's features until the end of your current billing cycle.
              </p>
            </article>

          </div>

          <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>Still have questions?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Our support team is here to help you get the most out of DepGraph.</p>
            <Link href="/support" className="btn-premium">
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
