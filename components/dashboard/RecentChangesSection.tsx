// =============================================================================
// DepGraph — RecentChangesSection
// PRD §F-03: "Recent score changes (what got worse this week)"
// Compares two scans — shows deps that have gotten worse.
// In Week 3 we surface deps at high/critical risk as proxies for "got worse".
// =============================================================================

interface DepEntry {
  name: string;
  version: string | null;
  score: number;
  risk_level: string;
}

interface Props {
  deps: DepEntry[];
}

export function RecentChangesSection({ deps }: Props) {
  // Surface high + critical deps as likely recent concerns
  const concerning = deps
    .filter((d) => d.risk_level === 'critical' || d.risk_level === 'high')
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <div className="card" role="region" aria-label="Recent score changes">
      <div className="card-title">High Risk This Scan</div>
      {concerning.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-healthy)', fontWeight: 600 }}>
          ✓ No high-risk dependencies
        </div>
      ) : (
        <ul style={{ listStyle: 'none', marginTop: '0.75rem' }}>
          {concerning.map((dep) => (
            <li
              key={dep.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--bg-elevated)',
              }}
            >
              <span className="truncate" style={{ flex: 1, fontWeight: 500 }}>
                {dep.name}
                {dep.version && (
                  <span className="text-muted" style={{ marginLeft: '0.25rem', fontSize: '0.8125rem', fontWeight: 400 }}>
                    @{dep.version}
                  </span>
                )}
              </span>
              <span
                className={`risk-badge ${dep.risk_level}`}
                style={{ marginLeft: '0.75rem', flexShrink: 0 }}
                aria-label={`Risk level: ${dep.risk_level}`}
              >
                <span
                  className="risk-badge-dot"
                  style={{
                    background:
                      dep.risk_level === 'critical' ? 'var(--color-critical)' : 'var(--color-high)',
                  }}
                  aria-hidden="true"
                />
                {dep.risk_level}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
