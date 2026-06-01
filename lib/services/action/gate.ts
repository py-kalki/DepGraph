// =============================================================================
// DepGraph — Service: CI Gate (Week 6)
// Applies fail-on threshold to produce a Pass / Warn / Fail decision.
// =============================================================================

export type FailOn = 'none' | 'critical' | 'high' | 'medium';
export type GateResult = 'pass' | 'warn' | 'fail';

export type GateInput = {
  failOn:        FailOn;
  criticalCount: number;
  highCount:     number;
  mediumCount:   number;
  scoreDelta:    number;   // head_score - base_score (negative = dropped)
};

export type GateOutput = {
  result:  GateResult;
  reason:  string;
  exitCode: 0 | 1;
};

/**
 * Apply the CI gate rules per PRD §F-05.
 *
 * fail-on: none     → always pass
 * fail-on: critical → fail if criticalCount > 0
 * fail-on: high     → fail if criticalCount || highCount > 0
 * fail-on: medium   → fail if criticalCount || highCount || mediumCount > 0
 * Extra rule: warn  if score dropped > 10 points (regardless of fail-on)
 */
export function applyGate(input: GateInput): GateOutput {
  const { failOn, criticalCount, highCount, mediumCount, scoreDelta } = input;

  // 1. Hard failures based on fail-on setting
  if (failOn !== 'none') {
    if (criticalCount > 0) {
      return {
        result:   'fail',
        reason:   `${criticalCount} critical risk dependenc${criticalCount === 1 ? 'y' : 'ies'} detected`,
        exitCode: 1,
      };
    }
    if (failOn !== 'critical' && highCount > 0) {
      return {
        result:   'fail',
        reason:   `${highCount} high risk dependenc${highCount === 1 ? 'y' : 'ies'} detected`,
        exitCode: 1,
      };
    }
    if (failOn === 'medium' && mediumCount > 0) {
      return {
        result:   'fail',
        reason:   `${mediumCount} medium risk dependenc${mediumCount === 1 ? 'y' : 'ies'} detected`,
        exitCode: 1,
      };
    }
  }

  // 2. Warn if score dropped significantly (> 10 points)
  if (scoreDelta < -10) {
    return {
      result:   'warn',
      reason:   `Dependency health score dropped ${Math.abs(scoreDelta)} points`,
      exitCode: 0,
    };
  }

  return {
    result:   'pass',
    reason:   'All dependency health checks passed',
    exitCode: 0,
  };
}
