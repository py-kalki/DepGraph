'use client';

const FEATURES = [
  'Predictive health scoring',
  'Abandonment detection',
  'Supply chain monitoring',
  'Migration guidance',
  'CI/CD integration',
  'Known CVEs',
  'Historical trends',
  'Team collaboration',
];

const TOOLS = [
  { name: 'DepGraph', highlight: true },
  { name: 'Snyk', highlight: false },
  { name: 'Dependabot', highlight: false },
  { name: 'npm audit', highlight: false },
];

// true = full, false = partial, null = none
const MATRIX: (boolean | null)[][] = [
  [true, false, false, false],  // Predictive scoring
  [true, false, false, false],  // Abandonment detection
  [true, true,  false, false],  // Supply chain
  [true, false, false, false],  // Migration guidance
  [true, true,  true,  false],  // CI/CD
  [true, true,  true,  true ],  // CVEs
  [true, false, true,  false],  // Historical trends
  [true, true,  false, false],  // Team collab
];

function Check({ v }: { v: boolean | null }) {
  if (v === true) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  );
  if (v === false) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
  return <span style={{ color: '#555555', fontSize: '0.875rem' }}>—</span>;
}

export default function ComparisonSection() {
  return (
    <section
      id="comparison"
      style={{
        padding: 'clamp(3rem, 6vw, 8rem) 1.25rem',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
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
            Comparison
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
            }}
          >
            Why DepGraph is different.
          </h2>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div
          style={{
            background: '#000000',
            border: '1px solid rgba(255,255,255,0.15)',
            borderBottom: 'none', // Will be handled by last row
            minWidth: '600px',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr repeat(4, 140px)',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div style={{ padding: '1.5rem' }} />
            {TOOLS.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: '1.5rem 0 1rem',
                  textAlign: 'center',
                  background: t.highlight ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderLeft: t.highlight ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                  borderRight: t.highlight ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    fontWeight: t.highlight ? 800 : 600,
                    fontSize: '0.9375rem',
                    color: t.highlight ? '#FFFFFF' : '#888888',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t.name}
                </div>
                {t.highlight && (
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.15rem 0.5rem',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Recommended
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURES.map((feat, fi) => (
            <div
              key={feat}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr repeat(4, 140px)',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#888888', fontWeight: 600 }}>
                {feat}
              </div>
              {MATRIX[fi].map((v, ti) => (
                <div
                  key={ti}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 0',
                    background: TOOLS[ti].highlight ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderLeft: TOOLS[ti].highlight ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                    borderRight: TOOLS[ti].highlight ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}
                >
                  <Check v={v} />
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
