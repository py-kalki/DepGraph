export const metadata = {
  title: 'Documentation — DepGraph',
  description: 'Welcome to the DepGraph documentation.',
};

export default function DocsIndex() {
  return (
    <div style={{ color: '#FFFFFF' }}>
      <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1.5rem', lineHeight: 1.05 }}>
        Welcome to DepGraph.
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#888888', lineHeight: 1.6, marginBottom: '4rem', maxWidth: '700px' }}>
        DepGraph is a dependency intelligence platform that gives developers real-time health scores, abandonment risk forecasts, and supply-chain integrity signals for every open-source library in their project.
      </p>
      
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        Core Products
      </h2>
      
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1px', 
          background: 'rgba(255,255,255,0.15)', 
          border: '1px solid rgba(255,255,255,0.15)',
          marginBottom: '5rem' 
        }}
      >
        <a href="/docs/cli" className="hover-card" style={{ display: 'block', padding: '2rem', background: '#000000', textDecoration: 'none' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>// CLI Guide</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#888888', lineHeight: 1.6 }}>Scan projects locally with zero configuration.</p>
        </a>
        <a href="/docs/action" className="hover-card" style={{ display: 'block', padding: '2rem', background: '#000000', textDecoration: 'none' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>// GitHub Action</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#888888', lineHeight: 1.6 }}>Automate health checks in your CI/CD pipelines.</p>
        </a>
        <a href="/docs/api" className="hover-card" style={{ display: 'block', padding: '2rem', background: '#000000', textDecoration: 'none' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>// API Reference</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#888888', lineHeight: 1.6 }}>Integrate DepGraph into your own internal tooling.</p>
        </a>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        Why DepGraph?
      </h2>
      <p style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '700px' }}>
        Unlike reactive tools (Snyk, Dependabot) that only alert after a vulnerability is published, DepGraph is <span style={{ color: '#FFFFFF', fontWeight: 500 }}>predictive</span> — surfacing libraries at risk of abandonment, maintainer compromise, or breaking changes <em>before</em> they become production emergencies.
      </p>
      
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1.25rem', textTransform: 'uppercase' }}>The Three Pillars</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <li style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
          <span style={{ position: 'absolute', left: 0, top: '-0.1rem', color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem' }}>+</span>
          <strong style={{ color: '#FFFFFF' }}>Predict:</strong> Health scores and abandonment risk for every dependency, updated daily.
        </li>
        <li style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
          <span style={{ position: 'absolute', left: 0, top: '-0.1rem', color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem' }}>+</span>
          <strong style={{ color: '#FFFFFF' }}>Protect:</strong> Supply chain integrity monitoring for suspicious maintainer behavior.
        </li>
        <li style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
          <span style={{ position: 'absolute', left: 0, top: '-0.1rem', color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem' }}>+</span>
          <strong style={{ color: '#FFFFFF' }}>Fix:</strong> Migration path generator with effort estimates and drop-in alternatives.
        </li>
      </ul>
    </div>
  );
}
