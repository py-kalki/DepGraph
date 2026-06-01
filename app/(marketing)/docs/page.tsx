export const metadata = {
  title: 'Documentation — DepGraph',
  description: 'Welcome to the DepGraph documentation.',
};

export default function DocsIndex() {
  return (
    <>
      <h1>Welcome to DepGraph</h1>
      <p>
        DepGraph is a dependency intelligence platform that gives developers real-time health scores, abandonment risk forecasts, and supply-chain integrity signals for every open-source library in their project.
      </p>
      
      <h2>Core Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '3rem' }}>
        <a href="/docs/cli" style={{ display: 'block', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem' }}>⚡ CLI Guide</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Scan projects locally with zero configuration.</p>
        </a>
        <a href="/docs/action" style={{ display: 'block', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem' }}>🛡️ GitHub Action</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Automate health checks in your CI/CD pipelines.</p>
        </a>
        <a href="/docs/api" style={{ display: 'block', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem' }}>🔧 API Reference</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Integrate DepGraph into your own internal tooling.</p>
        </a>
      </div>

      <h2>Why DepGraph?</h2>
      <p>
        Unlike reactive tools (Snyk, Dependabot) that only alert after a vulnerability is published, DepGraph is <em>predictive</em> — surfacing libraries at risk of abandonment, maintainer compromise, or breaking changes <em>before</em> they become production emergencies.
      </p>
      
      <h3>The Three Pillars</h3>
      <ul>
        <li><strong>Predict:</strong> Health scores and abandonment risk for every dependency, updated daily.</li>
        <li><strong>Protect:</strong> Supply chain integrity monitoring for suspicious maintainer behavior.</li>
        <li><strong>Fix:</strong> Migration path generator with effort estimates and drop-in alternatives.</li>
      </ul>
    </>
  );
}
