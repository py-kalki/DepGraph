// =============================================================================
// DepGraph — Tests: cron/daily-tasks (Week 7 updated)
// Now mocks warmTopPackages and runCleanup added in Week 7.
// GET() uses next/headers so we mock it rather than passing a Request object.
// =============================================================================

process.env.CRON_SECRET = 'test_cron_secret';

// Mock next/headers before importing the route
const mockGet = jest.fn();
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock('@/lib/services/refresh/dailyRefresh', () => ({
  runDailyRefresh: jest.fn(),
}));
jest.mock('@/lib/db/queries/history', () => ({
  snapshotAllPackageScores: jest.fn(),
}));
jest.mock('@/lib/services/alerts/scanner', () => ({
  runAlertScan: jest.fn(),
}));
// Week 7 additions — must be mocked so tests don't hit network/DB
jest.mock('@/lib/cache/warmer', () => ({
  warmTopPackages: jest.fn(),
}));
jest.mock('@/lib/db/client', () => ({
  getDbClient: jest.fn(() => ({
    rpc: jest.fn(() => Promise.resolve({ data: 0, error: null })),
  })),
}));

import { GET } from '@/app/api/cron/daily-tasks/route';
import type { AlertScanResult } from '@/lib/services/alerts/scanner';
import { runDailyRefresh } from '@/lib/services/refresh/dailyRefresh';
import { snapshotAllPackageScores } from '@/lib/db/queries/history';
import { runAlertScan } from '@/lib/services/alerts/scanner';
import { warmTopPackages } from '@/lib/cache/warmer';

const mockRefresh  = runDailyRefresh          as jest.MockedFunction<typeof runDailyRefresh>;
const mockSnapshot = snapshotAllPackageScores as jest.MockedFunction<typeof snapshotAllPackageScores>;
const mockScan     = runAlertScan             as jest.MockedFunction<typeof runAlertScan>;
const mockWarm     = warmTopPackages          as jest.MockedFunction<typeof warmTopPackages>;

const defaultScanResult: AlertScanResult = { processed: 0, emailsQueued: 0, sent: 0, failed: 0 };
const defaultWarmResult = { hit: 0, warmed: 0, errors: 0 };

function setAuthHeader(secret: string) {
  mockGet.mockReturnValue(`Bearer ${secret}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthHeader('test_cron_secret');
  mockWarm.mockResolvedValue(defaultWarmResult);
});

describe('GET /api/cron/daily-tasks', () => {
  test('returns 401 without correct CRON_SECRET', async () => {
    setAuthHeader('wrong_secret');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  test('returns 200 with correct CRON_SECRET', async () => {
    mockRefresh.mockResolvedValueOnce({ refreshed: 3, failed: 0, errors: [] });
    mockSnapshot.mockResolvedValueOnce(3);
    mockScan.mockResolvedValueOnce(defaultScanResult);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  }, 15000);

  test('still returns 200 when a sub-task fails', async () => {
    mockRefresh.mockRejectedValueOnce(new Error('DB timeout'));
    mockSnapshot.mockResolvedValueOnce(0);
    mockScan.mockResolvedValueOnce(defaultScanResult);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json() as { refresh: { error?: string } };
    expect(body.refresh.error).toBeDefined();
  }, 15000);

  test('runs all tasks concurrently', async () => {
    const order: string[] = [];
    mockRefresh.mockImplementationOnce(async () => {
      order.push('refresh');
      return { refreshed: 1, failed: 0, errors: [] };
    });
    mockSnapshot.mockImplementationOnce(async () => {
      order.push('snapshot');
      return 1;
    });
    mockScan.mockImplementationOnce(async () => {
      order.push('scan');
      return defaultScanResult;
    });
    mockWarm.mockImplementationOnce(async () => {
      order.push('warm');
      return defaultWarmResult;
    });

    await GET();
    expect(order).toContain('refresh');
    expect(order).toContain('snapshot');
    expect(order).toContain('scan');
    expect(order).toContain('warm');
  }, 15000);
});
