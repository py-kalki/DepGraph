// =============================================================================
// DepGraph — NextAuth.js Configuration
// GitHub OAuth provider + Supabase user upsert + JWT session strategy.
// PRD §F-04: GitHub OAuth only (V1). JWT strategy, no adapter needed.
// =============================================================================

import type { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { upsertUser } from '@/lib/db/queries/users';

declare module 'next-auth' {
  interface Session {
    userId: string;
    plan: string;
    githubLogin: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    plan: string;
    githubLogin: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    /**
     * signIn: upsert the user row in Supabase on every login.
     * Runs before jwt callback; errors here abort the sign-in.
     */
    async signIn({ user, account, profile }) {
      if (!profile || !account || account.provider !== 'github') return false;
      const githubProfile = profile as { id: number; login: string };
      try {
        await upsertUser({
          githubId: githubProfile.id,
          githubLogin: githubProfile.login,
          email: user.email ?? null,
        });
        return true;
      } catch (err) {
        console.error('[NextAuth] signIn upsertUser failed:', err);
        return false;
      }
    },

    /**
     * jwt: embed Supabase userId + plan into the JWT on first sign-in.
     * `user` is only present on the initial sign-in; subsequent calls use the
     * existing token.
     */
    async jwt({ token, user: _user, account, profile }) {
      if (account && profile) {
        const githubProfile = profile as { id: number; login: string };
        const dbUser = await upsertUser({
          githubId: githubProfile.id,
          githubLogin: githubProfile.login,
          email: _user?.email ?? null,
        });
        token.userId = dbUser.id;
        token.plan = dbUser.plan;
        token.githubLogin = githubProfile.login;
      }
      return token;
    },

    /**
     * session: expose userId, plan, githubLogin to the client via useSession().
     */
    async session({ session, token }) {
      session.userId = token.userId;
      session.plan = token.plan;
      session.githubLogin = token.githubLogin;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
};
