const STATS = [
  { value: '2.4M+', label: 'Packages scored' },
  { value: '18K+', label: 'Risks detected this week' },
  { value: '94%', label: 'Accuracy on abandoned packages' },
  { value: '30s', label: 'Average scan time' },
];

const INTEGRATIONS = [
  { 
    name: 'npm', 
    desc: 'Full npm ecosystem',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
  },
  { 
    name: 'GitHub', 
    desc: 'Repo activity analysis',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
  },
  { 
    name: 'OSV.dev', 
    desc: 'CVE database mapping',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  },
  { 
    name: 'CI/CD Pipelines', 
    desc: 'GitHub Actions, GitLab CI',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  },
];

export default function SocialProofSection() {
  return (
    <section
      style={{
        padding: '6rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.15)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        background: '#000000',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '6rem',
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.05em',
                  lineHeight: 1,
                  marginBottom: '0.75rem',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '1rem', color: '#888888', fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Works with your existing tools
          </p>
        </div>
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {INTEGRATIONS.map((i) => (
            <div
              key={i.name}
              className="hover-card"
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '2rem',
                background: '#000000',
              }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={1.5} style={{ flexShrink: 0 }}>
                {i.icon}
              </svg>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '0.1rem' }}>{i.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#888888' }}>{i.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
