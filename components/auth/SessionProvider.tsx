'use client';
// =============================================================================
// DepGraph — SessionProvider wrapper
// Thin client wrapper around next-auth/react SessionProvider.
// Placed in components/ so root layout.tsx remains a Server Component.
// =============================================================================

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
