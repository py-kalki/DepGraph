// =============================================================================
// DepGraph — Resend Email Client
// Singleton Resend SDK instance.
// =============================================================================

import { Resend } from 'resend';
import { getEnv } from '@/lib/env';

let _client: Resend | null = null;

export function getResend(): Resend {
  if (!_client) {
    _client = new Resend(getEnv().RESEND_API_KEY);
  }
  return _client;
}

export const FROM_ADDRESS  = 'alerts@depgraph.dev';
export const REPLY_TO      = 'support@depgraph.dev';
