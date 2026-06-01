# Post-Launch Support Workflow

## 1. Feedback & Bug Intake
All user feedback flows from the in-app `/feedback` page and `support@depgraph.vedanshh.dev`.
- **Action:** Review feedback dashboard daily.
- **Triage:** Categorize into: Bug, Feature Request, UX, or Billing.

## 2. Bug Triage Matrix

| Priority | Criteria | SLA | Action |
|----------|----------|-----|--------|
| **P0 (Critical)** | Core flow broken (can't scan, can't pay, Action crashes) | 2 hours | Stop feature work. Fix, test, and deploy immediately. |
| **P1 (High)** | Major feature broken for some users, UI severely degraded | 24 hours | Next available work block. |
| **P2 (Medium)** | Minor UI bug, non-critical scoring edge case | 1 week | Add to next sprint. |
| **P3 (Low)** | Cosmetic issue, typo | Backlog | Fix when convenient. |

## 3. Incident Response Runbook

### Supabase Down
1. Verify status at [status.supabase.com](https://status.supabase.com).
2. Update DepGraph status page.
3. App will gracefully fail with 503s handled by `withErrorHandler`.
4. Wait for resolution.

### GitHub API Rate Limits Exhausted
1. `githubQueue` will automatically pause outbound requests.
2. Users will see "Scan delayed - queuing" in the CLI.
3. No manual action required unless the token itself was revoked.

### Razorpay Webhooks Failing
1. Check Vercel logs for webhook endpoint.
2. If our server is rejecting valid signatures, roll back recent auth changes.
3. Razorpay will automatically retry failed webhooks for 72 hours.
