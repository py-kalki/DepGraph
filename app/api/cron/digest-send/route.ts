// =============================================================================
// DepGraph — GET /api/cron/digest-send
// Runs weekly on Mondays at 09:00 UTC via Vercel Cron.
// Sends weekly digest emails to all users with digest_enabled=true.
// =============================================================================

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getEnv } from '@/lib/env';
import { getUsersWithDigestEnabled } from '@/lib/db/queries/notifications';
import { getDbClient } from '@/lib/db/client';
import { processEmailQueue } from '@/lib/services/resend/queue';
import { weeklyDigestSubject, weeklyDigestHtml, weeklyDigestText } from '@/lib/services/resend/templates/weeklyDigest';
import type { WeeklyDigestPayload } from '@/lib/types';
import type { SendEmailParams } from '@/lib/services/resend/sender';

export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const cronSecret  = headersList.get('authorization');

  if (cronSecret !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] digest-send: starting');

  try {
    const db     = getDbClient();
    const today  = new Date();
    const dayOfWeek = today.getDay(); // 1 = Monday

    // Fetch users with digest enabled for today's day
    const prefsRows = await getUsersWithDigestEnabled(dayOfWeek);
    if (prefsRows.length === 0) {
      return NextResponse.json({ sent: 0, ok: true }, { status: 200 });
    }

    const userIds = prefsRows.map((p) => p.user_id);

    // Fetch user email addresses
    const { data: users } = await db
      .from('users')
      .select('id, email, github_login')
      .in('id', userIds);

    const userMap = new Map<string, { email: string | null; github_login: string }>(
      (users ?? []).map((u) => [u.id as string, u as never]),
    );

    // Fetch projects per user
    const { data: projects } = await db
      .from('projects')
      .select('id, user_id, name, score, share_token')
      .in('user_id', userIds);

    const projectsByUser = new Map<string, typeof projects>();
    for (const proj of (projects ?? [])) {
      const uid = proj.user_id as string;
      if (!projectsByUser.has(uid)) projectsByUser.set(uid, []);
      projectsByUser.get(uid)!.push(proj);
    }

    // Build week date strings
    const weekEnd   = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const appUrl = getEnv().NEXT_PUBLIC_APP_URL;

    const emails: SendEmailParams[] = [];

    for (const prefs of prefsRows) {
      const user     = userMap.get(prefs.user_id);
      const userProjects = projectsByUser.get(prefs.user_id) ?? [];

      if (!user?.email || userProjects.length === 0) continue;

      const payload: WeeklyDigestPayload = {
        userName: user.github_login,
        weekStart,
        weekEnd,
        projects: userProjects.map((p) => ({
          name:          p.name as string,
          score:         (p.score as number) ?? 0,
          delta:         0, // Week-over-week delta — would need history query (simplified here)
          criticalCount: 0,
          highCount:     0,
          shareUrl:      p.share_token ? `${appUrl}/report/${p.share_token}` : `${appUrl}/dashboard`,
        })),
      };

      emails.push({
        userId:              prefs.user_id,
        alertSubscriptionId: null,
        emailType:           'digest',
        to:                  user.email,
        subject:             weeklyDigestSubject(payload),
        html:                weeklyDigestHtml(payload),
        text:                weeklyDigestText(payload),
      });
    }

    const result = await processEmailQueue(emails);
    console.log(`[Cron] digest-send: done. sent=${result.sent} failed=${result.failed}`);
    return NextResponse.json({ ...result, ok: true }, { status: 200 });
  } catch (err) {
    console.error('[Cron] digest-send: fatal error', err);
    return NextResponse.json({ error: 'Digest send failed', ok: false }, { status: 200 });
  }
}
