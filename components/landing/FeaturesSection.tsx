'use client';

export default function FeaturesSection() {
  const FEATURES = [
    { 
      num: '01', 
      title: 'Health Scoring Engine', 
      desc: 'Every package receives a 0–100 score computed across 6 weighted dimensions: maintenance, bus factor, issue health, downloads, CVEs, and dependency freshness.' 
    },
    { 
      num: '02', 
      title: 'Abandonment Detection', 
      desc: 'Proprietary signals track commit cadence, issue response time, and maintainer activity to predict abandonment 6–12 months before it becomes obvious.' 
    },
    { 
      num: '03', 
      title: 'Supply Chain Monitoring', 
      desc: 'Real-time monitoring against OSV.dev, GitHub Advisory Database, and NVD. Get alerted the moment a CVE lands in your dependency tree.' 
    },
    { 
      num: '04', 
      title: 'Graph Visualization', 
      desc: 'Interactive force-directed graph rendering your entire dependency tree. Filter by risk level, drill into transitive chains, spot bottlenecks instantly.' 
    },
    { 
      num: '05', 
      title: 'Migration Intelligence', 
      desc: 'AI-powered suggestions for safer alternatives, automatically ranked by ecosystem adoption and compatibility.' 
    },
    { 
      num: '06', 
      title: 'CI/CD Integration', 
      desc: 'One-line GitHub Action. Fail builds on threshold breach, post risk summaries as PR comments, track score over time.' 
    },
  ];

  return (
    <section
      id="features"
      style={{
        padding: 'clamp(3rem, 6vw, 8rem) 1.25rem',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ marginBottom: '6rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.875rem',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#888888',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Platform Capabilities
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
              maxWidth: '800px',
              margin: '0 0 1.25rem 0',
            }}
          >
            Every dimension of dependency risk, in one place.
          </h2>
          <p style={{ color: '#888888', fontSize: '1.125rem', maxWidth: '600px', lineHeight: 1.6 }}>
            Built for developers who care about what ships to production. No fluff, just signals.
          </p>
        </div>

        {/* Stark Brutalist Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.num}
              className="hover-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '2.5rem',
                background: '#000000',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#666666',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                }}
              >
                {f.num} <span style={{ color: '#333333' }}>//</span>
              </div>
              
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  marginBottom: '1rem',
                }}
              >
                {f.title}
              </div>

              <div
                style={{
                  color: '#888888',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
