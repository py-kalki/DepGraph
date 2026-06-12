export default function ProblemSection() {
  const levels = [
    { label: 'Your Application', count: '1 app', desc: 'Your production codebase', indent: 0 },
    { label: 'Direct Dependencies', count: '~20 packages', desc: 'Packages listed in package.json', indent: 1 },
    { label: 'Transitive Dependencies', count: '200–800 packages', desc: 'Dependencies of your dependencies', indent: 2 },
    { label: 'Deep Transitive', count: '500+ more packages', desc: 'The invisible layer nobody audits', indent: 3, alert: true },
  ];

  const risks = [
    {
      title: 'Abandonment Risk',
      desc: 'Maintainers stop committing. No releases. No security patches.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
    {
      title: 'Maintainer Compromise',
      desc: 'A legitimate package account is hijacked. Malicious code ships as a routine update.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    },
    {
      title: 'Supply Chain Attacks',
      desc: 'Typosquatting and dependency confusion. Malicious PRs merged by inattentive maintainers.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    },
    {
      title: 'Hidden Technical Debt',
      desc: 'Packages locked to old major versions. Migration costs compound every quarter.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
  ];

  return (
    <section
      id="problem"
      style={{
        padding: 'clamp(3rem, 6vw, 8rem) 1.25rem',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
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
            The Hidden Problem
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
              maxWidth: '800px',
              margin: '0 auto 1.25rem',
            }}
          >
            Your dependency graph is bigger than you think.
          </h2>
          <p style={{ color: '#888888', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            20 direct dependencies can balloon to 500+ transitive packages. Most of them are never reviewed.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          {/* Dependency Tree Visualization (Monolithic & Stark) */}
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '2.5rem',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2rem', fontWeight: 600 }}>
              Dependency Tree
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {levels.map((l, i) => (
                <div
                  key={l.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    paddingLeft: `${l.indent * 1.5}rem`,
                    position: 'relative',
                  }}
                >
                  {i < levels.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: `${l.indent * 1.5 + 0.45}rem`,
                      top: '1.5rem',
                      bottom: '-1.5rem',
                      width: '1px',
                      background: 'rgba(255,255,255,0.15)',
                    }} />
                  )}
                  
                  {/* Stark dot indicator */}
                  <div
                    style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: l.alert ? '#FFFFFF' : 'transparent',
                      border: '1px solid #FFFFFF',
                      flexShrink: 0, marginTop: '0.25rem',
                      boxShadow: l.alert ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                    }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px dotted rgba(255,255,255,0.15)', paddingBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: l.alert ? 700 : 500, color: '#FFFFFF' }}>{l.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: l.alert ? '#FFFFFF' : '#888888' }}>
                        {l.count}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.5rem' }}>{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '3rem',
                padding: '1.25rem',
                background: '#FFFFFF',
                color: '#000000',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              73% OF VULNERABILITIES COME FROM TRANSITIVE DEPS
            </div>
          </div>

          {/* Risk cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {risks.map((r) => (
              <div
                key={r.title}
                className="hover-card"
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.75rem',
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ color: '#FFFFFF', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    {r.icon}
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#888888', lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
