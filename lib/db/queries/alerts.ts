// =============================================================================
// DepGraph — Alert Subscriptions DB Queries
// CRUD for alert_subscriptions table.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbAlertSubscription, AlertType, AlertChannel } from '@/lib/types';

export async function createAlertSubscription(params: {
  userId:     string;
  projectId:  string;
  alertType:  AlertType;
  threshold?: number | null;
  channel:    AlertChannel;
  destination: string;
}): Promise<DbAlertSubscription> {
  const db = getDbClient();
  const { data, error } = await db
    .from('alert_subscriptions')
    .insert({
      user_id:     params.userId,
      project_id:  params.projectId,
      alert_type:  params.alertType,
      threshold:   params.threshold ?? null,
      channel:     params.channel,
      destination: params.destination,
      is_active:   true,
    })
    .select()
    .single();

  if (error) throw new Error(`[DB] createAlertSubscription: ${error.message}`);
  return data as DbAlertSubscription;
}

export async function getAlertsByUserId(userId: string): Promise<DbAlertSubscription[]> {
  const db = getDbClient();
  const { data } = await db
    .from('alert_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []) as DbAlertSubscription[];
}

export async function getActiveAlertsByProjectId(projectId: string): Promise<DbAlertSubscription[]> {
  const db = getDbClient();
  const { data } = await db
    .from('alert_subscriptions')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true);
  return (data ?? []) as DbAlertSubscription[];
}

export async function updateAlertSubscription(
  id: string,
  userId: string,
  updates: Partial<Pick<DbAlertSubscription, 'threshold' | 'destination' | 'is_active'>>,
): Promise<DbAlertSubscription | null> {
  const db = getDbClient();
  const { data, error } = await db
    .from('alert_subscriptions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId) // ownership check
    .select()
    .single();

  if (error) return null;
  return data as DbAlertSubscription;
}

export async function deleteAlertSubscription(id: string, userId: string): Promise<boolean> {
  const db = getDbClient();
  const { error } = await db
    .from('alert_subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // ownership check

  return !error;
}

/** Get all active alert subscriptions that have a destination email address. */
export async function getAllActiveEmailAlerts(): Promise<DbAlertSubscription[]> {
  const db = getDbClient();
  const { data } = await db
    .from('alert_subscriptions')
    .select('*')
    .eq('is_active', true)
    .eq('channel', 'email');
  return (data ?? []) as DbAlertSubscription[];
}
