// =============================================================================
// DepGraph — Beta User Management (Week 8)
// =============================================================================

import { getDbClient } from '@/lib/db/client';

export async function isBetaUser(userId: string): Promise<boolean> {
  const db = getDbClient();
  const { data } = await db
    .from('beta_users')
    .select('id')
    .eq('user_id', userId)
    .single();
  return !!data;
}

export async function createBetaUser(userId: string, code?: string): Promise<void> {
  const db = getDbClient();
  await db.from('beta_users').upsert({
    user_id: userId,
    access_code: code ?? null,
  });
}

export async function submitFeedback(
  userId: string,
  data: { rating: number; message: string; category: string }
): Promise<void> {
  const db = getDbClient();
  await db.from('feedback').insert({
    user_id:  userId,
    rating:   data.rating,
    message:  data.message,
    category: data.category,
  });

  // Mark beta user as having submitted feedback
  await db
    .from('beta_users')
    .update({ feedback_submitted: true })
    .eq('user_id', userId);
}
