// =============================================================================
// Unit Tests: Maintenance Activity Dimension
// =============================================================================

import { scoreMaintenance } from '@/lib/services/scoring/dimensions/maintenance';
import type { RawSignals } from '@/lib/types';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function makeSignals(overrides: Partial<RawSignals['github']>): RawSignals {
  return {
    github: {
      lastCommitDate: daysAgo(7),
      commitFrequency90d: 2,
      contributorCount: 10,
      activeContributors: 5,
      busFactor: 3,
      openIssues: 10,
      closedIssues: 100,
      avgIssueCloseTimeDays: 7,
      repoUrl: 'https://github.com/test/test',
      hasRepoLink: true,
      releaseCount12mo: 4,
      ...overrides,
    },
    npm: null,
    osv: null,
    fetchedAt: new Date(),
  };
}

describe('scoreMaintenance', () => {
  test('commit 3 days ago → score ≥ 90', () => {
    const result = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(3) }));
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test('commit 1 week ago → score ≥ 85', () => {
    const result = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(7), releaseCount12mo: 4, commitFrequency90d: 5 }));
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test('commit 4 months ago → score in 60–80', () => {
    const result = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(120), releaseCount12mo: 1, commitFrequency90d: 0.5 }));
    expect(result.score).toBeGreaterThanOrEqual(55);
    expect(result.score).toBeLessThanOrEqual(80);
  });

  test('commit 13 months ago → score ≤ 50', () => {
    const result = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(400), releaseCount12mo: 0, commitFrequency90d: 0 }));
    expect(result.score).toBeLessThanOrEqual(50);
  });

  test('commit 3 years ago → score ≤ 20', () => {
    const result = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(365 * 3), releaseCount12mo: 0, commitFrequency90d: 0 }));
    expect(result.score).toBeLessThanOrEqual(20);
  });

  test('null lastCommitDate → score = 0', () => {
    const result = scoreMaintenance(makeSignals({ lastCommitDate: null }));
    expect(result.score).toBe(0);
    expect(result.available).toBe(true);
  });

  test('no hasRepoLink → available = false, score = 0', () => {
    const result = scoreMaintenance(makeSignals({ hasRepoLink: false, repoUrl: null }));
    expect(result.score).toBe(0);
    expect(result.available).toBe(false);
  });

  test('null github signals → available = false', () => {
    const result = scoreMaintenance({ github: null, npm: null, osv: null, fetchedAt: new Date() });
    expect(result.available).toBe(false);
  });

  test('4+ releases in 12mo → release bonus applied', () => {
    // Use lastCommit 4 months ago so base score is ~60 and bonus is visible
    const withReleases = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(120), releaseCount12mo: 4, commitFrequency90d: 0 }));
    const withoutReleases = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(120), releaseCount12mo: 0, commitFrequency90d: 0 }));
    expect(withReleases.score).toBeGreaterThan(withoutReleases.score);
  });

  test('high commit frequency → frequency bonus applied', () => {
    // Use lastCommit 4 months ago so base score is ~60 and bonus is visible
    const highFreq = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(120), commitFrequency90d: 5, releaseCount12mo: 0 }));
    const lowFreq = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(120), commitFrequency90d: 0, releaseCount12mo: 0 }));
    expect(highFreq.score).toBeGreaterThan(lowFreq.score);
  });

  test('score is always 0–100', () => {
    const extreme = scoreMaintenance(makeSignals({ lastCommitDate: daysAgo(3), releaseCount12mo: 10, commitFrequency90d: 50 }));
    expect(extreme.score).toBeLessThanOrEqual(100);
  });

  test('reason is a non-empty string', () => {
    const result = scoreMaintenance(makeSignals({}));
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });

  test('weight is 0.25', () => {
    const result = scoreMaintenance(makeSignals({}));
    expect(result.weight).toBe(0.25);
  });
});
