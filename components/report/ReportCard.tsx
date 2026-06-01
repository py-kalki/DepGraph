// =============================================================================
// DepGraph — ReportCard
// Public shareable report summary card.
// Shown on /report/[shareToken] — no auth required.
// =============================================================================

import { RiskBreakdown } from '@/components/dashboard/RiskBreakdown';
import { ProjectSummaryMetrics } from '@/components/dashboard/ProjectSummaryMetrics';
import type { DbScanReport } from '@/lib/types';

interface Props {
  report: DbScanReport;
}

function scoreToRisk(score: number): string {
  if (score < 20) return 'critical';
  if (score < 40) return 'high';
  if (score < 60) return 'medium';
  if (score < 75) return 'low';
  return 'healthy';
}

const RISK_COLORS: Record<string, string> = {
  critical: '#E24B4A', high: '#EF9F27', medium: '#EAB308',
  low: '#378ADD', healthy: '#1D9E75',
};

export function ReportCard({ report }: Props) {
  const risk = scoreToRisk(report.overall_score);
  const color = RISK_COLORS[risk];

  const mediumCount = report.dep_scores.filter((d) => d.risk_level === 'medium').length;
  const lowCount    = report.dep_scores.filter((d) => d.risk_level === 'low').length;
  const healthyCount = report.dep_scores.filter((d) => d.risk_level === 'healthy').length;

  const shareUrl = `https://depgraph.vedanshh.dev/r/${report.share_token}`;
  const createdAt = new Date(report.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div>
      {/* Header */}
      <div className="report-header">
        <h1 className="report-title">
          Dependency Health Report
        </h1>
        <p className="report-meta">Scanned {createdAt} · {report.total_deps} dependencies</p>
        <div className="report-share-url" aria-label="Share URL">
          {shareUrl}
        </div>
      </div>

      {/* Score hero */}
      <div
        className="card"
        style={{ textAlign: 'center', padding: '2rem', marginBottom: '1rem' }}
        role="region"
        aria-label={`Overall health score: ${report.overall_score} out of 100`}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '4rem',
            fontWeight: 700,
            lineHeight: 1,
            color,
          }}
        >
          {report.overall_score}
          <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/100</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'capitalize', fontWeight: 500 }}>
          {risk} risk
        </p>
      </div>

      {/* Metrics + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <ProjectSummaryMetrics
          totalDeps={report.total_deps}
          criticalCount={report.critical_count}
          highCount={report.high_count}
          healthyCount={healthyCount}
        />
        <RiskBreakdown
          criticalCount={report.critical_count}
          highCount={report.high_count}
          mediumCount={mediumCount}
          lowCount={lowCount}
          healthyCount={healthyCount}
        />
      </div>
    </div>
  );
}
