# DepGraph

**Predictive dependency intelligence for JavaScript projects.**

[![npm](https://img.shields.io/npm/v/depgraph)](https://www.npmjs.com/package/depgraph)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-276%20passing-brightgreen)](#testing)

DepGraph gives you real-time health scores, abandonment risk forecasts, and supply-chain integrity signals for every open-source library in your project — before problems happen.

---

## Quick Start

```bash
npx depgraph-scanner check
```

No installation. No configuration. Run it in any JavaScript project directory and get a scored dependency health report in under 30 seconds.

---

## Features

- **Health scores (0–100)** for every npm dependency
- **Abandonment risk detection** — flags libraries at risk before they break
- **Active CVE tracking** via OSV.dev
- **GitHub Action** for CI/CD dependency gates
- **Dashboard** at [depgraph.vedanshh.dev](https://depgraph.vedanshh.dev) for trend tracking and alerts
- **Email alerts** on score drops, new CVEs, and weekly digests

---

## CLI Usage

```bash
# Scan current directory
npx depgraph-scanner check

# Scan a specific path
npx depgraph-scanner check --path ./packages/api

# Output as JSON (for CI pipelines)
npx depgraph-scanner check --format json

# Fail if project score drops below threshold
npx depgraph-scanner check --threshold 60

# Limit transitive dependency depth
npx depgraph-scanner check --depth 2
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Pass — all checks passed |
| `1` | Threshold breached |
| `2` | Error (network, invalid project, etc.) |

---

## GitHub Action

```yaml
# .github/workflows/depgraph.yml
name: Dependency Health Check

on: [pull_request]

jobs:
  depgraph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: py-kalki/depgraph-action@v1
        with:
          api-key: ${{ secrets.DEPGRAPH_API_KEY }}
          fail-on: critical
          post-comment: true
```

**Inputs:**

| Input | Default | Description |
|-------|---------|-------------|
| `api-key` | required | API key from [depgraph.vedanshh.dev/settings/api](https://depgraph.vedanshh.dev/settings/api) |
| `fail-on` | `critical` | Fail threshold: `none \| critical \| high \| medium` |
| `post-comment` | `true` | Post or update a PR comment |

**Outputs:** `overall-score`, `critical-count`, `high-count`, `report-url`

---

## Dashboard

Visit [depgraph.vedanshh.dev](https://depgraph.vedanshh.dev) to:

- Track dependency health over time with score history charts
- Set up email alerts for score drops and new CVEs
- View the full scored report for every dependency
- Manage projects and billing

---

## Pricing

| Plan | Price | Key features |
|------|-------|-------------|
| Free | $0 | 3 projects, public repos, 30-day history, weekly digest |
| Pro | $19/mo | Unlimited projects, private repos, real-time alerts, GitHub Action |
| Team | $79/mo | Everything in Pro + org dashboard, Slack integration |

---

## Health Score Dimensions

| Signal | Weight | Source |
|--------|--------|--------|
| Maintenance activity | 25% | GitHub API |
| Bus factor | 20% | GitHub API |
| Issue health | 15% | GitHub API |
| Download trend | 15% | npm registry |
| Dependency freshness | 10% | npm registry |
| Known vulnerabilities | 15% | OSV.dev |

---

## Documentation

- [API Reference](docs/api.md)
- [CLI Guide](docs/cli.md)
- [GitHub Action Guide](docs/action.md)
- [Billing & Plans](docs/billing.md)
- [Architecture](docs/architecture.md)

---

## Self-Hosting / Contributing

This is the DepGraph web application (Next.js). See [docs/architecture.md](docs/architecture.md) for the full technical overview.

```bash
git clone https://github.com/depgraph/depgraph
cd depgraph
cp .env.example .env
npm install
npm run dev
```

---

## License

MIT © DepGraph
