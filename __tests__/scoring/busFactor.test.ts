// =============================================================================
// Unit Tests: Bus Factor Dimension (PRD Appendix A)
// =============================================================================

import { scoreBusFactor } from '@/lib/services/scoring/dimensions/busFactor';
import type { RawSignals } from '@/lib/types';

function makeSignals(busFactor: number, activeContributors: number, hasRepoLink = true): RawSignals {
  return {
    github: {
      lastCommitDate: new Date(),
      commitFrequency90d: 2,
      contributorCount: Math.max(busFactor, activeContributors),
      activeContributors,
      busFactor,
      openIssues: 10,
      closedIssues: 100,
      avgIssueCloseTimeDays: 7,
      repoUrl: hasRepoLink ? 'https://github.com/test/test' : null,
      hasRepoLink,
      releaseCount12mo: 4,
    },
    npm: null,
    osv: null,
    fetchedAt: new Date(),
  };
}

describe('scoreBusFactor', () => {
  test('busFactor = 1 → score ≤ 15 (single maintainer is maximum risk)', () => {
    const result = scoreBusFactor(makeSignals(1, 1));
    expect(result.score).toBeLessThanOrEqual(20);
  });

  test('busFactor = 1, many contributors → still low score (busFactor is primary signal)', () => {
    const result = scoreBusFactor(makeSignals(1, 5));
    expect(result.score).toBeLessThanOrEqual(25);
  });

  test('busFactor = 2 → score ≤ 45', () => {
    const result = scoreBusFactor(makeSignals(2, 3));
    expect(result.score).toBeLessThanOrEqual(50);
  });

  test('busFactor = 3 → score in 60–75 range', () => {
    const result = scoreBusFactor(makeSignals(3, 5));
    expect(result.score).toBeGreaterThanOrEqual(55);
    expect(result.score).toBeLessThanOrEqual(80);
  });

  test('busFactor = 5 → score ≥ 75', () => {
    const result = scoreBusFactor(makeSignals(5, 8));
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  test('busFactor ≥ 10 → score ≥ 90', () => {
    const result = scoreBusFactor(makeSignals(10, 20));
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test('activeContributors > 20 → active bonus applied', () => {
    const withBonus = scoreBusFactor(makeSignals(5, 25));
    const withoutBonus = scoreBusFactor(makeSignals(5, 5));
    expect(withBonus.score).toBeGreaterThan(withoutBonus.score);
  });

  test('activeContributors > 10 → moderate active bonus', () => {
    const withBonus = scoreBusFactor(makeSignals(5, 15));
    const withoutBonus = scoreBusFactor(makeSignals(5, 5));
    expect(withBonus.score).toBeGreaterThan(withoutBonus.score);
  });

  test('no repo link → available = false, score = 0', () => {
    const result = scoreBusFactor(makeSignals(5, 10, false));
    expect(result.score).toBe(0);
    expect(result.available).toBe(false);
  });

  test('null github → available = false', () => {
    const signals: RawSignals = { github: null, npm: null, osv: null, fetchedAt: new Date() };
    const result = scoreBusFactor(signals);
    expect(result.available).toBe(false);
  });

  test('score is always 0–100', () => {
    const extremeHigh = scoreBusFactor(makeSignals(100, 1000));
    expect(extremeHigh.score).toBeLessThanOrEqual(100);
  });

  test('weight is 0.20', () => {
    const result = scoreBusFactor(makeSignals(3, 5));
    expect(result.weight).toBe(0.20);
  });
});
