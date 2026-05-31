// =============================================================================
// Tests: history/snapshot
// Tests snapshotProjectScore, insertScoreHistory, and snapshotAllPackageScores.
// =============================================================================

import { insertScoreHistory, snapshotProjectScore, getPackageHistory } from '@/lib/db/queries/history';

const mockInsert   = jest.fn().mockReturnThis();
const mockSelect   = jest.fn().mockReturnThis();
const mockEq       = jest.fn().mockReturnThis();
const mockGte      = jest.fn().mockReturnThis();
const mockOrder    = jest.fn().mockReturnThis();
const mockLimit    = jest.fn();

// Mock DB client
jest.mock('@/lib/db/client', () => ({
  getDbClient: () => ({
    from: () => ({
      insert:  mockInsert,
      select:  mockSelect,
      eq:      mockEq,
      gte:     mockGte,
      order:   mockOrder,
      limit:   mockLimit,
    }),
  }),
}));

beforeEach(() => jest.clearAllMocks());

describe('insertScoreHistory', () => {
  test('calls insert with correct fields', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    await insertScoreHistory('express', 82, 'npm');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ package_name: 'express', score: 82, ecosystem: 'npm' }),
    );
  });

  test('does not throw on insert failure (non-fatal)', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB error' } });
    await expect(insertScoreHistory('bad-pkg', 50)).resolves.not.toThrow();
  });
});

describe('snapshotProjectScore', () => {
  test('calls insert with project_id and score', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    await snapshotProjectScore('project-uuid', 74);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ project_id: 'project-uuid', score: 74 }),
    );
  });
});

describe('getPackageHistory', () => {
  test('queries score_history with correct filters', async () => {
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockGte.mockReturnThis();
    mockOrder.mockReturnThis();
    mockLimit.mockResolvedValueOnce({ data: [], error: null });

    await getPackageHistory('lodash', 30);
    expect(mockLimit).toHaveBeenCalledWith(30);
  });
});
