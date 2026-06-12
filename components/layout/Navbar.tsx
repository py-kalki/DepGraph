// =============================================================================
// DepGraph — Navbar (Server Component)
// Top navigation bar — logo + username + sign-out.
// Reads session server-side; no flash of unauthenticated state.
// =============================================================================

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { User } from 'lucide-react';

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="navbar" role="banner">
      <div className="navbar-brand">
        {/* Only visible on mobile since sidebar handles desktop logo */}
      </div>
      <div className="navbar-actions">
        {session && (
          <>
            <div className="avatar">
              <User size={16} color="#888888" />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', color: '#FFFFFF', fontWeight: 600 }}>
              {session.githubLogin}
            </span>
            <div style={{ width: '1px', height: '1.5rem', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
            <SignOutButton />
          </>
        )}
      </div>
    </header>
  );
}
