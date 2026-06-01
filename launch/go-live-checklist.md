# Go-Live Checklist

## 1. Domain & SSL
- [ ] Custom domain (`depgraph.vedanshh.dev`) connected in Vercel
- [ ] SSL certificate active and forcing HTTPS
- [ ] `NEXT_PUBLIC_APP_URL` updated to `https://depgraph.vedanshh.dev`

## 2. GitHub OAuth App
- [ ] "DepGraph Production" app created in GitHub Developer Settings
- [ ] Authorization callback URL set to `https://depgraph.vedanshh.dev/api/auth/callback/github`
- [ ] Prod `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` added to Vercel

## 3. Payments (Razorpay)
- [ ] Razorpay account switched to Live Mode
- [ ] Live API keys generated and added to Vercel
- [ ] Live Webhook created (`https://depgraph.vedanshh.dev/api/webhooks/razorpay`)
- [ ] Webhook secret generated and added to Vercel
- [ ] Live Plan IDs created for Pro ($19) and Team ($79) — update codebase constants

## 4. Email (Resend)
- [ ] Domain verified in Resend (DNS records added)
- [ ] Production API key generated and added to Vercel
- [ ] Test email sent successfully to a non-team email address

## 5. Analytics & Monitoring
- [ ] PostHog production project created; key added to Vercel
- [ ] Sentry production project created; DSN added to Vercel
- [ ] Test 500 error triggered and verified in Sentry UI
- [ ] Test signup triggered and verified in PostHog UI

## 6. GitHub Action Marketplace
- [ ] Action repository made public
- [ ] Final `v1` tag pushed
- [ ] Action submitted and approved in GitHub Marketplace

## 7. Cron Jobs
- [ ] Verified `vercel.json` crons are registered in Vercel dashboard
- [ ] Triggered `/api/cron/daily-tasks` manually with `CRON_SECRET` and verified success
