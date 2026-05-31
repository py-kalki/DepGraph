// =============================================================================
// Tests: cron/dailyRefresh
// Tests the daily refresh cron route and batch service.
// =============================================================================

import { GET } from '@/app/api/cron/daily-refresh/route';

// Set env so getEnv() doesn't throw
process.env.CRON_SECRET = 'test_cron_secret';

jest.mock('@/lib/services/refresh/dailyRefresh', () => ({
  runDailyRefresh: jest.fn(),
}));

import { runDailyRefresh } from '@/lib/services/refresh/dailyRefresh';
const mockRunDailyRefresh = runDailyRefresh as jest.MockedFunction<typeof runDailyRefresh>;

function makeRequest(secret: string): Request {
  return new Request('http://localhost/api/cron/daily-refresh', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

beforeEach(() => jest.clearAllMocks());

describe('GET /api/cron/daily-refresh', () => {
  test('returns 401 without correct CRON_SECRET', async () => {
    const req = makeRequest('wrong_secret');
    const res = await GET(req as never);
    expect(res.status).toBe(401);
  });

  test('returns 200 with correct CRON_SECRET', async () => {
    mockRunDailyRefresh.mockResolvedValueOnce({ refreshed: 3, failed: 0, errors: [] });
    const req = makeRequest('test_cron_secret');
    const res = await GET(req as never);
    expect(res.status).toBe(200);
  });

  test('returns refreshed and failed counts', async () => {
    mockRunDailyRefresh.mockResolvedValueOnce({ refreshed: 5, failed: 1, errors: [{ projectId: 'p-1', error: 'timeout' }] });
    const req = makeRequest('test_cron_secret');
    const res = await GET(req as never);
    const body = await res.json() as { refreshed: number; failed: number };
    expect(body.refreshed).toBe(5);
    expect(body.failed).toBe(1);
  });

  test('returns { refreshed: 0, failed: 0 } when no projects due', async () => {
    mockRunDailyRefresh.mockResolvedValueOnce({ refreshed: 0, failed: 0, errors: [] });
    const req = makeRequest('test_cron_secret');
    const res = await GET(req as never);
    const body = await res.json() as { refreshed: number; failed: number };
    expect(body.refreshed).toBe(0);
    expect(body.failed).toBe(0);
  });

  test('still returns 200 on fatal refresh error', async () => {
    mockRunDailyRefresh.mockRejectedValueOnce(new Error('DB connection failed'));
    const req = makeRequest('test_cron_secret');
    const res = await GET(req as never);
    expect(res.status).toBe(200);
  });
});
