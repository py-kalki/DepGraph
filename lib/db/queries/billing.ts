// =============================================================================
// DepGraph — Billing DB Queries
// CRUD for customers, subscriptions, payments, webhook_events.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type {
  DbCustomer, DbSubscription, DbPayment,
  DbWebhookEvent, RazorpaySubStatus, PaymentStatus,
} from '@/lib/types';

// ─── Customers ────────────────────────────────────────────────────────────────

/**
 * Upsert a Razorpay customer record.
 * Also updates users.razorpay_customer_id.
 */
export async function upsertCustomer(
  userId: string,
  razorpayCustomerId: string,
  email: string | null,
): Promise<DbCustomer> {
  const db = getDbClient();

  // Upsert into customers table
  const { data, error } = await db
    .from('customers')
    .upsert(
      { user_id: userId, razorpay_customer_id: razorpayCustomerId, email },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) throw new Error(`[DB] upsertCustomer: ${error.message}`);

  // Sync razorpay_customer_id onto users row
  await db
    .from('users')
    .update({ razorpay_customer_id: razorpayCustomerId })
    .eq('id', userId);

  return data as DbCustomer;
}

export async function getCustomerByUserId(userId: string): Promise<DbCustomer | null> {
  const db = getDbClient();
  const { data } = await db
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .single();
  return (data as DbCustomer) ?? null;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function createSubscriptionRecord(params: {
  userId: string;
  razorpaySubscriptionId: string;
  razorpayPlanId: string;
  plan: 'pro';
}): Promise<DbSubscription> {
  const db = getDbClient();

  const { data, error } = await db
    .from('subscriptions')
    .insert({
      user_id:                  params.userId,
      razorpay_subscription_id: params.razorpaySubscriptionId,
      razorpay_plan_id:         params.razorpayPlanId,
      plan:                     params.plan,
      status:                   'created',
    })
    .select()
    .single();

  if (error) throw new Error(`[DB] createSubscriptionRecord: ${error.message}`);
  return data as DbSubscription;
}

export async function updateSubscriptionStatus(
  razorpaySubscriptionId: string,
  status: RazorpaySubStatus,
  dates: { currentStart?: string | null; currentEnd?: string | null },
): Promise<void> {
  const db = getDbClient();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (dates.currentStart !== undefined) update.current_start = dates.currentStart;
  if (dates.currentEnd !== undefined)   update.current_end   = dates.currentEnd;

  await db
    .from('subscriptions')
    .update(update)
    .eq('razorpay_subscription_id', razorpaySubscriptionId);
}

export async function getActiveSubscriptionByUserId(
  userId: string,
): Promise<DbSubscription | null> {
  const db = getDbClient();
  const { data } = await db
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['authenticated', 'active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return (data as DbSubscription) ?? null;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function insertPayment(params: {
  userId: string;
  subscriptionId: string | null;
  razorpayPaymentId: string;
  razorpayOrderId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  capturedAt: string | null;
}): Promise<DbPayment> {
  const db = getDbClient();

  const { data, error } = await db
    .from('payments')
    .insert({
      user_id:            params.userId,
      subscription_id:    params.subscriptionId,
      razorpay_payment_id: params.razorpayPaymentId,
      razorpay_order_id:  params.razorpayOrderId,
      amount:             params.amount,
      currency:           params.currency,
      status:             params.status,
      captured_at:        params.capturedAt,
    })
    .select()
    .single();

  if (error) throw new Error(`[DB] insertPayment: ${error.message}`);
  return data as DbPayment;
}

export async function getPaymentsByUserId(userId: string, limit = 20): Promise<DbPayment[]> {
  const db = getDbClient();
  const { data } = await db
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as DbPayment[];
}

// ─── Webhook Events ───────────────────────────────────────────────────────────

export async function insertWebhookEvent(
  razorpayEventId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const db = getDbClient();
  const { data, error } = await db
    .from('webhook_events')
    .insert({ razorpay_event_id: razorpayEventId, event_type: eventType, payload })
    .select('id')
    .single();
  if (error) throw new Error(`[DB] insertWebhookEvent: ${error.message}`);
  return (data as { id: string }).id;
}

export async function markWebhookProcessed(
  id: string,
  error: string | null,
): Promise<void> {
  const db = getDbClient();
  await db
    .from('webhook_events')
    .update({
      processed:    error === null,
      processed_at: new Date().toISOString(),
      error,
    })
    .eq('id', id);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function insertInvoice(params: {
  userId: string;
  subscriptionId: string | null;
  razorpayInvoiceId: string | null;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  pdfUrl: string | null;
  paidAt: string | null;
}): Promise<void> {
  const db = getDbClient();
  const { error } = await db.from('invoices').insert({
    user_id:             params.userId,
    subscription_id:     params.subscriptionId,
    razorpay_invoice_id: params.razorpayInvoiceId,
    razorpay_payment_id: params.razorpayPaymentId,
    amount_paise:        params.amountPaise,
    currency:            params.currency,
    pdf_url:             params.pdfUrl,
    status:              'paid',
    paid_at:             params.paidAt ?? new Date().toISOString(),
  });
  if (error) {
    console.warn(`[DB] insertInvoice failed: ${error.message}`);
  }
}

export async function getInvoicesByUserId(
  userId: string,
  limit = 20,
): Promise<import('@/lib/types').DbInvoice[]> {
  const db = getDbClient();
  const { data } = await db
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as import('@/lib/types').DbInvoice[];
}

/**
 * Mark an existing subscription as cancelled (for reactivation flow).
 * A new subscription record will be inserted by the webhook handler.
 */
export async function markSubscriptionCancelled(
  userId: string,
  razorpaySubscriptionId: string,
): Promise<void> {
  const db = getDbClient();
  await db
    .from('subscriptions')
    .update({
      status:       'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('razorpay_subscription_id', razorpaySubscriptionId);
}
