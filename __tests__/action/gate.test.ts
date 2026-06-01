// =============================================================================
// DepGraph — Tests: CI Gate (Week 6)
// =============================================================================

import { applyGate, type GateInput } from '@/lib/services/action/gate';

const base: GateInput = {
  failOn:        'critical',
  criticalCount: 0,
  highCount:     0,
  mediumCount:   0,
  scoreDelta:    0,
};

describe('applyGate — fail-on: none', () => {
  it('always passes', () => {
    expect(applyGate({ ...base, failOn: 'none', criticalCount: 99 }).result).toBe('pass');
    expect(applyGate({ ...base, failOn: 'none', criticalCount: 99 }).exitCode).toBe(0);
  });
});

describe('applyGate — fail-on: critical', () => {
  it('passes with 0 critical', () => {
    expect(applyGate({ ...base, criticalCount: 0 }).result).toBe('pass');
  });

  it('fails with 1+ critical', () => {
    const r = applyGate({ ...base, criticalCount: 2 });
    expect(r.result).toBe('fail');
    expect(r.exitCode).toBe(1);
    expect(r.reason).toContain('critical');
  });

  it('passes with only high (fail-on: critical)', () => {
    expect(applyGate({ ...base, highCount: 5 }).result).toBe('pass');
  });
});

describe('applyGate — fail-on: high', () => {
  it('fails with 1+ high', () => {
    const r = applyGate({ ...base, failOn: 'high', highCount: 1 });
    expect(r.result).toBe('fail');
    expect(r.exitCode).toBe(1);
  });

  it('fails with 1+ critical (high includes critical)', () => {
    expect(applyGate({ ...base, failOn: 'high', criticalCount: 1 }).result).toBe('fail');
  });

  it('passes with only medium (fail-on: high)', () => {
    expect(applyGate({ ...base, failOn: 'high', mediumCount: 5 }).result).toBe('pass');
  });
});

describe('applyGate — fail-on: medium', () => {
  it('fails with 1+ medium', () => {
    const r = applyGate({ ...base, failOn: 'medium', mediumCount: 1 });
    expect(r.result).toBe('fail');
    expect(r.exitCode).toBe(1);
  });
});

describe('applyGate — score drop warn', () => {
  it('warns when score drops more than 10 points', () => {
    const r = applyGate({ ...base, scoreDelta: -15 });
    expect(r.result).toBe('warn');
    expect(r.exitCode).toBe(0);
    expect(r.reason).toContain('15');
  });

  it('does not warn for a 10-point or less drop', () => {
    expect(applyGate({ ...base, scoreDelta: -10 }).result).toBe('pass');
    expect(applyGate({ ...base, scoreDelta: -9 }).result).toBe('pass');
  });

  it('hard fail takes priority over score-drop warn', () => {
    const r = applyGate({ ...base, criticalCount: 1, scoreDelta: -20 });
    expect(r.result).toBe('fail');
  });
});
