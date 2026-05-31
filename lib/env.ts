// =============================================================================
// DepGraph — Environment Variable Validation
// Validates all required env vars at startup; throws descriptive errors.
// =============================================================================

/**
 * Validated, typed environment configuration.
 * Import this instead of accessing process.env directly throughout the app.
 */
export interface Env {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // GitHub
  GITHUB_TOKEN: string;

  // NextAuth
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  // Razorpay (Week 4 — required for billing routes)
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;

  // Razorpay Plan IDs (Week 5)
  RAZORPAY_PLAN_ID_PRO: string;
  RAZORPAY_PLAN_ID_TEAM: string;

  // Resend (Week 5 — email alerts)
  RESEND_API_KEY: string;

  // Vercel Cron secret (Week 4 — required in production)
  CRON_SECRET: string;

  // App
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: 'development' | 'test' | 'production';
}

/**
 * Required environment variables for Week 1 (data pipeline).
 * Auth, payments, email are Week 2+ and not validated here.
 */
const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'GITHUB_TOKEN',
] as const;

/**
 * Optional env vars with defaults.
 */
const DEFAULTS: Partial<Env> = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  NEXTAUTH_URL: 'http://localhost:3000',
  // Razorpay defaults allow non-billing routes to start without billing keys
  RAZORPAY_KEY_ID: 'rzp_test_placeholder',
  RAZORPAY_KEY_SECRET: 'placeholder_secret',
  RAZORPAY_WEBHOOK_SECRET: 'placeholder_webhook_secret',
  RAZORPAY_PLAN_ID_PRO: 'plan_pro_placeholder',
  RAZORPAY_PLAN_ID_TEAM: 'plan_team_placeholder',
  RESEND_API_KEY: 're_placeholder',
  CRON_SECRET: 'dev_cron_secret',
  // NextAuth placeholders for local dev
  NEXTAUTH_SECRET: 'dev_nextauth_secret',
  GITHUB_CLIENT_ID: 'dev_github_client_id',
  GITHUB_CLIENT_SECRET: 'dev_github_client_secret',
};

function validateEnv(): Env {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[DepGraph] Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL:    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY:   process.env.SUPABASE_SERVICE_ROLE_KEY!,
    UPSTASH_REDIS_REST_URL:      process.env.UPSTASH_REDIS_REST_URL!,
    UPSTASH_REDIS_REST_TOKEN:    process.env.UPSTASH_REDIS_REST_TOKEN!,
    GITHUB_TOKEN:                process.env.GITHUB_TOKEN!,
    NEXT_PUBLIC_APP_URL:         process.env.NEXT_PUBLIC_APP_URL   ?? DEFAULTS.NEXT_PUBLIC_APP_URL!,
    NODE_ENV:                   (process.env.NODE_ENV as Env['NODE_ENV']) ?? DEFAULTS.NODE_ENV!,
    // NextAuth
    NEXTAUTH_SECRET:             process.env.NEXTAUTH_SECRET       ?? DEFAULTS.NEXTAUTH_SECRET!,
    NEXTAUTH_URL:                process.env.NEXTAUTH_URL           ?? DEFAULTS.NEXTAUTH_URL!,
    GITHUB_CLIENT_ID:            process.env.GITHUB_CLIENT_ID      ?? DEFAULTS.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET:        process.env.GITHUB_CLIENT_SECRET  ?? DEFAULTS.GITHUB_CLIENT_SECRET!,
    // Razorpay
    RAZORPAY_KEY_ID:             process.env.RAZORPAY_KEY_ID       ?? DEFAULTS.RAZORPAY_KEY_ID!,
    RAZORPAY_KEY_SECRET:         process.env.RAZORPAY_KEY_SECRET   ?? DEFAULTS.RAZORPAY_KEY_SECRET!,
    RAZORPAY_WEBHOOK_SECRET:     process.env.RAZORPAY_WEBHOOK_SECRET ?? DEFAULTS.RAZORPAY_WEBHOOK_SECRET!,
    RAZORPAY_PLAN_ID_PRO:        process.env.RAZORPAY_PLAN_ID_PRO  ?? DEFAULTS.RAZORPAY_PLAN_ID_PRO!,
    RAZORPAY_PLAN_ID_TEAM:       process.env.RAZORPAY_PLAN_ID_TEAM ?? DEFAULTS.RAZORPAY_PLAN_ID_TEAM!,
    // Resend
    RESEND_API_KEY:              process.env.RESEND_API_KEY         ?? DEFAULTS.RESEND_API_KEY!,
    // Cron
    CRON_SECRET:                 process.env.CRON_SECRET           ?? DEFAULTS.CRON_SECRET!,
  };
}

/**
 * Cached validated env — call `getEnv()` throughout the app.
 * Lazily validated so test environments can set vars before import.
 */
let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

/**
 * Reset cached env (for testing only).
 */
export function _resetEnvCache(): void {
  _env = null;
}
