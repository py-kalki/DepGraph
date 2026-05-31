// =============================================================================
// DepGraph — CriticalDepsSection
// PRD §F-03: "Top 5 critical dependencies (action required)"
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

export function CriticalDepsSection({ deps }: Props) {
  const critical = deps
    .filter((d) => d.risk_level === 'critical')
    .sort((a, b) => a.score - b.score) // worst first
    .slice(0, 5);

  if (critical.length === 0) {
    return (
      <div className="card" role="region" aria-label="Critical dependencies">
        <div className="card-title">Critical Dependencies</div>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-healthy)', fontWeight: 600 }}>
          ✓ No critical dependencies
        </div>
      </div>
    );
  }

  return (
    <div className="card" role="region" aria-label="Critical dependencies — action required">
      <div className="card-header">
        <div className="card-title">Critical Dependencies</div>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-critical)',
            fontWeight: 600,
            background: 'rgba(226,75,74,0.1)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
          }}
          aria-label={`${critical.length} critical dependencies`}
        >
          {critical.length} require action
        </span>
      </div>

      <div>
        {critical.map((dep) => (
          <div key={dep.name} className="critical-dep-row">
            <div
              className="critical-dep-score mono"
              aria-label={`Score: ${dep.score}`}
            >
              {dep.score}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="critical-dep-name truncate">
                {dep.name}
                {dep.version && (
                  <span className="text-muted" style={{ marginLeft: '0.25rem', fontSize: '0.8125rem', fontWeight: 400 }}>
                    @{dep.version}
                  </span>
                )}
              </div>
              <div className="critical-dep-reason">Risk level: Critical — review immediately</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
