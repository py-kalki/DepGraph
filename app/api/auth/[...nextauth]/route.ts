// =============================================================================
// DepGraph — NextAuth.js Route Handler
// Catches all /api/auth/* requests (GET + POST).
// =============================================================================

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
