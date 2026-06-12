const DEPS = [
  { name: 'event-stream', version: '3.3.4', score: 12, risk: 'CRITICAL', riskColor: '#E24B4A', lastCommit: '4y ago', maintainers: 0, cves: 2 },
  { name: 'moment',       version: '2.29.4', score: 38, risk: 'HIGH',     riskColor: '#EF9F27', lastCommit: '1y ago', maintainers: 1, cves: 0 },
  { name: 'request',      version: '2.88.2', score: 22, risk: 'CRITICAL', riskColor: '#E24B4A', lastCommit: '5y ago', maintainers: 0, cves: 3 },
  { name: 'express',      version: '4.18.2', score: 81, risk: 'LOW',      riskColor: '#378ADD', lastCommit: '2mo ago', maintainers: 4, cves: 0 },
  { name: 'lodash',       version: '4.17.21', score: 65, risk: 'MEDIUM',   riskColor: '#EAB308', lastCommit: '8mo ago', maintainers: 2, cves: 1 },
  { name: 'colors',       version: '1.4.0',  score: 29, risk: 'HIGH',     riskColor: '#EF9F27', lastCommit: '2y ago', maintainers: 1, cves: 0 },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '3px' }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color, minWidth: '24px', textAlign: 'right', fontWeight: 700 }}>
        {score}
      </span>
    </div>
  );
}

export default function ShowcaseSection() {
  return (
    <section
      id="showcase"
      style={{
        padding: 'clamp(4rem, 8vw, 7rem) 1.25rem',
        background: '#0D0D0D',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.3rem 0.875rem',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6C63FF',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Product Showcase
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              lineHeight: 1.15,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            What your dashboard looks like.
          </h2>
        </div>

        {/* Fake Dashboard — horizontal scroll on mobile */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '20px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
        <div
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            overflow: 'hidden',
            minWidth: '680px',
          }}
        >
          {/* Dashboard top bar */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1.5rem',
              background: '#171717',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E24B4A', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF9F27', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#52525B' }}>
              depgraph.dev/dashboard/my-project
            </div>
            <div />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '480px' }}>
            {/* Sidebar */}
            <div
              style={{
                background: '#0F0F0F',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                padding: '1.5rem 1rem',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.5rem' }}>
                DepGraph
              </div>
              {['Overview', 'Dependencies', 'Vulnerabilities', 'History', 'Settings'].map((item, i) => (
                <div
                  key={item}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    color: i === 0 ? '#FFFFFF' : '#71717A',
                    background: i === 0 ? 'rgba(108,99,255,0.15)' : 'transparent',
                    marginBottom: '0.25rem',
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {item}
                </div>
              ))}
              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#52525B', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Project</div>
                <div style={{ fontSize: '0.8125rem', color: '#A1A1AA', fontWeight: 600 }}>my-saas-app</div>
                <div style={{ fontSize: '0.75rem', color: '#52525B' }}>312 packages scanned</div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Score + metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    background: '#0F0F0F',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    minWidth: '120px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Health Score</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.5rem', fontWeight: 800, color: '#EF9F27', lineHeight: 1 }}>42</div>
                  <div style={{ fontSize: '0.7rem', color: '#EF9F27', marginTop: '0.25rem' }}>HIGH RISK</div>
                </div>
                {[
                  { label: 'Critical', value: '2', color: '#E24B4A' },
                  { label: 'High Risk', value: '5', color: '#EF9F27' },
                  { label: 'Healthy', value: '285', color: '#1D9E75' },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      padding: '1.25rem',
                      background: '#0F0F0F',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{m.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.75rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Deps table */}
              <div
                style={{
                  background: '#0F0F0F',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 100px 1fr 100px 80px',
                    padding: '0.625rem 1rem',
                    background: '#0D0D0D',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#52525B',
                  }}
                >
                  <span>Package</span>
                  <span>Risk</span>
                  <span>Score</span>
                  <span>Last Commit</span>
                  <span>CVEs</span>
                </div>
                {DEPS.map((dep) => (
                  <div
                    key={dep.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 100px 1fr 100px 80px',
                      padding: '0.625rem 1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>{dep.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#52525B' }}>{dep.version}</div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          color: dep.riskColor,
                          background: `${dep.riskColor}15`,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '5px',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {dep.risk}
                      </span>
                    </div>
                    <div style={{ paddingRight: '1.5rem' }}>
                      <ScoreBar score={dep.score} color={dep.riskColor} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#71717A', fontFamily: 'JetBrains Mono, monospace' }}>{dep.lastCommit}</div>
                    <div style={{ fontSize: '0.75rem', color: dep.cves > 0 ? '#E24B4A' : '#52525B', fontFamily: 'JetBrains Mono, monospace', fontWeight: dep.cves > 0 ? 700 : 400 }}>
                      {dep.cves > 0 ? `⚠ ${dep.cves}` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
