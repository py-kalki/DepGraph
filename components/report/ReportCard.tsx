// =============================================================================
// DepGraph — ReportCard
// Public shareable report summary card — brutalist black/white theme.
// =============================================================================

import type { DbScanReport } from '@/lib/types';

interface Props {
  report: DbScanReport;
}

function scoreToRisk(score: number): string {
  if (score < 20) return 'CRITICAL';
  if (score < 40) return 'HIGH';
  if (score < 60) return 'MEDIUM';
  if (score < 75) return 'LOW';
  return 'HEALTHY';
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#FF3B30',
  HIGH:     '#FF9500',
  MEDIUM:   '#FFCC00',
  LOW:      '#34AADC',
  HEALTHY:  '#4CD964',
};

export function ReportCard({ report }: Props) {
  const risk = scoreToRisk(report.overall_score);
  const color = RISK_COLORS[risk];

  const criticalCount = report.critical_count ?? 0;
  const highCount     = report.high_count ?? 0;
  const mediumCount   = report.dep_scores.filter((d) => d.risk_level === 'medium').length;
  const lowCount      = report.dep_scores.filter((d) => d.risk_level === 'low').length;
  const healthyCount  = report.dep_scores.filter((d) => d.risk_level === 'healthy').length;

  const shareUrl  = `https://depgraph.vedanshh.dev/r/${report.share_token}`;
  const createdAt = new Date(report.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const totalForBar = report.total_deps || 1;
  const bars = [
    { label: 'CRITICAL', count: criticalCount, color: RISK_COLORS.CRITICAL },
    { label: 'HIGH',     count: highCount,     color: RISK_COLORS.HIGH },
    { label: 'MEDIUM',   count: mediumCount,   color: RISK_COLORS.MEDIUM },
    { label: 'LOW',      count: lowCount,      color: RISK_COLORS.LOW },
    { label: 'HEALTHY',  count: healthyCount,  color: RISK_COLORS.HEALTHY },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Dependency Health Report
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Scanned {createdAt}
        </h1>
        <p style={{ color: '#666666', fontSize: '0.8125rem' }}>
          {report.total_deps} dependencies analyzed
        </p>
        <div style={{
          marginTop: '0.75rem',
          display: 'inline-block',
          padding: '0.4rem 0.75rem',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#666666',
          fontSize: '0.75rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {shareUrl}
        </div>
      </div>

      {/* Score hero */}
      <div style={{
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '2.5rem',
        textAlign: 'center',
        marginBottom: '1rem',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '5rem',
          fontWeight: 700,
          lineHeight: 1,
          color,
          letterSpacing: '-0.04em',
        }}>
          {report.overall_score}
          <span style={{ fontSize: '2rem', color: '#444444', fontWeight: 400 }}>/100</span>
        </div>
        <div style={{
          marginTop: '0.75rem',
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          border: `1px solid ${color}`,
          color,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}>
          {risk} RISK
        </div>
      </div>

      {/* Stats + breakdown grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Summary metrics */}
        <div style={{ border: '1px solid rgba(255,255,255,0.15)', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666666', marginBottom: '1.25rem' }}>
            Summary
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {[
              { label: 'Total Deps', value: report.total_deps, color: '#FFFFFF' },
              { label: 'Critical',   value: criticalCount,     color: RISK_COLORS.CRITICAL },
              { label: 'High Risk',  value: highCount,         color: RISK_COLORS.HIGH },
              { label: 'Healthy',    value: healthyCount,      color: RISK_COLORS.HEALTHY },
            ].map(({ label, value, color: c }) => (
              <div key={label}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: c, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk breakdown */}
        <div style={{ border: '1px solid rgba(255,255,255,0.15)', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666666', marginBottom: '1.25rem' }}>
            Risk Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {bars.map(({ label, count, color: c }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 30px', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c, letterSpacing: '0.05em' }}>{label}</span>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: `${(count / totalForBar) * 100}%`, background: c, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#FFFFFF', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#444444' }}>{report.total_deps} dependencies total</p>
        </div>
      </div>
    </div>
  );
}
