// =============================================================================
// Tests: projects/crud
// Tests GET, POST, PATCH, DELETE /api/projects/* routes.
// =============================================================================

import { GET, POST } from '@/app/api/projects/route';
import { GET as GETById, PATCH, DELETE } from '@/app/api/projects/[id]/route';
import * as projectsDb from '@/lib/db/queries/projects';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth/config', () => ({ authOptions: {} }));
jest.mock('@/lib/db/queries/projects');
jest.mock('@/lib/services/github/validateRepo', () => ({
  validateGithubRepo: jest.fn().mockResolvedValue({
    name: 'my-app', fullName: 'acme/my-app', isPrivate: false, description: null,
  }),
  RepoValidationError: class RepoValidationError extends Error {
    constructor(msg: string, public statusCode = 422) { super(msg); }
  },
}));
jest.mock('@/lib/db/queries/scans', () => ({
  getProjectScanHistory: jest.fn().mockResolvedValue([]),
}));

import { getServerSession } from 'next-auth';
const mockSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockGetProjects  = projectsDb.getUserProjects  as jest.MockedFunction<typeof projectsDb.getUserProjects>;
const mockGetById      = projectsDb.getProjectById   as jest.MockedFunction<typeof projectsDb.getProjectById>;
const mockCreate       = projectsDb.createProject    as jest.MockedFunction<typeof projectsDb.createProject>;
const mockUpdate       = projectsDb.updateProject    as jest.MockedFunction<typeof projectsDb.updateProject>;
const mockDelete       = projectsDb.deleteProject    as jest.MockedFunction<typeof projectsDb.deleteProject>;

const FREE_SESSION   = { userId: 'u-1', plan: 'free',  githubLogin: 'dev' };
const PRO_SESSION    = { userId: 'u-2', plan: 'pro',   githubLogin: 'prodev' };
const MOCK_PROJECT   = { id: 'p-1', user_id: 'u-1', name: 'My App', github_repo: 'acme/my-app', score: null, last_scanned: null, created_at: '' };

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/projects ────────────────────────────────────────────────────────

describe('GET /api/projects', () => {
  test('401 when unauthenticated', async () => {
    mockSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  test('200 returns projects array', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    mockGetProjects.mockResolvedValueOnce([MOCK_PROJECT] as never);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json() as { projects: typeof MOCK_PROJECT[] };
    expect(body.projects).toHaveLength(1);
  });
});

// ─── POST /api/projects ───────────────────────────────────────────────────────

describe('POST /api/projects', () => {
  test('401 when unauthenticated', async () => {
    mockSession.mockResolvedValueOnce(null);
    const req = new Request('http://localhost', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
    expect((await POST(req)).status).toBe(401);
  });

  test('400 when name is missing', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    const req = new Request('http://localhost', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
    expect((await POST(req)).status).toBe(400);
  });

  test('403 when free user has 3 projects', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    mockGetProjects.mockResolvedValueOnce([
      { id: '1', user_id: 'u-1', name: 'A', github_repo: null, score: null, last_scanned: null, created_at: '' },
      { id: '2', user_id: 'u-1', name: 'B', github_repo: null, score: null, last_scanned: null, created_at: '' },
      { id: '3', user_id: 'u-1', name: 'C', github_repo: null, score: null, last_scanned: null, created_at: '' },
    ] as never);
    // No mockCreate setup — assertProjectLimit should throw before reaching createProject
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ name: 'D' }), headers: { 'Content-Type': 'application/json' } });
    expect((await POST(req)).status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('201 creates project for free user with < 3 projects', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    // Only 1 existing project — under the limit
    mockGetProjects.mockResolvedValueOnce([MOCK_PROJECT] as never);
    mockCreate.mockResolvedValueOnce(MOCK_PROJECT as never);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ name: 'My App' }), headers: { 'Content-Type': 'application/json' } });
    expect((await POST(req)).status).toBe(201);
  });

  test('201 pro user can create more than 3 projects', async () => {
    mockSession.mockResolvedValueOnce(PRO_SESSION as never);
    mockGetProjects.mockResolvedValueOnce(Array(10).fill(MOCK_PROJECT) as never);
    mockCreate.mockResolvedValueOnce(MOCK_PROJECT as never);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ name: 'My App' }), headers: { 'Content-Type': 'application/json' } });
    expect((await POST(req)).status).toBe(201);
  });
});

// ─── PATCH /api/projects/[id] ─────────────────────────────────────────────────

describe('PATCH /api/projects/[id]', () => {
  test('404 for non-existent project', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    mockGetById.mockResolvedValueOnce(null);
    const req = new Request('http://localhost', { method: 'PATCH', body: JSON.stringify({ name: 'New' }), headers: { 'Content-Type': 'application/json' } });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'bad-id' }) });
    expect(res.status).toBe(404);
  });

  test('200 updates project name', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    mockGetById.mockResolvedValueOnce(MOCK_PROJECT as never);
    mockUpdate.mockResolvedValueOnce({ ...MOCK_PROJECT, name: 'Updated' } as never);
    const req = new Request('http://localhost', { method: 'PATCH', body: JSON.stringify({ name: 'Updated' }), headers: { 'Content-Type': 'application/json' } });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'p-1' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { project: typeof MOCK_PROJECT };
    expect(body.project.name).toBe('Updated');
  });
});

// ─── DELETE /api/projects/[id] ───────────────────────────────────────────────

describe('DELETE /api/projects/[id]', () => {
  test('404 for non-existent project', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    mockGetById.mockResolvedValueOnce(null);
    const res = await DELETE(new Request('http://localhost'), { params: Promise.resolve({ id: 'bad' }) });
    expect(res.status).toBe(404);
  });

  test('200 deletes project', async () => {
    mockSession.mockResolvedValueOnce(FREE_SESSION as never);
    mockGetById.mockResolvedValueOnce(MOCK_PROJECT as never);
    mockDelete.mockResolvedValueOnce(undefined);
    const res = await DELETE(new Request('http://localhost'), { params: Promise.resolve({ id: 'p-1' }) });
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith('p-1', 'u-1');
  });
});
