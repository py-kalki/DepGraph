// =============================================================================
// Unit Tests: Abandonment Risk Detection (PRD §F-02)
// All 4 conditions must be simultaneously true.
// =============================================================================

import { checkAbandonmentRisk } from '@/lib/services/scoring/abandonment';
import { mockAbandonedSignals } from './fixtures/packages';
import type { RawSignals, GitHubSignals, NpmSignals } from '@/lib/types';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// Base abandoned github signals (all 4 conditions met from the github side)
const baseGithub: GitHubSignals = {
  lastCommitDate: daysAgo(400),    // condition 1: > 12 months
  commitFrequency90d: 0,
  contributorCount: 1,
  activeContributors: 0,
  busFactor: 1,                     // condition 2: bus factor = 1
  openIssues: 10,
  closedIssues: 5,
  avgIssueCloseTimeDays: null,
  repoUrl: 'https://github.com/test/abandoned',
  hasRepoLink: true,
  releaseCount12mo: 0,              // condition 4: 0 releases
};

// Base abandoned npm signals
const baseNpm: NpmSignals = {
  weeklyDownloads: 500,
  weeklyDownloads30dAgo: 600,
  weeklyDownloads90dAgo: 800,
  downloadSlope90d: -0.375,         // condition 3: negative slope
  latestVersion: '1.0.0',
  publishedAt: daysAgo(400),
  totalVersions: 3,
  directDepCount: 2,
  outdatedDepCount: 2,
  hasInstallScript: false,
};

function makeSignals(githubOverrides?: Partial<GitHubSignals>, npmOverrides?: Partial<NpmSignals>): RawSignals {
  return {
    github: githubOverrides !== undefined ? { ...baseGithub, ...githubOverrides } : baseGithub,
    npm: npmOverrides !== undefined ? { ...baseNpm, ...npmOverrides } : baseNpm,
    osv: null,
    fetchedAt: new Date(),
  };
}

describe('checkAbandonmentRisk', () => {
  test('all 4 conditions met → abandonmentRisk = true', () => {
    expect(checkAbandonmentRisk(mockAbandonedSignals)).toBe(true);
  });

  // ─── Single condition violations ─────────────────────────────────────────

  test('condition 1 violated: lastCommit < 12 months → false', () => {
    const signals = makeSignals({ lastCommitDate: daysAgo(180) }); // 6 months
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('condition 1 violated: lastCommit exactly 11 months → false (boundary)', () => {
    const signals = makeSignals({ lastCommitDate: daysAgo(330) }); // 11 months — should NOT trigger
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('condition 2 violated: busFactor > 1 → false', () => {
    const signals = makeSignals({ busFactor: 2 });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('condition 2 violated: busFactor = 3 → false', () => {
    const signals = makeSignals({ busFactor: 3 });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('condition 3 violated: positive download slope → false', () => {
    const signals = makeSignals(undefined, { downloadSlope90d: 0.1 });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('condition 3 violated: flat slope (0) → false', () => {
    const signals = makeSignals(undefined, { downloadSlope90d: 0 });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('condition 4 violated: 1 release in 12mo → false', () => {
    const signals = makeSignals({ releaseCount12mo: 1 });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  // ─── Null signal handling (conservative approach) ──────────────────────────

  test('null github signals → false (conservative)', () => {
    const signals: RawSignals = { github: null, npm: baseNpm, osv: null, fetchedAt: new Date() };
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('null npm signals → false (conservative)', () => {
    const signals: RawSignals = { github: baseGithub, npm: null, osv: null, fetchedAt: new Date() };
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('all signals null → false (conservative)', () => {
    const signals: RawSignals = { github: null, npm: null, osv: null, fetchedAt: new Date() };
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('no repo link → false (cannot assess abandonment without GitHub)', () => {
    const signals = makeSignals({ hasRepoLink: false });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  test('null lastCommitDate → false', () => {
    const signals = makeSignals({ lastCommitDate: null });
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });

  // ─── Highly active package → never flagged ─────────────────────────────────

  test('active package with all conditions violated → false', () => {
    const signals = makeSignals(
      { lastCommitDate: daysAgo(7), busFactor: 5, releaseCount12mo: 4 },
      { downloadSlope90d: 0.2 }
    );
    expect(checkAbandonmentRisk(signals)).toBe(false);
  });
});
