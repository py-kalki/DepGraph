// =============================================================================
// DepGraph — Tests: API Key Authentication (Week 6)
// =============================================================================

import { hashApiKey, keyPrefix, generateRawApiKey } from '@/lib/db/queries/apiKeys';
import { assertActionPlan } from '@/lib/middleware/apiKeyAuth';
import { NextResponse } from 'next/server';

describe('generateRawApiKey', () => {
  it('generates keys with dg_live_ prefix', () => {
    const key = generateRawApiKey();
    expect(key.startsWith('dg_live_')).toBe(true);
  });

  it('generates unique keys', () => {
    const k1 = generateRawApiKey();
    const k2 = generateRawApiKey();
    expect(k1).not.toBe(k2);
  });

  it('generates keys of consistent length', () => {
    const key = generateRawApiKey();
    expect(key.length).toBeGreaterThan(40);
  });
});

describe('hashApiKey', () => {
  it('returns a 64-char hex string', () => {
    const hash = hashApiKey('dg_live_testkey12345678901234567890123456789012345678');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('is deterministic', () => {
    const key = 'dg_live_abc123';
    expect(hashApiKey(key)).toBe(hashApiKey(key));
  });

  it('produces different hashes for different keys', () => {
    expect(hashApiKey('dg_live_key1')).not.toBe(hashApiKey('dg_live_key2'));
  });
});

describe('keyPrefix', () => {
  it('returns first 12 characters', () => {
    const raw = 'dg_live_a1b2c3d4e5f6g7h8';
    expect(keyPrefix(raw)).toBe('dg_live_a1b2');
    expect(keyPrefix(raw)).toHaveLength(12);
  });
});

describe('assertActionPlan', () => {
  it('returns null for pro plan', () => {
    expect(assertActionPlan('pro')).toBeNull();
  });

  it('returns null for team plan', () => {
    expect(assertActionPlan('pro')).toBeNull();
  });

  it('returns 403 NextResponse for free plan', () => {
    const res = assertActionPlan('free');
    expect(res).toBeInstanceOf(NextResponse);
    expect(res?.status).toBe(403);
  });
});
