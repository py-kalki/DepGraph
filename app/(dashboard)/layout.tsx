// =============================================================================
// DepGraph — Protected Dashboard Layout
// Session guard: redirects unauthenticated users to /login.
// All pages under app/(dashboard)/ are protected.
// =============================================================================

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
