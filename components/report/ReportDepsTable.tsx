'use client';
// =============================================================================
// DepGraph — ReportDepsTable
// Read-only deps table for the public report page.
// Reuses DependenciesTable with the public dep shape.
// =============================================================================

import { DependenciesTable } from '@/components/deps/DependenciesTable';
import type { DbScanReport } from '@/lib/types';

interface Props {
  report: DbScanReport;
}

export function ReportDepsTable({ report }: Props) {
  const deps = report.dep_scores.map((d) => ({
    name: d.name,
    version: d.version,
    score: d.score,
    risk_level: d.risk_level,
  }));

  return <DependenciesTable deps={deps} />;
}
