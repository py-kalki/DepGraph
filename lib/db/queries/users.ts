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
 * Upsert a user row by github_id.
 * On conflict (github_id), update github_login and email but preserve plan.
 * Returns the full user row (including Supabase UUID and plan).
 */
export async function upsertUser(input: UpsertUserInput): Promise<DbUser> {
  const db = getDbClient();

  const { data, error } = await db
    .from('users')
    .upsert(
      {
        github_id: input.githubId,
        github_login: input.githubLogin,
        email: input.email,
      },
      {
        onConflict: 'github_id',
        ignoreDuplicates: false,
      }
    )
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`[DB] upsertUser failed: ${error?.message}`);
  }

  return data as DbUser;
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
  plan: 'free' | 'pro' | 'team',
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
