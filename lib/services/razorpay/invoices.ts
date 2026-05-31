// =============================================================================
// DepGraph — Razorpay Invoice Service
// Fetches invoice data from Razorpay and persists to DB.
// =============================================================================

import { getRazorpay } from './client';
import { insertInvoice } from '@/lib/db/queries/billing';

export interface RazorpayInvoiceData {
  id: string;
  razorpayInvoiceId: string | null;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  pdfUrl: string | null;
  status: 'paid' | 'void' | 'draft';
  paidAt: string | null;
}

/**
 * Fetch invoice PDF details from Razorpay by invoice ID and persist to DB.
 */
export async function fetchAndStoreInvoice(
  userId: string,
  subscriptionId: string,
  razorpayInvoiceId: string,
  razorpayPaymentId: string | null,
  amountPaise: number,
  currency: string = 'INR',
): Promise<void> {
  const razorpay = getRazorpay();

  let pdfUrl: string | null = null;
  let paidAt: string | null = null;

  try {
    // Fetch invoice details from Razorpay
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoice = await (razorpay.invoices as any).fetch(razorpayInvoiceId);
    pdfUrl  = (invoice.short_url as string) ?? null; // Razorpay short URL for invoice PDF
    paidAt  = invoice.paid_at
      ? new Date((invoice.paid_at as number) * 1000).toISOString()
      : null;
  } catch {
    // Non-fatal — store what we have even if fetch fails
    console.warn(`[Invoices] Failed to fetch invoice details for ${razorpayInvoiceId}`);
  }

  await insertInvoice({
    userId,
    subscriptionId,
    razorpayInvoiceId,
    razorpayPaymentId,
    amountPaise,
    currency,
    pdfUrl,
    paidAt,
  });
}
