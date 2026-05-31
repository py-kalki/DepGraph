// =============================================================================
// DepGraph — Email Queue
// Sequential in-memory queue compatible with Vercel serverless (no BullMQ).
// Max 50 emails per cron invocation to respect Resend rate limits.
// =============================================================================

import { sendEmail, type SendEmailParams } from './sender';

const MAX_PER_RUN = 50;

export interface QueueResult {
  sent:   number;
  failed: number;
  skipped: number;
}

/**
 * Process a batch of emails sequentially.
 * Stops at MAX_PER_RUN to avoid Resend rate limits within a single cron run.
 */
export async function processEmailQueue(
  emails: SendEmailParams[],
): Promise<QueueResult> {
  const batch = emails.slice(0, MAX_PER_RUN);
  const skipped = emails.length - batch.length;

  let sent   = 0;
  let failed = 0;

  for (const email of batch) {
    try {
      await sendEmail(email);
      sent++;
    } catch {
      failed++;
    }
  }

  if (skipped > 0) {
    console.warn(`[EmailQueue] Skipped ${skipped} emails — over MAX_PER_RUN (${MAX_PER_RUN})`);
  }

  return { sent, failed, skipped };
}
