// =============================================================================
// DepGraph — Scoring Engine: Explainability
// PRD §F-02: "every score includes the top 2 contributing factors"
// =============================================================================

import type { ScoreDimensions } from '@/lib/types';

/**
 * Extract the top 2 worst-performing dimensions as the "explaining factors".
 *
 * PRD requirement: "Score explainability: every score includes the top 2
 * contributing factors" — interpreted as the 2 dimensions with the lowest
 * scores (highest contribution to risk).
 *
 * Only considers dimensions that were available (signals were not null).
 * Falls back to all dimensions if none have available = true.
 */
export function getTopFactors(
  dimensions: ScoreDimensions
): Array<{ label: string; reason: string }> {
  const allDimensions = [
    dimensions.maintenance,
    dimensions.busFactor,
    dimensions.issueHealth,
    dimensions.downloadTrend,
    dimensions.depFreshness,
    dimensions.vulnerability,
  ];

  // Prefer dimensions with actual signal data
  const available = allDimensions.filter((d) => d.available);
  const candidates = available.length >= 2 ? available : allDimensions;

  // Sort by score ascending (worst first)
  const sorted = [...candidates].sort((a, b) => a.score - b.score);

  // Return top 2 worst
  return sorted.slice(0, 2).map((d) => ({
    label: d.label,
    reason: d.reason,
  }));
}
