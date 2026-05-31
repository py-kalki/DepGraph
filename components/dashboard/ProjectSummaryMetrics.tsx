// =============================================================================
// DepGraph — ProjectSummaryMetrics
// Stat cards: total deps, critical, high, healthy counts.
// =============================================================================

interface Props {
  totalDeps: number;
  criticalCount: number;
  highCount: number;
  healthyCount: number;
}

interface MetricItem {
  label: string;
  value: number;
  color?: string;
}

export function ProjectSummaryMetrics({ totalDeps, criticalCount, highCount, healthyCount }: Props) {
  const metrics: MetricItem[] = [
    { label: 'Total Deps', value: totalDeps },
    { label: 'Critical', value: criticalCount, color: 'var(--color-critical)' },
    { label: 'High Risk', value: highCount, color: 'var(--color-high)' },
    { label: 'Healthy', value: healthyCount, color: 'var(--color-healthy)' },
  ];

  return (
    <div className="metrics-grid" role="region" aria-label="Project summary metrics">
      {metrics.map(({ label, value, color }) => (
        <div key={label} className="metric-card">
          <div
            className="metric-value mono"
            style={color ? { color } : undefined}
            aria-label={`${label}: ${value}`}
          >
            {value}
          </div>
          <div className="metric-label">{label}</div>
        </div>
      ))}
    </div>
  );
}
