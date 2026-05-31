// =============================================================================
// Tests: api/projects
// Tests GET /api/projects and POST /api/projects route handlers.
// =============================================================================

import { GET, POST } from '@/app/api/projects/route';
import * as projectsDb from '@/lib/db/queries/projects';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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

import { getServerSession } from 'next-auth';
const mockGetSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockGetUserProjects = projectsDb.getUserProjects as jest.MockedFunction<typeof projectsDb.getUserProjects>;
const mockCreateProject   = projectsDb.createProject   as jest.MockedFunction<typeof projectsDb.createProject>;

const MOCK_SESSION = { userId: 'user-1', plan: 'free', githubLogin: 'testuser' };

const MOCK_PROJECTS = [
  { id: 'proj-1', user_id: 'user-1', name: 'My App', github_repo: 'acme/my-app', score: 74, last_scanned: null, created_at: new Date().toISOString() },
];

// ─── GET /api/projects ────────────────────────────────────────────────────────

describe('GET /api/projects', () => {
  test('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Unauthorized');
  });

  test('returns projects array when authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(MOCK_SESSION as never);
    mockGetUserProjects.mockResolvedValueOnce(MOCK_PROJECTS as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json() as { projects: typeof MOCK_PROJECTS };
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].name).toBe('My App');
  });
});

// ─── POST /api/projects ───────────────────────────────────────────────────────

describe('POST /api/projects', () => {
  test('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Project' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('returns 400 when name is missing', async () => {
    mockGetSession.mockResolvedValueOnce(MOCK_SESSION as never);
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 403 when free tier limit (3 projects) is reached', async () => {
    mockGetSession.mockResolvedValueOnce(MOCK_SESSION as never);
    mockGetUserProjects.mockResolvedValueOnce([
      { id: '1', user_id: 'u', name: 'A', github_repo: null, score: null, last_scanned: null, created_at: '' },
      { id: '2', user_id: 'u', name: 'B', github_repo: null, score: null, last_scanned: null, created_at: '' },
      { id: '3', user_id: 'u', name: 'C', github_repo: null, score: null, last_scanned: null, created_at: '' },
    ] as never);
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'Fourth Project' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Free tier limit');
  });

  test('creates project and returns 201', async () => {
    mockGetSession.mockResolvedValueOnce(MOCK_SESSION as never);
    mockGetUserProjects.mockResolvedValueOnce([] as never);
    mockCreateProject.mockResolvedValueOnce(MOCK_PROJECTS[0] as never);

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'My App', githubRepo: 'acme/my-app' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json() as { project: typeof MOCK_PROJECTS[0] };
    expect(body.project.name).toBe('My App');
  });
});
