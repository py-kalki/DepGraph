// =============================================================================
// DepGraph — Scoring Engine: Dependency Freshness Dimension
// Weight: 10% (PRD §F-02)
// Data sources: npm registry (how outdated this package's own deps are)
// =============================================================================

import type { RawSignals, DimensionScore } from '@/lib/types';
import { clamp } from './maintenance';

const WEIGHT = 0.10;
const LABEL = 'Dependency Freshness';

/**
 * Score the Dependency Freshness dimension (0–100).
 *
 * Measures how up-to-date this package's own dependencies are.
 * A package with severely outdated deps is likely unmaintained.
 *
 * Edge case: 0 direct deps → perfect score (100) — no deps = nothing to be stale.
 */
export function scoreDepFreshness(signals: RawSignals): DimensionScore {
  const npm = signals.npm;

  if (!npm) {
    return {
      score: 50, // neutral — no data
      weight: WEIGHT,
      label: LABEL,
      reason: 'npm data unavailable — dependency freshness cannot be assessed.',
      available: false,
    };
  }

  const { directDepCount, outdatedDepCount } = npm;

  // No dependencies — perfectly fresh
  if (directDepCount === 0) {
    return {
      score: 100,
      weight: WEIGHT,
      label: LABEL,
      reason: 'No direct dependencies — nothing to be outdated.',
      available: true,
    };
  }

  const outdatedRatio = outdatedDepCount / directDepCount;

  let score: number;
  if (outdatedRatio === 0) score = 100;
  else if (outdatedRatio <= 0.1) score = 80;
  else if (outdatedRatio <= 0.25) score = 60;
  else if (outdatedRatio <= 0.5) score = 40;
  else if (outdatedRatio <= 0.75) score = 20;
  else score = 0;

  score = clamp(score, 0, 100);

  // Human-readable reason
  const outdatedPercent = Math.round(outdatedRatio * 100);
  let reason: string;
  if (outdatedRatio === 0) {
    reason = `All ${directDepCount} direct dependencies are up to date.`;
  } else if (outdatedRatio <= 0.25) {
    reason = `${outdatedDepCount} of ${directDepCount} direct dependencies are outdated (${outdatedPercent}%).`;
  } else {
    reason = `${outdatedDepCount} of ${directDepCount} direct dependencies are outdated (${outdatedPercent}%) — this package may be unmaintained.`;
  }

  return { score, weight: WEIGHT, label: LABEL, reason, available: true };
}
