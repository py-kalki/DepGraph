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
  { key: 'critical', label: 'Critical', color: '#E24B4A' },
  { key: 'high',     label: 'High',     color: '#EF9F27' },
  { key: 'medium',   label: 'Medium',   color: '#EAB308' },
  { key: 'low',      label: 'Low',      color: '#378ADD' },
  { key: 'healthy',  label: 'Healthy',  color: '#1D9E75' },
] as const;

export function RiskBreakdown({ criticalCount, highCount, mediumCount, lowCount, healthyCount }: Props) {
  const counts: Record<string, number> = { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount, healthy: healthyCount };
  const total = Object.values(counts).reduce((s, v) => s + v, 0);

  return (
    <div className="card hover-card" role="region" aria-label="Risk breakdown by level">
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>Risk Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {LEVELS.map(({ key, label, color }) => {
          const count = counts[key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ 
                width: '70px', 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '0.6875rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: color 
              }}>
                {label}
              </span>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${count} dependencies (${pct}%)`}
                style={{
                  flex: 1,
                  height: '4px',
                  background: 'rgba(255,255,255,0.05)',
                  position: 'relative'
                }}
              >
                <div
                  style={{ 
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0,
                    width: `${pct}%`, 
                    background: color,
                    transition: 'width 0.5s ease-out'
                  }}
                />
              </div>
              <span style={{ 
                width: '32px', 
                textAlign: 'right', 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '0.8125rem', 
                fontWeight: 600, 
                color: '#FFFFFF' 
              }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#666666', fontFamily: 'JetBrains Mono, monospace' }}>
        {total} dependencies total
      </p>
    </div>
  );
}
