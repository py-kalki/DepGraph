// =============================================================================
// DepGraph — Navbar (Server Component)
// Top navigation bar — logo + username + sign-out.
// Reads session server-side; no flash of unauthenticated state.
// =============================================================================

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { SignOutButton } from '@/components/auth/SignOutButton';

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="navbar" role="banner">
      <div className="navbar-brand">
        Dep<span>Graph</span>
      </div>
      <div className="navbar-actions">
        {session && (
          <>
            <span className="text-sm text-muted" aria-label="Signed in as">
              {session.githubLogin}
            </span>
            <SignOutButton />
          </>
        )}
      </div>
    </header>
  );
}
