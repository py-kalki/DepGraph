// =============================================================================
// DepGraph — TableRow
// Single dependency row in the deps table.
// =============================================================================

import { ScoreBar } from '@/components/ui/ScoreBar';
import { RiskBadge } from '@/components/ui/RiskBadge';
import type { DepRow } from './DependenciesTable';

import Link from 'next/link';

function formatDownloads(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Props {
  dep: DepRow;
}

export function TableRow({ dep }: Props) {
  return (
    <tr>
      <td>
        <span className="mono-cell" style={{ fontWeight: 500 }}>
          <Link href={`/dependency/${encodeURIComponent(dep.name)}`} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
            {dep.name}
          </Link>
          {dep.version && (
            <span className="text-muted" style={{ marginLeft: '0.25rem', fontSize: '0.75rem', fontWeight: 400 }}>
              @{dep.version}
            </span>
          )}
        </span>
      </td>
      <td style={{ minWidth: '120px' }}>
        <ScoreBar score={dep.score} />
      </td>
      <td>
        <RiskBadge risk={dep.risk_level} />
      </td>
      <td className="text-sm text-muted mono-cell">
        {formatDate(dep.last_commit_date)}
      </td>
      <td className="text-sm mono-cell">
        {dep.contributor_count ?? '—'}
      </td>
      <td className="text-sm mono-cell">
        {formatDownloads(dep.weekly_downloads)}
      </td>
    </tr>
  );
}
