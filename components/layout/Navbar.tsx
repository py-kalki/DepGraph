// =============================================================================
// DepGraph — Navbar (Client Component)
// Top navigation bar — hamburger (mobile) + username + sign-out.
// =============================================================================

'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, Menu, LogOut } from 'lucide-react';

interface Props {
  onMenuToggle: () => void;
}

export function MobileNavbar({ onMenuToggle }: Props) {
  const { data: session } = useSession();

  return (
    <header className="navbar" role="banner">
      {/* Hamburger — mobile only, hidden on desktop via CSS */}
      <button
        className="navbar-hamburger"
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Brand — shown only on mobile (desktop sees sidebar logo) */}
      <div className="navbar-brand navbar-brand-mobile">
        <span>dep</span><span>Graph</span>
      </div>

      <div className="navbar-actions">
        {session && (
          <>
            <div className="avatar">
              <User size={16} color="#888888" />
            </div>
            <span
              className="navbar-username"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8125rem',
                color: '#FFFFFF',
                fontWeight: 600,
              }}
            >
              {session.githubLogin}
            </span>
            <div
              style={{
                width: '1px', height: '1.5rem',
                background: 'rgba(255,255,255,0.15)',
                margin: '0 0.5rem',
              }}
              className="navbar-divider"
            />
            <button
              className="btn-signout"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={14} />
              <span className="signout-label">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

// Named alias for backward compat
export { MobileNavbar as Navbar };
