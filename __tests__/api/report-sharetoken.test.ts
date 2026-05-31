// =============================================================================
// Tests: api/report-sharetoken
// Tests GET /api/report/[shareToken] — public endpoint, no auth required.
// =============================================================================

import { GET } from '@/app/api/report/[shareToken]/route';
import * as scansDb from '@/lib/db/queries/scans';
import * as redisModule from '@/lib/cache/redis';
import type { DbScanReport } from '@/lib/types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/lib/db/queries/scans');
jest.mock('@/lib/cache/redis', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  TTL: { SHARE_REPORT: 3600 },
  cacheDel: jest.fn(),
  cacheAside: jest.fn(),
  getRedis: jest.fn(),
}));

const mockGetReport = scansDb.getScanReportByToken as jest.MockedFunction<typeof scansDb.getScanReportByToken>;
const mockCacheGet  = redisModule.cacheGet as jest.MockedFunction<typeof redisModule.cacheGet>;
const mockCacheSet  = redisModule.cacheSet as jest.MockedFunction<typeof redisModule.cacheSet>;

const MOCK_REPORT: DbScanReport = {
  id: 'rep-1',
  project_id: null,
  share_token: 'abc123',
  overall_score: 74,
  total_deps: 5,
  critical_count: 1,
  high_count: 1,
  dep_scores: [{ name: 'express', version: '4.18.2', score: 74, risk_level: 'low' }],
  created_at: new Date().toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/report/[shareToken]', () => {
  beforeEach(() => {
    mockCacheGet.mockResolvedValue(null);
    mockCacheSet.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 for invalid (too long) token', async () => {
    const req = new Request('http://localhost');
    const res = await GET(req, { params: Promise.resolve({ shareToken: 'x'.repeat(31) }) });
    expect(res.status).toBe(400);
  });

  test('returns 404 when report not found in DB', async () => {
    mockGetReport.mockResolvedValueOnce(null);
    const req = new Request('http://localhost');
    const res = await GET(req, { params: Promise.resolve({ shareToken: 'notfound1' }) });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Report not found');
  });

  test('returns 200 with report from DB on cache miss', async () => {
    mockGetReport.mockResolvedValueOnce(MOCK_REPORT);
    const req = new Request('http://localhost');
    const res = await GET(req, { params: Promise.resolve({ shareToken: 'abc123' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { report: DbScanReport };
    expect(body.report.share_token).toBe('abc123');
    expect(body.report.overall_score).toBe(74);
    expect(res.headers.get('X-Cache')).toBe('MISS');
  });

  test('returns 200 from cache on cache hit without hitting DB', async () => {
    mockCacheGet.mockResolvedValueOnce(MOCK_REPORT);
    const req = new Request('http://localhost');
    const res = await GET(req, { params: Promise.resolve({ shareToken: 'abc123' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBe('HIT');
    expect(mockGetReport).not.toHaveBeenCalled();
  });

  test('stores report in cache after DB fetch', async () => {
    mockGetReport.mockResolvedValueOnce(MOCK_REPORT);
    const req = new Request('http://localhost');
    await GET(req, { params: Promise.resolve({ shareToken: 'abc123' }) });
    expect(mockCacheSet).toHaveBeenCalledWith('report:abc123', MOCK_REPORT, 3600);
  });

  test('no authentication required — route file has no getServerSession', () => {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const routeSource = fs.readFileSync(
      path.join(__dirname, '../../app/api/report/[shareToken]/route.ts'),
      'utf-8'
    ) as string;
    expect(routeSource).not.toContain('getServerSession');
  });
});
