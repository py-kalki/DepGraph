# Growth & Marketing Infrastructure

## 1. Email Marketing (Resend)
- **Weekly Digest:** Sent via cron job to all active users summarizing their project health.
- **Product Updates:** Broadcast list created in Resend for major feature announcements.
- **Drip Campaign:** Day 1 (Welcome), Day 3 (Add GitHub Action), Day 7 (Pro features).

## 2. Community Engagement
- Monitor Twitter/X for mentions of "npm audit", "supply chain", and "abandoned packages".
- Engage in r/javascript and r/node threads about dependency management.
- Publish monthly "State of npm Health" report to drive SEO.

## 3. Analytics Tracking (PostHog)
Key funnels to monitor weekly:
- Landing Page Visit → Signup
- Signup → First Scan (Activation)
- First Scan → Saved Project
- Saved Project → GitHub Action Installed
- Free → Pro Upgrade

## 4. Referral & SEO
- `--share` CLI output automatically generates a public, branded report URL.
- Report pages include "Scanned by DepGraph" CTA.
- Individual package pages (`/package/lodash`) statically generated for SEO.
