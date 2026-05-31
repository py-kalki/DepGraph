import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect }         from 'next/navigation';
import { authOptions }      from '@/lib/auth/config';
import BillingDashboard     from '@/components/billing/BillingDashboard';
import { getActiveSubscriptionByUserId, getInvoicesByUserId } from '@/lib/db/queries/billing';
import { getUserById }      from '@/lib/db/queries/users';

export const metadata: Metadata = {
  title: 'Billing — DepGraph',
  description: 'Manage your DepGraph subscription and billing history.',
};

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) redirect('/login');

  const userId = session.userId;

  const [user, subscription, invoices] = await Promise.all([
    getUserById(userId),
    getActiveSubscriptionByUserId(userId),
    getInvoicesByUserId(userId),
  ]);

  const plan = (user?.plan ?? 'free') as 'free' | 'pro' | 'team';

  return (
    <div className="dashboard-shell-content">
      <BillingDashboard
        plan={plan}
        subscription={subscription}
        invoices={invoices}
      />
    </div>
  );
}
