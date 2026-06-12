// =============================================================================
// DepGraph — Public Report Page (/r/[shareToken])
// No authentication required — PRD §F-03: "Anonymous public view for shared URLs"
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
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
    title: `Dependency Health Report — DepGraph`,
    description: `View the dependency health report for share token ${shareToken}.`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { shareToken } = await params;

  if (!shareToken || shareToken.length > 30) {
    return (
      <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ErrorState title="Invalid Report" message="The share token in this URL is not valid." />
      </div>
    );
  }

  const report = await getScanReportByToken(shareToken);

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ErrorState
          title="Report Not Found"
          message="This report may have been deleted or the URL is incorrect."
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Navbar — matches LandingNavbar exactly */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '64px',
        }}>
          {/* Logo — identical to homepage */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#FFFFFF', fontSize: '1.35rem', letterSpacing: '-0.04em' }}>
            <span style={{ fontWeight: 300, fontStyle: 'italic' }}>dep</span>
            <span style={{ fontWeight: 800 }}>Graph</span>
          </Link>

          {/* Right CTA */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#888888', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link href="/dashboard" style={{ padding: '0.5rem 1.25rem', background: '#FFFFFF', color: '#000000', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <ReportCard report={report} />
        <div style={{ marginTop: '2rem' }}>
          <ReportDepsTable report={report} />
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: '3rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#666666', fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace' }}>
            Scan your own project in 30 seconds
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '0.75rem 1.5rem',
              background: '#FFFFFF',
              color: '#000000',
              textDecoration: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Get Started Free →
            </Link>
            <code style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#888888',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
            }}>
              npx depgraph-scanner check
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}
