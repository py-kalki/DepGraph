// =============================================================================
// DepGraph — DB Queries: users
// Upserts GitHub OAuth user into Supabase `users` table.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbUser } from '@/lib/types';

export interface UpsertUserInput {
  githubId: number;
  githubLogin: string;
  email: string | null;
}

/**
 * Upsert user on login.
 * Returns the user record and a boolean indicating if it was newly created.
 */
export async function upsertUser(data: {
  githubId: number;
  githubLogin: string;
  email: string | null;
}): Promise<{ user: { id: string; plan: string }; isNew: boolean }> {
  const db = getDbClient();
  
  // Check if user exists first to determine if new
  const { data: existing } = await db
    .from('users')
    .select('id, plan')
    .eq('github_id', data.githubId)
    .single();

  const { data: user, error } = await db
    .from('users')
    .upsert({
      github_id:    data.githubId,
      github_login: data.githubLogin,
      email:        data.email,
    }, { onConflict: 'github_id' })
    .select('id, plan')
    .single();

  if (error || !user) {
    throw new Error(`Failed to upsert user: ${error?.message}`);
  }

  return { user, isNew: !existing };
}

/**
 * Fetch a user by their Supabase UUID.
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  const db = getDbClient();

  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as DbUser;
}

/**
 * Update a user's plan (called on subscription.activated / subscription.cancelled).
 */
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro',
): Promise<void> {
  const db = getDbClient();
  const { error } = await db
    .from('users')
    .update({ plan })
    .eq('id', userId);
  if (error) throw new Error(`[DB] updateUserPlan: ${error.message}`);
}

/**
 * Update a user's subscription_status column.
 * Values: inactive | active | cancelled | past_due
 */
export async function updateUserSubscriptionStatus(
  userId: string,
  subscriptionStatus: string,
): Promise<void> {
  const db = getDbClient();
  const { error } = await db
    .from('users')
    .update({ subscription_status: subscriptionStatus })
    .eq('id', userId);
  if (error) throw new Error(`[DB] updateUserSubscriptionStatus: ${error.message}`);
}
