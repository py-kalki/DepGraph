// =============================================================================
// DepGraph — RiskBreakdown
// Horizontal bar chart of dep counts by risk level.
// PRD §F-03: "Dependency breakdown by risk level".
// WCAG: all rows include text labels — never color-only.
// =============================================================================

interface Props {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  healthyCount: number;
}

const LEVELS = [
  { key: 'critical', label: 'Critical', cssVar: 'var(--color-critical)' },
  { key: 'high',     label: 'High',     cssVar: 'var(--color-high)' },
  { key: 'medium',   label: 'Medium',   cssVar: 'var(--color-medium)' },
  { key: 'low',      label: 'Low',      cssVar: 'var(--color-low)' },
  { key: 'healthy',  label: 'Healthy',  cssVar: 'var(--color-healthy)' },
] as const;

export function RiskBreakdown({ criticalCount, highCount, mediumCount, lowCount, healthyCount }: Props) {
  const counts: Record<string, number> = { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount, healthy: healthyCount };
  const total = Object.values(counts).reduce((s, v) => s + v, 0);

  return (
    <div className="card" role="region" aria-label="Risk breakdown by level">
      <div className="card-title">Risk Breakdown</div>
      <div className="risk-breakdown-wrap" style={{ marginTop: '1rem' }}>
        {LEVELS.map(({ key, label, cssVar }) => {
          const count = counts[key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="risk-breakdown-row">
              <span className="risk-breakdown-label" style={{ color: cssVar }}>
                {label}
              </span>
              <div
                className="risk-breakdown-bar"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${count} dependencies (${pct}%)`}
              >
                <div
                  className="risk-breakdown-fill"
                  style={{ width: `${pct}%`, background: cssVar }}
                />
              </div>
              <span className="risk-breakdown-count">{count}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted" style={{ marginTop: '0.75rem' }}>
        {total} dependencies total
      </p>
    </div>
  );
}
