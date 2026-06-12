// =============================================================================
// DepGraph — Dashboard Home (/dashboard)
// Server Component — fetches data directly from DB, passes to Client Components.
// PRD §F-03: Project Health Score, Risk Breakdown, Top 5 Critical, Recent Changes.
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserProjects } from '@/lib/db/queries/projects';
import { getProjectScanHistory } from '@/lib/db/queries/scans';
import { getProjectHistory } from '@/lib/db/queries/history';

import { ScoreGauge }             from '@/components/dashboard/ScoreGauge';
import { TrendCard }              from '@/components/dashboard/TrendCard';
import { RiskBreakdown }          from '@/components/dashboard/RiskBreakdown';
import { CriticalDepsSection }    from '@/components/dashboard/CriticalDepsSection';
import { RecentChangesSection }   from '@/components/dashboard/RecentChangesSection';
import { ProjectSummaryMetrics }  from '@/components/dashboard/ProjectSummaryMetrics';
import { DependenciesTable }      from '@/components/deps/DependenciesTable';
import { EmptyState }             from '@/components/ui/EmptyState';
import { GaugeSkeleton }          from '@/components/ui/LoadingSkeleton';
import HoverCardEffect            from '@/components/landing/HoverCardEffect';
import { Package, Search }        from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard — DepGraph',
  description: 'View your project dependency health scores and risk breakdown.',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session!.userId;
  const { project: projectIdParam } = await searchParams;

  const projects = await getUserProjects(userId);

  // No projects — show empty state
  if (projects.length === 0) {
    return (
      <EmptyState
        IconComponent={Package}
        title="No projects yet"
        description="Connect a GitHub repository or create a project for CLI scanning."
        actionLabel="Add Project"
        actionHref="/new"
      />
    );
  }

  // Use the project from ?project= param, else the most recent
  const project = projects.find(p => p.id === projectIdParam) ?? projects[0];
  const scans = await getProjectScanHistory(project.id, 1);
  const latestScan = scans[0] ?? null;

  if (!latestScan) {
    return (
      <EmptyState
        IconComponent={Search}
        title="No scans yet"
        description={`Project "${project.name}" has no scans. Run 'npx depgraph-scanner check' to create your first report.`}
      />
    );
  }

  const history = await getProjectHistory(project.id, 30);

  // Compute risk counts from dep_scores
  const depScores = latestScan.dep_scores ?? [];
  const criticalCount  = depScores.filter((d) => d.risk_level === 'critical').length;
  const highCount      = depScores.filter((d) => d.risk_level === 'high').length;
  const mediumCount    = depScores.filter((d) => d.risk_level === 'medium').length;
  const lowCount       = depScores.filter((d) => d.risk_level === 'low').length;
  const healthyCount   = depScores.filter((d) => d.risk_level === 'healthy').length;

  return (
    <>
      <HoverCardEffect />
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{project.name}</h1>
        <p className="text-sm text-muted">
          Last scanned{' '}
          {latestScan.created_at
            ? new Date(latestScan.created_at as string).toLocaleDateString()
            : 'unknown'}
          {' · '}{latestScan.total_deps} dependencies
        </p>
      </div>

      {/* Top row: gauge + trend + risk breakdown */}
      <div className="dashboard-grid-top">
        <div className="card" style={{ padding: 0 }}>
          <Suspense fallback={<GaugeSkeleton />}>
            <ScoreGauge score={latestScan.overall_score} />
          </Suspense>
        </div>

        <TrendCard score={latestScan.overall_score} history={history} />

        <RiskBreakdown
          criticalCount={criticalCount}
          highCount={highCount}
          mediumCount={mediumCount}
          lowCount={lowCount}
          healthyCount={healthyCount}
        />
      </div>

      {/* Summary metrics */}
      <div style={{ marginBottom: '1rem' }}>
        <ProjectSummaryMetrics
          totalDeps={latestScan.total_deps}
          criticalCount={criticalCount}
          highCount={highCount}
          healthyCount={healthyCount}
        />
      </div>

      {/* Mid row: critical deps + recent changes */}
      <div className="dashboard-grid-mid">
        <CriticalDepsSection deps={depScores} />
        <RecentChangesSection deps={depScores} />
      </div>

      {/* Full dependencies table */}
      <DependenciesTable deps={depScores.map((d) => ({
        name: d.name,
        version: d.version,
        score: d.score,
        risk_level: d.risk_level,
      }))} />
    </>
  );
}
