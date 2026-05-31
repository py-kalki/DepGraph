// =============================================================================
// Tests: auth/nextauth
// Tests NextAuth signIn/jwt/session callbacks behavior.
// =============================================================================

import { authOptions } from '@/lib/auth/config';

jest.mock('@/lib/db/queries/users', () => ({
  upsertUser: jest.fn().mockResolvedValue({
    id: 'uuid-1',
    github_id: 42,
    github_login: 'testuser',
    email: 'test@example.com',
    plan: 'free',
    created_at: new Date().toISOString(),
  }),
}));

import { upsertUser } from '@/lib/db/queries/users';
const mockUpsertUser = upsertUser as jest.MockedFunction<typeof upsertUser>;

describe('NextAuth config', () => {
  test('providers array contains GitHub', () => {
    const ids = authOptions.providers.map((p) => p.id);
    expect(ids).toContain('github');
  });

  test('session strategy is jwt', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  test('signIn page is /login', () => {
    expect(authOptions.pages?.signIn).toBe('/login');
  });
});

describe('NextAuth signIn callback', () => {
  test('calls upsertUser and returns true for GitHub provider', async () => {
    const signIn = authOptions.callbacks!.signIn!;

    // Use explicit `any` cast to avoid brittle next-auth internal type constraints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (signIn as any)({
      user: { id: '1', email: 'test@example.com' },
      account: { provider: 'github', type: 'oauth', providerAccountId: '42' },
      profile: { id: 42, login: 'testuser' },
    });

    expect(result).toBe(true);
    expect(mockUpsertUser).toHaveBeenCalledWith({
      githubId: 42,
      githubLogin: 'testuser',
      email: 'test@example.com',
    });
  });

  test('returns false for non-GitHub providers', async () => {
    const signIn = authOptions.callbacks!.signIn!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (signIn as any)({
      user: { id: '1', email: 'test@example.com' },
      account: { provider: 'google', type: 'oauth', providerAccountId: '99' },
      profile: {},
    });

    expect(result).toBe(false);
  });
});

describe('NextAuth jwt callback', () => {
  beforeEach(() => jest.clearAllMocks());

  test('embeds userId and plan from upsertUser on first sign-in', async () => {
    const jwt = authOptions.callbacks!.jwt!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await (jwt as any)({
      token: {},
      user: { id: '1', email: 'test@example.com' },
      account: { provider: 'github', type: 'oauth', providerAccountId: '42' },
      profile: { id: 42, login: 'testuser' },
      trigger: 'signIn',
    });

    expect(token.userId).toBe('uuid-1');
    expect(token.plan).toBe('free');
    expect(token.githubLogin).toBe('testuser');
  });

  test('returns token unchanged when no account (subsequent requests)', async () => {
    const jwt = authOptions.callbacks!.jwt!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await (jwt as any)({
      token: { userId: 'uuid-1', plan: 'free', githubLogin: 'testuser' },
      user: undefined,
      account: null,
      profile: undefined,
      trigger: 'update',
    });

    expect(token.userId).toBe('uuid-1');
    // upsertUser should NOT be called when account is null (no new sign-in)
    expect(mockUpsertUser).not.toHaveBeenCalled();
  });
});

describe('NextAuth session callback', () => {
  test('exposes userId and plan in session', async () => {
    const sessionCb = authOptions.callbacks!.session!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (sessionCb as any)({
      session: { user: { email: 'test@example.com' }, expires: '' },
      token: { userId: 'uuid-1', plan: 'free', githubLogin: 'testuser' },
    });

    expect(session.userId).toBe('uuid-1');
    expect(session.plan).toBe('free');
    expect(session.githubLogin).toBe('testuser');
  });
});
