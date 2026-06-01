# Architecture Overview

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL (Supabase) |
| Cache | Redis (Upstash) |
| Auth | NextAuth.js + GitHub OAuth |
| Hosting | Vercel |
| Payments | Razorpay |
| Email | Resend |

---

## Data Flow

```
User: npx depgraph check
         │
         ▼
CLI reads package.json / package-lock.json
         │
         ▼
POST /api/scan  ← Auth: API key or session
         │
         ▼
Check Redis cache (24hr TTL per package)
   HIT  → return cached scores
   MISS → fetch signals in parallel:
           GitHub API (commits, contributors, issues)
           npm registry (downloads, metadata)
           OSV.dev (CVE data)
         │
         ▼
Score engine computes health score (0–100)
         │
         ▼
Store in PostgreSQL + Redis
         │
         ▼
Return scored report → CLI (terminal output) or Dashboard (web)
```

---

## Service Responsibilities

| Service | File | Responsibility |
|---------|------|----------------|
| Score Engine | `lib/services/scoring/engine.ts` | Computes 0–100 health score |
| GitHub Client | `lib/services/github/client.ts` | GitHub API with rate-limit queue |
| npm Client | `lib/services/npm/client.ts` | npm registry + download stats |
| OSV Client | `lib/services/osv/client.ts` | CVE data from OSV.dev |
| Rate Limit Queue | `lib/services/rateLimit/githubQueue.ts` | Token-bucket singleton for GitHub API |
| Cache Monitor | `lib/cache/monitor.ts` | Hit/miss tracking in Redis |
| Cache Warmer | `lib/cache/warmer.ts` | Daily pre-warms top packages |
| Alert Scanner | `lib/services/alerts/scanner.ts` | Sends score-drop / CVE alerts |
| Email Sender | `lib/services/resend/sender.ts` | Transactional email via Resend |

---

## Database Schema

Core tables: `users`, `projects`, `package_scores`, `score_history`, `scan_reports`, `alert_subscriptions`

Week 6 additions: `api_keys`, `action_runs`, `ci_reports`, `pr_comments`, `usage_events`

Indexes: See `supabase/migrations/006_performance_indexes.sql`

Cleanup procedures: See `supabase/migrations/007_cleanup_jobs.sql`

---

## Caching Strategy (PRD §11)

| Data | TTL | Key pattern |
|------|-----|-------------|
| Package score | 24h | `pkg:score:npm:{name}` |
| GitHub signals | 6h | `github:repo:{owner}:{repo}` |
| npm metadata | 12h | `npm:meta:{name}` |
| OSV data | 24h | `osv:npm:{name}` |
| Full scan report | 1h | `scan:report:{lockfileHash}` |

---

## Rate Limits

- GitHub API: 5,000 req/hr (authenticated) — queue pauses at <100 remaining
- npm registry: no auth required, generous limits
- OSV.dev: free, no auth

---

## Error Handling

All API routes use `withErrorHandler` from `lib/errors/handler.ts`:
- Wraps route in try/catch
- Classifies errors to `AppError` subclasses
- Returns `{ error, code }` JSON with correct HTTP status
- Logs 5xx errors via structured logger

---

## Deployment

- **Web:** Vercel (auto-deploys from `main`)
- **Cron:** Vercel Cron — `GET /api/cron/daily-tasks` at 08:00 UTC daily
- **Environment:** See `.env.example` for all required variables
