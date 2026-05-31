// =============================================================================
// DepGraph — Public Report Page (/report/[shareToken])
// No authentication required — PRD §F-03: "Anonymous public view for shared URLs"
// =============================================================================

import type { Metadata } from 'next';
import { getScanReportByToken } from '@/lib/db/queries/scans';
import { ReportCard } from '@/components/report/ReportCard';
import { ReportDepsTable } from '@/components/report/ReportDepsTable';
import { ErrorState } from '@/components/ui/ErrorState';

interface Props {
  params: Promise<{ shareToken: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareToken } = await params;
  return {
    title: `Dependency Report — DepGraph`,
    description: `View the dependency health report for share token ${shareToken}.`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { shareToken } = await params;

  if (!shareToken || shareToken.length > 30) {
    return (
      <div className="report-page">
        <ErrorState title="Invalid Report" message="The share token in this URL is not valid." />
      </div>
    );
  }

  const report = await getScanReportByToken(shareToken);

  if (!report) {
    return (
      <div className="report-page">
        <ErrorState
          title="Report Not Found"
          message="This report may have been deleted or the URL is incorrect."
        />
      </div>
    );
  }

  return (
    <div className="report-page">
      {/* Minimal public header — no auth required */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--bg-border)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Dep<span style={{ color: 'var(--brand-primary)' }}>Graph</span>
        </div>
        <a
          href="/login"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--brand-primary)',
            fontWeight: 500,
          }}
        >
          Sign in to track your own projects →
        </a>
      </div>

      <ReportCard report={report} />

      <div style={{ marginTop: '1.5rem' }}>
        <ReportDepsTable report={report} />
      </div>
    </div>
  );
}
