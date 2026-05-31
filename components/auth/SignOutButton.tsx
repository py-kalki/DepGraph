'use client';
// =============================================================================
// DepGraph — SignOutButton (Client Component)
// Thin wrapper so Navbar (Server Component) can include a client-only signOut.
// =============================================================================

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      id="btn-signout"
      className="btn-signout"
      onClick={() => signOut({ callbackUrl: '/login' })}
      type="button"
    >
      Sign out
    </button>
  );
}
