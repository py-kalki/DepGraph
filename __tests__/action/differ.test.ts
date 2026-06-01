// =============================================================================
// DepGraph — Tests: Dependency Differ (Week 6)
// =============================================================================

import { parsePackageJson, computeDepDelta, type DepEntry, type ScoredDep } from '@/lib/services/action/differ';

const score = (name: string, s: number, risk: ScoredDep['riskLevel']): ScoredDep => ({
  name, version: '1.0.0', score: s, riskLevel: risk, abandonmentRisk: false, cveCount: 0,
});

describe('parsePackageJson', () => {
  it('parses dependencies and devDependencies', () => {
    const raw = JSON.stringify({
      dependencies:    { react: '^18.2.0', axios: '~1.6.0' },
      devDependencies: { jest: '^29.0.0' },
    });
    const result = parsePackageJson(raw);
    expect(result).toHaveLength(3);
    expect(result.find((d) => d.name === 'react')?.version).toBe('18.2.0');
    expect(result.find((d) => d.name === 'axios')?.version).toBe('1.6.0');
  });

  it('strips semver prefixes ^ ~ >= <', () => {
    const raw = JSON.stringify({ dependencies: { a: '^1.0.0', b: '~2.0.0', c: '>=3.0.0' } });
    const result = parsePackageJson(raw);
    expect(result.find((d) => d.name === 'a')?.version).toBe('1.0.0');
    expect(result.find((d) => d.name === 'b')?.version).toBe('2.0.0');
    expect(result.find((d) => d.name === 'c')?.version).toBe('3.0.0');
  });

  it('throws on invalid JSON', () => {
    expect(() => parsePackageJson('not-json')).toThrow('Invalid package.json content');
  });

  it('returns empty array for no dependencies', () => {
    const raw = JSON.stringify({ name: 'my-app', version: '1.0.0' });
    expect(parsePackageJson(raw)).toHaveLength(0);
  });
});

describe('computeDepDelta', () => {
  const base: DepEntry[] = [
    { name: 'react', version: '17.0.2' },
    { name: 'lodash', version: '4.17.21' },
  ];
  const head: DepEntry[] = [
    { name: 'react', version: '18.2.0' },   // updated
    { name: 'axios', version: '1.6.0' },     // added
    // lodash removed
  ];

  const headScored = new Map([['axios', score('axios', 88, 'healthy')]]);
  const baseScored = new Map([['react', score('react', 95, 'healthy')]]);

  it('detects added dependencies', () => {
    const { added } = computeDepDelta(base, head, headScored, baseScored);
    expect(added).toHaveLength(1);
    expect(added[0].name).toBe('axios');
    expect(added[0].score).toBe(88);
  });

  it('detects removed dependencies', () => {
    const { removed } = computeDepDelta(base, head, headScored, baseScored);
    expect(removed).toHaveLength(1);
    expect(removed[0].name).toBe('lodash');
  });

  it('detects updated dependencies', () => {
    const { updated } = computeDepDelta(base, head, headScored, baseScored);
    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('react');
    expect(updated[0].fromVersion).toBe('17.0.2');
    expect(updated[0].toVersion).toBe('18.2.0');
  });

  it('handles no changes', () => {
    const same: DepEntry[] = [{ name: 'react', version: '18.2.0' }];
    const delta = computeDepDelta(same, same, new Map(), new Map());
    expect(delta.added).toHaveLength(0);
    expect(delta.removed).toHaveLength(0);
    expect(delta.updated).toHaveLength(0);
  });
});
