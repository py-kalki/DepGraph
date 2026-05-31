'use client';
// =============================================================================
// DepGraph — DependenciesTable
// Sortable, filterable, searchable table of all deps.
// PRD §F-03: "Dependencies table: sortable by score, name, risk, last-updated"
// All state is local — no global state needed.
// =============================================================================

import { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { FilterControls } from './FilterControls';
import { SortHeader } from './SortHeader';
import { TableRow } from './TableRow';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';

export interface DepRow {
  name: string;
  version: string | null;
  score: number;
  risk_level: string;
  last_commit_date?: string | null;
  contributor_count?: number | null;
  weekly_downloads?: number | null;
}

type SortKey = 'name' | 'score' | 'risk_level' | 'last_commit_date' | 'contributor_count' | 'weekly_downloads';
type SortDir = 'asc' | 'desc';

const RISK_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3, healthy: 4,
};

interface Props {
  deps: DepRow[];
  loading?: boolean;
}

export function DependenciesTable({ deps, loading = false }: Props) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    let list = deps;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    // Risk level filter
    if (activeFilters.length > 0) {
      list = list.filter((d) => activeFilters.includes(d.risk_level));
    }

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === 'score') {
        cmp = a.score - b.score;
      } else if (sortKey === 'risk_level') {
        cmp = (RISK_ORDER[a.risk_level] ?? 99) - (RISK_ORDER[b.risk_level] ?? 99);
      } else if (sortKey === 'last_commit_date') {
        const da = a.last_commit_date ?? '';
        const db = b.last_commit_date ?? '';
        cmp = da.localeCompare(db);
      } else if (sortKey === 'contributor_count') {
        cmp = (a.contributor_count ?? 0) - (b.contributor_count ?? 0);
      } else if (sortKey === 'weekly_downloads') {
        cmp = (a.weekly_downloads ?? 0) - (b.weekly_downloads ?? 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [deps, search, activeFilters, sortKey, sortDir]);

  return (
    <div className="card" role="region" aria-label="Dependencies table">
      <div className="card-header">
        <div className="card-title">Dependencies ({deps.length})</div>
      </div>

      <div className="deps-controls">
        <SearchBar value={search} onChange={setSearch} />
        <FilterControls active={activeFilters} onChange={setActiveFilters} />
      </div>

      <div className="table-wrap">
        <table aria-label="Dependency health scores">
          <thead>
            <tr>
              <th><SortHeader label="Package" sortKey="name" active={sortKey === 'name'} dir={sortDir} onSort={(k) => handleSort(k as SortKey)} /></th>
              <th><SortHeader label="Score" sortKey="score" active={sortKey === 'score'} dir={sortDir} onSort={(k) => handleSort(k as SortKey)} /></th>
              <th><SortHeader label="Risk" sortKey="risk_level" active={sortKey === 'risk_level'} dir={sortDir} onSort={(k) => handleSort(k as SortKey)} /></th>
              <th><SortHeader label="Last Commit" sortKey="last_commit_date" active={sortKey === 'last_commit_date'} dir={sortDir} onSort={(k) => handleSort(k as SortKey)} /></th>
              <th><SortHeader label="Contributors" sortKey="contributor_count" active={sortKey === 'contributor_count'} dir={sortDir} onSort={(k) => handleSort(k as SortKey)} /></th>
              <th><SortHeader label="Weekly DL" sortKey="weekly_downloads" active={sortKey === 'weekly_downloads'} dir={sortDir} onSort={(k) => handleSort(k as SortKey)} /></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No dependencies match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((dep) => <TableRow key={dep.name} dep={dep} />)
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted" style={{ marginTop: '0.75rem' }}>
        Showing {filtered.length} of {deps.length} dependencies
      </p>
    </div>
  );
}
