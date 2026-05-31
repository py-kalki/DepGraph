// =============================================================================
// DepGraph — Resend Email Sender (with retry logic)
// Max 3 attempts, exponential backoff: 500ms → 1s → 2s.
// Logs every send attempt to notification_logs table.
// =============================================================================

import { getResend, FROM_ADDRESS, REPLY_TO } from './client';
import { insertNotificationLog } from '@/lib/db/queries/notifications';

export interface SendEmailParams {
  userId: string;
  alertSubscriptionId: string | null;
  emailType: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

const MAX_RETRIES  = 3;
const BASE_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send an email via Resend with exponential-backoff retry.
 * Always logs the result to notification_logs.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const resend = getResend();
  let lastError: string | null = null;
  let messageId: string | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1)); // 0ms, 500ms, 1000ms
    }

    try {
      const { data, error } = await resend.emails.send({
        from:     FROM_ADDRESS,
        replyTo:  REPLY_TO,
        to:       params.to,
        subject:  params.subject,
        html:     params.html,
        text:     params.text,
      });

      if (error) {
        lastError = error.message;
        // 429 = rate limit — always retry
        // 4xx other = permanent failure, break early
        if (!error.message.includes('429') && attempt >= 1) break;
        continue;
      }

      messageId = (data as { id?: string } | null)?.id ?? null;
      lastError = null;
      break; // Success
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  const succeeded = lastError === null;

  await insertNotificationLog({
    userId:               params.userId,
    alertSubscriptionId:  params.alertSubscriptionId,
    emailType:            params.emailType,
    recipient:            params.to,
    status:               succeeded ? 'sent' : 'failed',
    error:                lastError,
    resendMessageId:      messageId,
    sentAt:               succeeded ? new Date().toISOString() : null,
  });

  if (!succeeded) {
    console.warn(`[Email] Failed to send ${params.emailType} to ${params.to}: ${lastError}`);
  }
}
