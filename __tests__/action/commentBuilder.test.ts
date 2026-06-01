// =============================================================================
// DepGraph — Tests: PR Comment Builder (Week 6)
// =============================================================================

import { buildPrComment } from '@/lib/services/action/commentBuilder';
import { hashCommentBody } from '@/lib/db/queries/prComments';
import type { ScoredDep } from '@/lib/services/action/differ';

const criticalDep: ScoredDep = {
  name: 'left-pad', version: '1.3.0', score: 8,
  riskLevel: 'critical', abandonmentRisk: true, cveCount: 0,
};
const healthyDep: ScoredDep = {
  name: 'axios', version: '1.6.0', score: 88,
  riskLevel: 'healthy', abandonmentRisk: false, cveCount: 0,
};

const baseInput = {
  baseScore:  79,
  headScore:  74,
  delta:      { added: [], removed: [], updated: [] },
  gateResult: 'pass' as const,
  gateReason: 'All dependency health checks passed',
  reportUrl:  'https://depgraph.vedanshh.dev/report/abc123',
  githubRepo: 'owner/repo',
  prNumber:   42,
};

describe('buildPrComment', () => {
  it('includes the hidden dedup marker', () => {
    const md = buildPrComment(baseInput);
    expect(md).toContain('<!-- depgraph-comment -->');
  });

  it('includes the overall score', () => {
    const md = buildPrComment(baseInput);
    expect(md).toContain('74/100');
  });

  it('shows score delta', () => {
    const md = buildPrComment(baseInput);
    expect(md).toContain('↓ 5 from 79');
  });

  it('shows PASSED gate result', () => {
    const md = buildPrComment({ ...baseInput, gateResult: 'pass' });
    expect(md).toContain('PASSED');
  });

  it('shows FAILED gate result', () => {
    const md = buildPrComment({ ...baseInput, gateResult: 'fail', gateReason: '1 critical' });
    expect(md).toContain('FAILED');
    expect(md).toContain('1 critical');
  });

  it('includes new dependencies table when deps are added', () => {
    const md = buildPrComment({
      ...baseInput,
      delta: { added: [healthyDep], removed: [], updated: [] },
    });
    expect(md).toContain('New Dependencies');
    expect(md).toContain('axios');
    expect(md).toContain('88');
  });

  it('shows critical findings section for critical deps', () => {
    const md = buildPrComment({
      ...baseInput,
      delta: { added: [criticalDep], removed: [], updated: [] },
      gateResult: 'fail',
    });
    expect(md).toContain('Critical Findings');
    expect(md).toContain('left-pad');
    expect(md).toContain('abandonment risk');
  });

  it('includes the report URL', () => {
    const md = buildPrComment(baseInput);
    expect(md).toContain('https://depgraph.vedanshh.dev/report/abc123');
  });

  it('generates consistent hash for identical content', () => {
    const md1 = buildPrComment(baseInput);
    const md2 = buildPrComment(baseInput);
    expect(hashCommentBody(md1)).toBe(hashCommentBody(md2));
  });

  it('generates different hashes for different content', () => {
    const md1 = buildPrComment({ ...baseInput, headScore: 74 });
    const md2 = buildPrComment({ ...baseInput, headScore: 60 });
    expect(hashCommentBody(md1)).not.toBe(hashCommentBody(md2));
  });
});
