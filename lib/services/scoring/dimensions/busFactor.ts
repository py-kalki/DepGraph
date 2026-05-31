// =============================================================================
// DepGraph — Scoring Engine: Bus Factor Dimension
// Weight: 20% (PRD §F-02)
// Bus factor definition: PRD Appendix A
// Data sources: GitHub contributors API
// =============================================================================

import type { RawSignals, DimensionScore } from '@/lib/types';
import { clamp } from './maintenance';

const WEIGHT = 0.20;
const LABEL = 'Bus Factor';

/**
 * Score the Bus Factor dimension (0–100).
 *
 * Bus factor (PRD Appendix A): minimum number of contributors accounting for
 * ≥80% of commits in the last 12 months.
 *
 * busFactor = 1 → one person controls the project → maximum risk.
 */
export function scoreBusFactor(signals: RawSignals): DimensionScore {
  const github = signals.github;

  if (!github || !github.hasRepoLink) {
    return {
      score: 0,
      weight: WEIGHT,
      label: LABEL,
      reason: 'No GitHub repository linked — bus factor cannot be assessed.',
      available: false,
    };
  }

  const { busFactor, activeContributors } = github;

  // Base score from bus factor
  let baseScore: number;
  if (busFactor >= 10) baseScore = 100;
  else if (busFactor >= 5) baseScore = 80;
  else if (busFactor >= 3) baseScore = 60;
  else if (busFactor === 2) baseScore = 35;
  else baseScore = 10; // busFactor === 1

  // Active contributor bonus
  let activeBonus = 0;
  if (activeContributors > 20) activeBonus = 10;
  else if (activeContributors > 10) activeBonus = 5;

  const score = clamp(baseScore + activeBonus, 0, 100);

  // Human-readable reason
  let reason: string;
  if (busFactor === 1) {
    reason = `Single-maintainer project (bus factor: 1) — if the maintainer stops, the project stops.`;
  } else if (busFactor <= 2) {
    reason = `Low bus factor (${busFactor}) — project depends on a very small team of ${activeContributors} active contributors.`;
  } else if (busFactor <= 4) {
    reason = `Moderate bus factor (${busFactor}) with ${activeContributors} active contributors — reasonable redundancy.`;
  } else {
    reason = `Healthy bus factor (${busFactor}) — project has strong contributor redundancy with ${activeContributors} active contributors.`;
  }

  return { score, weight: WEIGHT, label: LABEL, reason, available: true };
}
