# Security & Production Audit

## Authentication Audit
- [x] NextAuth uses secure JWT strategy
- [x] Cookies are Secure and HttpOnly in production
- [x] Supabase uses server-side service role key only for admin actions
- [x] Client-side Supabase client uses anonymous key with RLS

## API Security Audit
- [x] All protected routes verify `session.userId`
- [x] GitHub rate limits strictly enforced via `githubQueue` (token bucket)
- [x] Next.js `poweredByHeader` disabled in `next.config.mjs`
- [x] CORS headers restricted (if exposing public API)

## Billing Security Audit
- [x] Razorpay webhook signature verified using `crypto.timingSafeEqual` or HMAC
- [x] Webhook idempotency enforced via `webhook_events` table
- [x] Pro features guarded by `assertProjectLimit` and `planGuard` middleware
- [x] Subscription downgrades correctly restrict future access

## Database Security (RLS)
- [x] `projects` — `user_id = auth.uid()`
- [x] `beta_users` — `user_id = auth.uid()`
- [x] `feedback` — `user_id = auth.uid()`
- [x] `users` — `id = auth.uid()`

## Environment Secrets Validation
Ensure the following are set in Vercel Production:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_TOKEN`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
