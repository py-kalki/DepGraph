import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect }         from 'next/navigation';
import { authOptions }      from '@/lib/auth/config';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { getAlertsByUserId }            from '@/lib/db/queries/alerts';
import { getOrCreateEmailPreferences }  from '@/lib/db/queries/notifications';
import { getUserById }                  from '@/lib/db/queries/users';

export const metadata: Metadata = {
  title: 'Notifications — DepGraph',
  description: 'Configure your DepGraph alert preferences and notification settings.',
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) redirect('/login');

  const userId = session.userId;

  const [user, alerts, prefs] = await Promise.all([
    getUserById(userId),
    getAlertsByUserId(userId),
    getOrCreateEmailPreferences(userId),
  ]);

  const isPro = user?.plan === 'pro';

  return (
    <div className="dashboard-shell-content">
      <NotificationSettings alerts={alerts} prefs={prefs} isPro={isPro} />
    </div>
  );
}
