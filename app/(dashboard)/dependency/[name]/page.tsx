import { notFound } from 'next/navigation';
import { getPackageScore } from '@/lib/db/queries/packages';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import HoverCardEffect from '@/components/landing/HoverCardEffect';
import Link from 'next/link';
import { ArrowLeft, GitBranch, TrendingDown, Users } from 'lucide-react';

interface Props {
  params: Promise<{ name: string }>;
}

export default async function DependencyDetailPage(props: Props) {
  const params = await props.params;
  const pkgName = decodeURIComponent(params.name);
  const scoreData = await getPackageScore(pkgName, 'npm');

  if (!scoreData) {
    notFound();
  }

  // Derive migration difficulty (mocked logic based on score & type)
  // Hard if it's high risk, medium if it's healthy but high usage, etc.
  // For V1, we'll assign it statically based on risk level.
  let migrationDiff = 'Medium';
  let diffColor = '#EAB308';
  if (scoreData.risk_level === 'critical' || scoreData.risk_level === 'high') {
    migrationDiff = 'Hard';
    diffColor = '#E24B4A';
  } else if (scoreData.risk_level === 'healthy') {
    migrationDiff = 'Easy';
    diffColor = '#1D9E75';
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '1rem', paddingBottom: '4rem' }}>
      <HoverCardEffect />
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888888', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', marginBottom: '1rem', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {pkgName}
              <span style={{ fontSize: '1rem', color: '#666666', fontWeight: 400, fontFamily: 'JetBrains Mono, monospace' }}>
                {scoreData.package_version ? `@${scoreData.package_version}` : ''}
              </span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
                {scoreData.ecosystem.toUpperCase()}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888' }}>
                Computed: {new Date(scoreData.computed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Migration Difficulty</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 700, color: diffColor, padding: '0.25rem 0.75rem', border: `1px solid ${diffColor}` }}>
              {migrationDiff}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left Column: Overall Score */}
        <ScoreGauge score={scoreData.score} />

        {/* Right Column: Dimensions */}
        <div className="card hover-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '2rem' }}>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maintenance</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.25rem' }}>{Math.round((scoreData.maintenance_score ?? 0) * 100)}%</div>
          </div>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bus Factor</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.25rem' }}>{Math.round((scoreData.bus_factor_score ?? 0) * 100)}%</div>
          </div>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Health</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.25rem' }}>{Math.round((scoreData.issue_health_score ?? 0) * 100)}%</div>
          </div>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vulnerabilities</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: (scoreData.vulnerability_score ?? 0) < 1 ? '#E24B4A' : '#1D9E75', marginTop: '0.25rem' }}>{Math.round((scoreData.vulnerability_score ?? 0) * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Activity Timeline / Stats Grid */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Package Activity</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '2rem' }}>
        <div style={{ background: '#000000', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', marginBottom: '1rem' }}>
            <GitBranch size={16} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Commit</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            {scoreData.last_commit_date ? new Date(scoreData.last_commit_date).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
        <div style={{ background: '#000000', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', marginBottom: '1rem' }}>
            <Users size={16} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contributors</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            {scoreData.contributor_count ?? 'N/A'}
          </div>
        </div>
        <div style={{ background: '#000000', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', marginBottom: '1rem' }}>
            <TrendingDown size={16} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly DLs</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            {scoreData.weekly_downloads ? scoreData.weekly_downloads.toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Suggested Alternatives */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Suggested Alternatives</h2>
      <div className="card hover-card" style={{ padding: 0, overflow: 'hidden' }}>
        {(!scoreData.alternatives || scoreData.alternatives.length === 0) ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
            No recommended alternatives found for this package.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alternative Package</th>
                <th style={{ textAlign: 'center', padding: '1rem 1.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {scoreData.alternatives.map((alt: any, i: number) => (
                <tr key={alt.name} style={{ borderBottom: i < (scoreData.alternatives as any[]).length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                    <Link href={`/dependency/${encodeURIComponent(alt.name)}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                      {alt.name}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#1D9E75' }}>
                    {alt.confidence === 'high' ? 'High Match' : 'Possible Match'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
