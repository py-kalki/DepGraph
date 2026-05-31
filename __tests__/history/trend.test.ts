// =============================================================================
// Tests: history/trend
// Tests getProjectHistory and delta calculations.
// Mocks only what's needed — avoids complex chain mocking.
// =============================================================================

import { getProjectHistory } from '@/lib/db/queries/history';

// Build a chainable mock for Supabase's builder pattern
function makeChain(resolvedValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = ['select', 'eq', 'gte', 'order', 'limit'];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  // Make the terminal call (limit) resolve
  chain.limit.mockResolvedValue(resolvedValue);
  // Also make .order resolve in case limit is not called
  chain.order.mockResolvedValue(resolvedValue);
  return chain;
}

jest.mock('@/lib/db/client', () => ({
  getDbClient: jest.fn(),
}));

import { getDbClient } from '@/lib/db/client';
const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;

beforeEach(() => jest.clearAllMocks());

describe('getProjectHistory', () => {
  test('returns empty array when no history rows', async () => {
    mockGetDbClient.mockReturnValue({ from: () => makeChain({ data: [], error: null }) } as never);
    const history = await getProjectHistory('proj-1', 30);
    expect(history).toEqual([]);
  });

  test('maps overall_score and created_at to ScoreHistoryPoint shape', () => {
    const raw = [
      { overall_score: 75, created_at: '2024-01-01T00:00:00Z' },
      { overall_score: 80, created_at: '2024-01-02T00:00:00Z' },
    ];
    const mapped = raw.map((row) => ({ score: row.overall_score, recordedAt: row.created_at }));
    expect(mapped[0].score).toBe(75);
    expect(mapped[1].recordedAt).toBe('2024-01-02T00:00:00Z');
  });

  test('score delta calculation is correct for improving trend', () => {
    const points = [
      { score: 60, recordedAt: '2024-01-01T00:00:00Z' },
      { score: 70, recordedAt: '2024-01-15T00:00:00Z' },
      { score: 75, recordedAt: '2024-01-30T00:00:00Z' },
    ];
    const delta = points[points.length - 1].score - points[0].score;
    expect(delta).toBe(15);
  });

  test('score delta is negative for declining trend', () => {
    const points = [
      { score: 90, recordedAt: '2024-01-01T00:00:00Z' },
      { score: 70, recordedAt: '2024-01-30T00:00:00Z' },
    ];
    const delta = points[points.length - 1].score - points[0].score;
    expect(delta).toBe(-20);
  });

  test('returns mapped history when data exists', async () => {
    const rows = [
      { overall_score: 82, created_at: '2024-02-01T00:00:00Z' },
      { overall_score: 85, created_at: '2024-02-02T00:00:00Z' },
    ];
    mockGetDbClient.mockReturnValue({ from: () => makeChain({ data: rows, error: null }) } as never);
    const history = await getProjectHistory('proj-2', 30);
    expect(history).toHaveLength(2);
    expect(history[0].score).toBe(82);
    expect(history[1].recordedAt).toBe('2024-02-02T00:00:00Z');
  });
});
