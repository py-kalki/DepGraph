# DepGraph — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Author:** Founder  
**Last Updated:** May 31, 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Competitive Landscape](#5-competitive-landscape)
6. [Product Overview](#6-product-overview)
7. [User Personas](#7-user-personas)
8. [User Stories](#8-user-stories)
9. [Feature Specifications — MVP](#9-feature-specifications--mvp)
10. [Feature Specifications — V2](#10-feature-specifications--v2)
11. [Technical Architecture](#11-technical-architecture)
12. [Data Model](#12-data-model)
13. [API Design](#13-api-design)
14. [UI/UX Requirements](#14-uiux-requirements)
15. [Pricing & Revenue Model](#15-pricing--revenue-model)
16. [Go-to-Market Strategy](#16-go-to-market-strategy)
17. [8-Week Build Plan](#17-8-week-build-plan)
18. [Risks & Mitigations](#18-risks--mitigations)
19. [Open Questions](#19-open-questions)

---

## 1. Executive Summary

**DepGraph** is a dependency intelligence platform that gives developers real-time health scores, abandonment risk forecasts, and supply-chain integrity signals for every open-source library in their project.

Unlike reactive tools (Snyk, Dependabot) that only alert after a vulnerability is published, DepGraph is *predictive* — surfacing libraries at risk of abandonment, maintainer compromise, or breaking changes *before* they become production emergencies.

The MVP targets JavaScript/npm projects and is delivered as a CLI tool (`npx depgraph-scanner check`), a web dashboard, and a CI/CD GitHub Action. Solo-buildable in 6–8 weeks. Revenue starts at week 5.

---

## 2. Problem Statement

### The core pain

Modern applications depend on hundreds of open-source libraries. Developers have almost no visibility into the *health* and *future risk* of those dependencies — only their current known vulnerabilities.

This creates three expensive failure modes:

**Failure mode 1 — Sudden abandonment.** A critical library stops being maintained. No security patches, no compatibility updates. Teams discover this only when something breaks in production, or when a CVE is published with no fix available (e.g. `colors.js` sabotage incident, `left-pad` removal, `faker.js` vandalism).

**Failure mode 2 — Supply chain compromise.** A maintainer's npm account gets hijacked and a malicious version is published. Teams have no signal until it's on the CVE list — often days or weeks later (e.g. `ua-parser-js` hijack, XZ Utils backdoor).

**Failure mode 3 — Invisible technical debt.** Developers don't know which of their 800 transitive dependencies are one-person projects with no bus-factor redundancy, or which are already in slow-death maintenance mode. Migration is always deferred until it becomes a crisis.

### Why existing tools don't solve this

| Tool | What it does | What it misses |
|---|---|---|
| Snyk | Known CVE scanning | Abandonment risk, supply chain behavior, predictive signals |
| Dependabot | Auto-raises update PRs | No health scoring, no risk forecasting |
| npm audit | Lists known vulnerabilities | Shallow, no transitive graph depth, no health signals |
| Socket.dev | Supply chain static analysis | No abandonment forecasting, limited ecosystem coverage |
| Libraries.io | Library metadata aggregation | No actionable product layer, no CI/CD integration |

**The gap:** No tool combines *predictive health scoring + supply chain behavior monitoring + migration guidance* in a developer-native, low-friction workflow.

---

## 3. Target Users

### Primary

- **Individual developers** working on JavaScript/Node.js projects (freelancers, indie hackers, startup engineers)
- **Small engineering teams** (2–20 devs) without a dedicated security or DevOps function

### Secondary

- **Open-source maintainers** who want to understand their own dependency exposure
- **Engineering leads at mid-size companies** who need SBOM-grade visibility for compliance

### Out of scope (V1)

- Enterprise security teams (too much procurement overhead for MVP)
- Non-JS ecosystems (Python, Rust, Go — V2)

---

## 4. Goals & Success Metrics

### Product goals

| Goal | Metric | Target (90 days post-launch) |
|---|---|---|
| Acquire users | Weekly active installs of CLI | 500/week |
| Activate users | % of CLI users who visit dashboard | 40% |
| Monetize | Paying subscribers | 50 |
| Retain | 30-day CLI retention | 35% |
| Validate PMF | NPS score | >40 |

### Business goals

- Reach $2,000 MRR within 90 days of launch
- 1,000 GitHub stars on the CLI repo within 60 days
- At least 3 unprompted testimonials shared publicly

### Non-goals (V1)

- Mobile app
- Team collaboration features
- Multi-ecosystem support (Python, Java, etc.)
- SOC 2 compliance

---

## 5. Competitive Landscape

### Direct competitors

**Snyk**
- Strength: brand recognition, deep CVE database, IDE integrations
- Weakness: purely reactive (CVEs only), expensive for small teams, no abandonment forecasting
- Positioning gap: DepGraph is *predictive*, not just reactive

**Socket.dev**
- Strength: strong supply-chain static analysis
- Weakness: no health scores, no abandonment risk, no migration paths
- Positioning gap: DepGraph adds the *longitudinal* health layer

**Dependabot (GitHub)**
- Strength: free, deeply integrated into GitHub
- Weakness: zero intelligence — just opens PRs, no risk context
- Positioning gap: DepGraph explains *why* to update, not just *that* you should

### Indirect competitors

- npm audit (built-in, shallow)
- Libraries.io (data aggregator, not a product)
- OSS Review Toolkit (enterprise, complex)

### Competitive positioning statement

> DepGraph is the first dependency tool that tells you what's going to break *before* it does — combining health forecasting, supply chain monitoring, and AI-assisted migration paths in a workflow developers already use.

---

## 6. Product Overview

### Product pillars

**1. Predict** — Health scores and abandonment risk for every dependency, updated daily  
**2. Protect** — Supply chain integrity monitoring for suspicious maintainer behavior  
**3. Fix** — Migration path generator with effort estimates and drop-in alternatives  

### Distribution channels

| Channel | Description | Priority |
|---|---|---|
| CLI (`npx depgraph-scanner check`) | Zero-install audit for any repo | P0 |
| Web dashboard | Full project view with history and alerts | P0 |
| GitHub Action | CI/CD gate with pass/fail thresholds | P1 |
| VS Code extension | Inline health scores in editor | P2 |
| npm package page badges | `[![depgraph score](...)` | P2 |

---

## 7. User Personas

### Persona 1 — Arjun, Solo Developer

**Background:** Full-stack developer, 4 years experience, builds SaaS products solo. Uses npm daily. Doesn't have time for security deep-dives.

**Pain:** "I have no idea which of my dependencies are ticking time bombs. I only find out when something breaks."

**What he wants:** A quick scan that tells him which libraries to worry about, ranked by risk. Under 2 minutes, zero configuration.

**How DepGraph helps:** `npx depgraph-scanner check` gives him a risk-ranked report in 30 seconds. Weekly email digests surface new risks without him having to think about it.

---

### Persona 2 — Priya, Engineering Lead

**Background:** Leads a 12-person team at a Series A startup. Responsible for security posture, on-call reliability, and technical debt management.

**Pain:** "We have a 3-year-old codebase with 600+ dependencies. I have no idea where our risk is concentrated. The CTO is asking for an SBOM and I have nothing."

**What she wants:** A dashboard her whole team uses, with CI/CD gates that prevent high-risk dependencies from being added, and a compliance report she can share quarterly.

**How DepGraph helps:** Team plan with GitHub Action integration, org-wide dashboard, and one-click SBOM export in CycloneDX format.

---

### Persona 3 — Dmitri, Open-Source Maintainer

**Background:** Maintains 3 popular npm packages with 50k+ weekly downloads. Gets pinged constantly about vulnerabilities in *his* dependencies.

**Pain:** "I need to know which of my own dependencies are going to cause issues for my users before they file issues on my repo."

**What he wants:** A badge for his README and automated alerts when a dependency's health drops.

**How DepGraph helps:** Free tier with public repo support, README badge, and webhook alerts.

---

## 8. User Stories

### Must-have (MVP)

| ID | As a... | I want to... | So that... | Priority |
|---|---|---|---|---|
| US-01 | developer | run `npx depgraph-scanner check` in any project | I get an instant health report without installing anything | P0 |
| US-02 | developer | see a health score (0–100) for each dependency | I can prioritize which to investigate first | P0 |
| US-03 | developer | see which dependencies are at high risk of abandonment | I can proactively migrate before they break | P0 |
| US-04 | developer | see the full transitive dependency graph | I understand risk beyond my direct dependencies | P0 |
| US-05 | developer | create a free account and save my project's report | I can track health over time | P0 |
| US-06 | developer | get alternative library suggestions for risky deps | I don't have to research replacements manually | P1 |
| US-07 | engineering lead | add a GitHub Action to my CI pipeline | PRs that add dangerous dependencies are flagged automatically | P1 |
| US-08 | engineering lead | set risk thresholds for CI gates | I control what level of risk triggers a build failure | P1 |
| US-09 | developer | receive email alerts when a dependency's score drops | I'm notified of new risk without actively checking | P1 |
| US-10 | engineering lead | export a Software Bill of Materials (SBOM) | I can share it with clients or pass a compliance audit | P2 |

### Nice-to-have (V2)

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-11 | developer | see inline health scores in VS Code | I see risk while I'm writing code, not after |
| US-12 | engineering lead | see team-level stats | I know which projects carry the most dependency risk |
| US-13 | developer | get a README badge for my open-source project | Users can see my project's dependency health at a glance |
| US-14 | developer | filter the dependency graph by risk level | I can focus on critical issues first |
| US-15 | engineering lead | add custom policies (e.g. "no GPL licenses") | I enforce org-wide rules automatically |

---

## 9. Feature Specifications — MVP

### F-01: CLI Scanner (`npx depgraph-scanner check`)

**Description:** Zero-install CLI that scans a project's `package.json` (and `package-lock.json` for transitive deps), queries DepGraph's API, and renders a terminal report.

**Inputs:** `package.json`, `package-lock.json` or `node_modules` in current directory  
**Output:** Color-coded terminal table + shareable URL to web dashboard

**Report includes:**
- Overall project health score (0–100)
- Per-dependency health score
- Risk level (Critical / High / Medium / Low)
- Top 3 highest-risk dependencies with reason codes
- Estimated time to address (aggregate)

**CLI flags:**

```bash
npx depgraph-scanner check                  # scan current directory
npx depgraph-scanner check --path ./app     # scan specific path
npx depgraph-scanner check --format json    # output as JSON (for CI)
npx depgraph-scanner check --threshold 60   # exit code 1 if score < 60
npx depgraph-scanner check --depth 2        # limit transitive depth
```

**Terminal output example:**

```
DepGraph v1.0 — Scanning 247 dependencies...

  Project Health Score: 71 / 100  ▓▓▓▓▓▓▓░░░

  CRITICAL (2)
  ─────────────────────────────────────────────
  ✗  event-stream       Score: 12   Last commit: 3yr ago  1 maintainer
     ↳ Hijacking history. No recent activity. Migrate to mitt or eventemitter3.

  ✗  node-forge         Score: 24   3 open critical CVEs   Bus factor: 1
     ↳ Known vulnerabilities unfixed for 14 months. Migrate to node:crypto.

  HIGH (7)   MEDIUM (18)   LOW (41)   HEALTHY (179)

  Full report: https://depgraph.vedanshh.dev/r/a3f9x2k1
  Run `npx depgraph-scanner fix` to see migration paths.
```

**Acceptance criteria:**
- Completes scan for a 200-dependency project in under 10 seconds
- Works offline for the last-fetched data (cached)
- Exit code 0 = pass, 1 = threshold breached, 2 = error

---

### F-02: Health Score Engine

**Description:** The core scoring algorithm that computes a 0–100 health score for any npm package, updated daily.

**Score dimensions and weights:**

| Signal | Weight | Data source |
|---|---|---|
| Maintenance activity (last commit, release frequency) | 25% | GitHub API |
| Bus factor (number of active contributors) | 20% | GitHub API + npm |
| Issue health (open issues ratio, response time) | 15% | GitHub API |
| Download trend (weekly downloads, 90-day slope) | 15% | npm registry |
| Dependency freshness (how out-of-date its own deps are) | 10% | npm registry |
| Known vulnerabilities (active unpatched CVEs) | 15% | OSV.dev + npm audit |

**Score bands:**

| Score | Label | Color | Meaning |
|---|---|---|---|
| 80–100 | Healthy | Green | Actively maintained, low risk |
| 60–79 | Stable | Blue | Maintained but slowing |
| 40–59 | Aging | Yellow | Declining activity, watch closely |
| 20–39 | At Risk | Orange | High abandonment probability |
| 0–19 | Critical | Red | Abandoned or compromised |

**Abandonment risk flag:** Triggered when all of: last commit > 12 months, bus factor = 1, download trend negative for 90 days, 0 releases in 12 months.

**Acceptance criteria:**
- Scores computed for any package with a GitHub repo link in `package.json`
- Score freshness: recomputed every 24 hours
- Score explainability: every score includes the top 2 contributing factors

---

### F-03: Web Dashboard

**Description:** A web UI where users can view their project's full dependency report, track health over time, and manage alert settings.

**Pages:**

**Dashboard home (`/dashboard`)**
- Project health score gauge
- Score history chart (30 days)
- Dependency breakdown by risk level (donut chart)
- Top 5 critical dependencies (action required)
- Recent score changes (what got worse this week)

**Dependency detail (`/dependency/:package-name`)**
- Full health score breakdown with per-signal scores
- GitHub activity timeline (commits, releases, contributors)
- Download trend chart
- Known CVEs list
- Suggested alternatives with comparison table
- Migration difficulty estimate (Easy / Medium / Hard)

**Project settings (`/settings`)**
- Alert thresholds
- Email notification preferences
- CI/CD token management
- SBOM export (V1: JSON, V2: CycloneDX)

**Acceptance criteria:**
- Dashboard loads in under 2 seconds
- Mobile-responsive (readable on phone, not full-featured)
- Anonymous public view for shared report URLs (no login required to view)

---

### F-04: User Accounts & Projects

**Description:** Lightweight auth system. Users sign in, save projects, and track them over time.

**Auth:** GitHub OAuth only (V1). This has two benefits: it's fast to implement, and it immediately scopes DepGraph as a developer-native tool.

**Free tier limits:**
- Up to 3 saved projects
- Public repos only
- 30-day history
- Email alerts: weekly digest only

**Pro tier:**
- Unlimited projects (public + private)
- 12-month history
- Real-time alerts (score drops, new CVEs)
- CI/CD GitHub Action
- SBOM export
- Priority re-scan (on-demand)

**Acceptance criteria:**
- GitHub OAuth flow completes in under 5 seconds
- Users can add a project by pasting a GitHub repo URL or uploading a `package.json`
- Projects auto-refresh scores daily

---

### F-05: GitHub Action (CI/CD Integration)

**Description:** A GitHub Action that runs DepGraph in CI, adds a PR comment with the score summary, and optionally fails the build if thresholds are breached.

**Usage:**

```yaml
# .github/workflows/depgraph.yml
name: Dependency Health Check

on: [pull_request]

jobs:
  depgraph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: depgraph/action@v1
        with:
          api-key: ${{ secrets.DEPGRAPH_API_KEY }}
          fail-on: critical          # none | critical | high | medium
          post-comment: true
```

**PR comment format:**

```
## DepGraph Dependency Health

Overall Score: 74/100  ↓ from 79 (this PR added 3 new dependencies)

| New dependency   | Score | Risk     |
|------------------|-------|----------|
| axios@1.6.0      | 88    | Low      |
| moment@2.29.4    | 41    | Aging ⚠️  |
| left-pad@1.3.0   | 8     | Critical ✗|

⚠️ 1 critical dependency added. Consider replacing left-pad with native String.padStart().

Full report: https://depgraph.vedanshh.dev/r/pr-9x2k1
```

**Acceptance criteria:**
- Action runs in under 30 seconds for a 200-dependency project
- Comment posts on every PR that changes `package.json`
- Comment updates (not duplicates) on subsequent pushes to the same PR

---

## 10. Feature Specifications — V2

These features are explicitly out of scope for MVP but should be architectured to support them.

### F-06: Supply Chain Integrity Monitor

Real-time monitoring for suspicious signals around npm package releases:
- Maintainer account changes (new publish rights granted)
- Unusual release patterns (package published at 3am, version jump from 1.0 to 9.0)
- New network calls in a new release not present in previous version
- Install scripts added to a package that previously had none

Delivered as: webhook alerts + CI gate + dashboard feed.

### F-07: Migration Path Generator (AI-assisted)

Given a high-risk or abandoned library, DepGraph suggests:
- Drop-in alternatives (API-compatible replacements)
- Migration effort estimate (lines of code to change, based on usage analysis)
- Auto-generated migration guide using the Anthropic API
- Links to codemods if available

### F-08: Multi-ecosystem Support

Expand beyond npm to:
- Python (PyPI + `requirements.txt` / `pyproject.toml`)
- Rust (crates.io + `Cargo.toml`)
- Go (pkg.go.dev + `go.mod`)

### F-09: VS Code Extension

Inline health score annotations in `package.json`:
- Color-coded line gutter indicators
- Hover tooltip with score breakdown
- Quick-fix suggestions for critical packages

### F-10: Team & Org Features

- Shared org dashboard across multiple repositories
- Custom dependency policies (banned licenses, minimum score thresholds)
- Role-based access (admin, viewer)
- Slack integration for team alerts

---

## 11. Technical Architecture

### Stack (solo-optimized)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Full-stack, file-based routing, API routes, Vercel deployment |
| Database | PostgreSQL (Supabase) | Managed, free tier generous, built-in auth helpers |
| Cache | Redis (Upstash) | Serverless Redis, pay-per-request, ideal for score caching |
| Auth | NextAuth.js + GitHub OAuth | Fast to implement, developer-native login |
| CLI | Node.js + `commander.js` + `chalk` | npm-publishable, zero friction for devs |
| Hosting | Vercel (web) + npm registry (CLI) | Both free to start |
| Background jobs | Vercel Cron (V1) → BullMQ on Railway (V2) | Cron for daily score refreshes |
| Payments | RAZORPAY | Industry standard, excellent DX |
| Email | Resend | Simple API, generous free tier |

### Data flow

```
User runs: npx depgraph-scanner check
         │
         ▼
CLI reads package.json + package-lock.json
         │
         ▼
CLI sends package list → DepGraph API (/api/scan)
         │
         ▼
API checks Redis cache (TTL: 24hr per package)
   Hit → return cached scores
   Miss → fetch from GitHub API + npm registry + OSV.dev
         │
         ▼
Score engine computes health scores
         │
         ▼
Scores stored in PostgreSQL + cached in Redis
         │
         ▼
API returns scored report → CLI renders terminal output
                          → Dashboard renders web report
```

### External API dependencies

| API | Used for | Rate limits |
|---|---|---|
| GitHub REST API | Commit history, contributors, issues | 5,000 req/hr (authenticated) |
| npm registry API | Download counts, package metadata | No auth required, generous |
| OSV.dev API | Known CVE lookups | Free, no auth |
| Anthropic API | Migration suggestions (V2) | Usage-based |

### Caching strategy

- Per-package scores cached for 24 hours (Redis)
- GitHub API responses cached for 6 hours (Redis)
- npm download stats cached for 12 hours (Redis)
- Full project scan results cached for 1 hour (Redis, keyed by `package-lock.json` hash)

This is critical: with aggressive caching, a 200-package scan should hit the GitHub API for at most 10–15 uncached packages, staying well within rate limits even at moderate scale.

---

## 12. Data Model

### Core tables

```sql
-- Users
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id    INTEGER UNIQUE NOT NULL,
  github_login VARCHAR(255) NOT NULL,
  email        VARCHAR(255),
  plan         VARCHAR(20) DEFAULT 'free',  -- free | pro | team
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (saved repos)
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  github_repo  VARCHAR(512),  -- owner/repo
  last_scanned TIMESTAMPTZ,
  score        INTEGER,       -- cached overall score 0-100
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Package health scores (the core dataset)
CREATE TABLE package_scores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name        VARCHAR(255) NOT NULL,
  package_version     VARCHAR(50),
  ecosystem           VARCHAR(20) DEFAULT 'npm',
  score               INTEGER NOT NULL,
  risk_level          VARCHAR(20),  -- critical | high | medium | low | healthy
  maintenance_score   INTEGER,
  bus_factor_score    INTEGER,
  issue_health_score  INTEGER,
  download_trend_score INTEGER,
  freshness_score     INTEGER,
  vulnerability_score INTEGER,
  abandonment_risk    BOOLEAN DEFAULT FALSE,
  cve_count_active    INTEGER DEFAULT 0,
  last_commit_date    DATE,
  contributor_count   INTEGER,
  weekly_downloads    INTEGER,
  alternatives        JSONB,   -- [{name, score, api_compat, migration_effort}]
  raw_signals         JSONB,   -- full raw data from GitHub/npm APIs
  computed_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_name, ecosystem)
);

-- Score history (for trend charts)
CREATE TABLE score_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name VARCHAR(255) NOT NULL,
  ecosystem    VARCHAR(20) DEFAULT 'npm',
  score        INTEGER NOT NULL,
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Scan reports (user's saved scans)
CREATE TABLE scan_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id),
  share_token     VARCHAR(20) UNIQUE,  -- for public share URLs
  overall_score   INTEGER,
  total_deps      INTEGER,
  critical_count  INTEGER,
  high_count      INTEGER,
  dep_scores      JSONB,  -- array of {name, version, score, risk_level}
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Alert subscriptions
CREATE TABLE alert_subscriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  alert_type     VARCHAR(50),  -- score_drop | new_cve | abandonment_risk
  threshold      INTEGER,      -- score threshold for score_drop alerts
  channel        VARCHAR(20),  -- email | webhook | slack
  destination    VARCHAR(512), -- email address or webhook URL
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 13. API Design

### Public endpoints (no auth)

```
GET  /api/package/:name/score
     Returns: health score + signals for a single npm package
     Cache: 24hr

GET  /api/report/:share_token
     Returns: full scan report (public share)
     Cache: 1hr
```

### Authenticated endpoints

```
POST /api/scan
     Body: { packages: string[], lockfileHash: string }
     Returns: scored report for all packages
     Auth: API key (header) or session cookie

GET  /api/projects
     Returns: user's saved projects

POST /api/projects
     Body: { name, githubRepo }
     Returns: created project

GET  /api/projects/:id/history
     Returns: score history (last 30 or 365 days based on plan)

POST /api/alerts
     Body: { projectId, alertType, threshold, channel, destination }
     Returns: created alert subscription

GET  /api/user/usage
     Returns: scan count, projects count, plan limits
```

### CLI authentication flow

```
npx depgraph-scanner auth
→ Opens browser to https://depgraph.vedanshh.dev/auth/cli?device_code=XXX
→ User logs in with GitHub
→ API key written to ~/.depgraph/config.json
→ CLI uses this key for all subsequent requests
```

---

## 14. UI/UX Requirements

### Design principles

- **Developer-native aesthetic:** monospace accents, terminal-inspired color coding for risk levels
- **Information density over decoration:** pack meaningful data, not whitespace
- **Actionable over informational:** every screen should answer "what do I do next?"
- **Zero configuration:** no YAML config files, no project setup wizards

### Color system for risk levels

| Risk | Color | Hex |
|---|---|---|
| Critical | Red | `#E24B4A` |
| High | Orange | `#EF9F27` |
| Medium | Yellow | `#EAB308` |
| Low | Blue | `#378ADD` |
| Healthy | Green | `#1D9E75` |

### Key screens

**Screen 1: Landing page (`/`)**
- Hero: animated terminal showing `npx depgraph-scanner check` running
- Live stats: "X packages scored today, Y risks detected"
- Sample report preview
- Pricing section
- No login required to try

**Screen 2: Dashboard home (`/dashboard`)**
- Project switcher (top left)
- Score gauge + trend arrow (center top)
- Risk breakdown donut (right)
- Dependencies table: sortable by score, name, risk, last-updated
- "Fix critical issues" CTA persistent in top bar

**Screen 3: CLI output (terminal)**
- Maximum 80 columns wide
- Color via `chalk` (respects `NO_COLOR` env var)
- Unicode box-drawing for table borders
- Progress spinner during scan
- Summary stats on one line at end

### Accessibility

- All color-coded risk levels include a text label (not color-only)
- CLI output respects `--no-color` flag and `NO_COLOR` env var
- Web dashboard WCAG 2.1 AA target
- All interactive elements keyboard-navigable

---

## 15. Pricing & Revenue Model

### Tier structure

**Free**
- `npx depgraph-scanner check` for any public project
- Up to 3 saved projects (public repos only)
- Health scores + basic risk flags
- 30-day score history
- Weekly email digest
- DepGraph badge for README

**Pro — $19/month** *(target: individual developers)*
- Unlimited projects (public + private)
- Real-time alerts (score drops, new CVEs, abandonment flags)
- GitHub Action with CI/CD gates
- 12-month score history
- SBOM export (JSON)
- On-demand re-scan
- Migration suggestions

**Team — $79/month for up to 10 seats** *(target: small engineering teams)*
- Everything in Pro
- Org-wide dashboard
- Custom risk policies (minimum score thresholds, license restrictions)
- Slack integration
- CycloneDX SBOM export
- Priority support

**Enterprise — custom pricing** *(out of scope V1)*
- SSO / SAML
- Self-hosted option
- SLA + dedicated support
- Custom integrations

### Revenue projections (conservative)

| Month | Free users | Pro | Team | MRR |
|---|---|---|---|---|
| 1 | 200 | 5 | 0 | $95 |
| 2 | 600 | 20 | 2 | $538 |
| 3 | 1,500 | 50 | 8 | $1,582 |
| 6 | 5,000 | 150 | 30 | $5,220 |
| 12 | 15,000 | 400 | 100 | $15,500 |

### Monetization guardrails

- Free tier must be genuinely useful (not crippled) to drive PLG growth
- Private repo support is the primary free → pro conversion trigger
- CI/CD integration is the primary individual → team conversion trigger

---

## 16. Go-to-Market Strategy

### Phase 1: Seed distribution (weeks 1–4, pre-launch)

- Build in public on Twitter/X — share weekly build updates
- Post on dev.to and Hashnode: "I built a tool to predict dependency abandonment"
- Reach out to 20 open-source maintainers for beta access + feedback
- Plant `npx depgraph-scanner check` in relevant GitHub issue threads (where it's genuinely helpful, not spam)

### Phase 2: Launch (week 5–6)

- Product Hunt launch (Thursday, aim for top 5 of the day)
- Hacker News Show HN post
- Reddit launches: r/javascript, r/node, r/webdev, r/programming
- Dev Twitter thread: "I scanned the top 100 npm packages. Here's which ones are quietly dying."

### Phase 3: Organic growth engine (ongoing)

- **Content:** Monthly "State of npm Health" report — top 100 packages health dashboard, shareable, link-baitable
- **SEO:** Pages for every popular package's health score (`depgraph.vedanshh.dev/package/lodash`) — these rank for "[package name] abandoned?" queries
- **Community:** Weekly newsletter for subscribers: packages whose scores changed significantly this week
- **Integrations:** Submit to GitHub Marketplace (Action), VS Code Marketplace (Extension V2)

### Key distribution insight

The CLI's `--share` output (a public URL to the report) is viral by design. When someone runs `npx depgraph-scanner check` and shares the report URL in a PR or Slack thread, every person who clicks it sees DepGraph and can run it on their own project. This is the Loom/Notion "made with" flywheel applied to developer tooling.

---

## 17. 8-Week Build Plan

### Week 1 — Core data pipeline
- Set up Next.js + Supabase + Upstash Redis project
- Implement GitHub API integration (commits, contributors, issues)
- Implement npm registry API integration (downloads, metadata)
- Implement OSV.dev CVE lookup
- Build score engine V1 (weights + formula)
- Write unit tests for scoring logic

### Week 2 — CLI V1
- Scaffold CLI with `commander.js`
- Implement `package.json` + `package-lock.json` parser
- Connect CLI to scoring API
- Build terminal output renderer with `chalk`
- Publish to npm as `depgraph` package
- Test on 10 real-world projects

### Week 3 — Web dashboard V1
- Build auth (GitHub OAuth via NextAuth.js)
- Dashboard home: project score gauge + risk breakdown
- Dependencies table with sort/filter
- Shareable report URLs (public, no login)
- Basic responsive layout

### Week 4 — Accounts + projects
- Save projects, link to GitHub repos
- Daily cron job for score refreshes
- Score history storage + trend charts
- Free vs Pro plan enforcement (Razorpay integration start)

### Week 5 — Razorpay + email alerts
- Complete Razorpay integration (checkout, webhooks, plan management)
- Email alerts via Resend (score drop, new CVE, weekly digest)
- Pro tier: private repo support
- Landing page + pricing page

### Week 6 — GitHub Action
- Build GitHub Action (Docker-based)
- PR comment posting
- CI gate (fail on threshold breach)
- GitHub Action Marketplace submission

### Week 7 — Polish + performance
- Improve CLI scan speed (parallel API calls, better cache hit rate)
- Dashboard performance (loading states, pagination)
- Error handling + graceful degradation
- Rate limit handling for GitHub API
- Write README, docs site (Mintlify or Docusaurus)

### Week 8 — Launch prep
- Beta test with 20 users from dev community
- Fix top bugs from beta feedback
- Write Product Hunt copy + assets
- Write HN post draft
- Set up analytics (PostHog)
- Set up error monitoring (Sentry)
- Launch

---

## 18. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| GitHub API rate limits at scale | High | High | Aggressive caching (24hr TTL), authenticated API client, request queuing |
| npm removes or restricts public API | Low | High | Mirror critical package metadata in own DB; don't rely on real-time npm API for every request |
| Snyk/Dependabot adds abandonment scoring | Medium | Medium | Speed to market; build deeper ML forecasting moat before they catch up |
| False positives damage trust (flagging a healthy package as "at risk") | Medium | High | Calibrate scoring against known-abandoned packages; allow maintainer to claim/dispute score |
| Low conversion from free to pro | Medium | High | Test multiple conversion triggers; ensure free tier creates daily active habit before monetization push |
| Solo burnout | Medium | High | Strict scope (npm only V1), time-box each feature, ship and learn fast |
| Users don't trust a new/unknown tool for security | Medium | Medium | Open-source the scoring algorithm; publish methodology; work with known OSS maintainers for testimonials |

---

## 19. Open Questions

| # | Question | Owner | Target resolution |
|---|---|---|---|
| OQ-01 | Should free tier include private repos with a scan-per-month limit, or no private repos at all? | Founder | Week 4 (test conversion rates) |
| OQ-02 | What's the right minimum threshold for the abandonment risk flag? (12 months? 18 months?) | Founder | Week 1 (calibrate against known-abandoned packages) |
| OQ-03 | Should we charge per-seat or per-project for the Team plan? | Founder | Week 6 (user interviews) |
| OQ-04 | Is the GitHub Action better as a Docker action or a Node.js action? (Docker is slower to start but more portable) | Founder | Week 6 |
| OQ-05 | Do we need to handle monorepos (multiple `package.json` files) in V1, or defer to V2? | Founder | Week 2 (assess scope) |
| OQ-06 | Should package health scores be public (queryable without auth) to drive SEO, or gated to drive signups? | Founder | Week 5 (A/B test) |

---

## Appendix A: Definition of "Bus Factor"

The bus factor for a package is computed as the number of contributors who account for at least 80% of commits in the last 12 months. A bus factor of 1 means one person wrote essentially all recent code — if they stop, the project stops.

## Appendix B: Score Calibration Examples

| Package | Expected score | Reasoning |
|---|---|---|
| `react` | 95+ | Facebook-backed, massive contributor base, frequent releases |
| `lodash` | 70–80 | Maintained but in low-activity stable phase |
| `moment` | 35–45 | Officially in maintenance mode, not recommended for new projects |
| `event-stream` | < 15 | Previously hijacked, abandoned, historical supply chain incident |
| `left-pad` | < 10 | Infamously removed from npm; maintained as stub only |
| `express` | 65–75 | Widely used but slower maintenance pace in recent years |

## Appendix C: SBOM Output Format (V1)

```json
{
  "bomFormat": "DepGraph",
  "specVersion": "1.0",
  "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  "version": 1,
  "metadata": {
    "timestamp": "2026-05-31T10:00:00Z",
    "project": "my-app",
    "depgraphScore": 74
  },
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "depgraphScore": 71,
      "riskLevel": "stable",
      "abandonmentRisk": false,
      "cveCount": 0
    }
  ]
}
```

---

*Document status: Living document. Update version number and last-updated date with each significant revision.*