// =============================================================================
// DepGraph — Notification Logs + Email Preferences DB Queries
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbNotificationLog, DbEmailPreferences, NotificationStatus } from '@/lib/types';

// ─── Notification Logs ────────────────────────────────────────────────────────

export async function insertNotificationLog(params: {
  userId:              string;
  alertSubscriptionId: string | null;
  emailType:           string;
  recipient:           string;
  status:              NotificationStatus;
  error:               string | null;
  resendMessageId:     string | null;
  sentAt:              string | null;
}): Promise<void> {
  const db = getDbClient();
  const { error } = await db.from('notification_logs').insert({
    user_id:                params.userId,
    alert_subscription_id:  params.alertSubscriptionId,
    email_type:             params.emailType,
    recipient:              params.recipient,
    status:                 params.status,
    error:                  params.error,
    resend_message_id:      params.resendMessageId,
    sent_at:                params.sentAt,
  });

  if (error) {
    // Non-fatal — logging failure must not interrupt email delivery
    console.warn(`[DB] insertNotificationLog failed: ${error.message}`);
  }
}

export async function getNotificationLogsByUserId(
  userId: string,
  limit = 50,
): Promise<DbNotificationLog[]> {
  const db = getDbClient();
  const { data } = await db
    .from('notification_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as DbNotificationLog[];
}

// ─── Email Preferences ────────────────────────────────────────────────────────

const DEFAULT_PREFS = {
  score_drop_enabled:  true,
  new_cve_enabled:     true,
  abandonment_enabled: true,
  digest_enabled:      true,
  digest_day:          1, // Monday
};

/**
 * Get email preferences for a user, creating default row if not exists.
 */
export async function getOrCreateEmailPreferences(userId: string): Promise<DbEmailPreferences> {
  const db = getDbClient();
  const { data: existing } = await db
    .from('email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) return existing as DbEmailPreferences;

  const { data, error } = await db
    .from('email_preferences')
    .insert({ user_id: userId, ...DEFAULT_PREFS })
    .select()
    .single();

  if (error) throw new Error(`[DB] getOrCreateEmailPreferences: ${error.message}`);
  return data as DbEmailPreferences;
}

export async function updateEmailPreferences(
  userId: string,
  updates: Partial<Omit<DbEmailPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<DbEmailPreferences> {
  const db = getDbClient();
  const { data, error } = await db
    .from('email_preferences')
    .upsert(
      { user_id: userId, ...DEFAULT_PREFS, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) throw new Error(`[DB] updateEmailPreferences: ${error.message}`);
  return data as DbEmailPreferences;
}

/** Fetch all users with digest_enabled=true for a given digest_day (0–6). */
export async function getUsersWithDigestEnabled(digestDay: number): Promise<DbEmailPreferences[]> {
  const db = getDbClient();
  const { data } = await db
    .from('email_preferences')
    .select('*')
    .eq('digest_enabled', true)
    .eq('digest_day', digestDay);
  return (data ?? []) as DbEmailPreferences[];
}
