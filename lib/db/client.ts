// =============================================================================
// DepGraph — Supabase Database Client
// Server-side only. Uses service role key for full access.
// NEVER import this in client components.
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '@/lib/env';

let _supabase: SupabaseClient | null = null;

/**
 * Returns a Supabase client using the service role key.
 * Singleton — reused across requests in the same server process.
 *
 * IMPORTANT: This bypasses Row Level Security.
 * All data access control must be handled at the API layer.
 */
export function getDbClient(): SupabaseClient {
  if (!_supabase) {
    const env = getEnv();
    _supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabase;
}
