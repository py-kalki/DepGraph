# DepGraph — GitHub Action

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-DepGraph-purple?logo=github)](https://github.com/marketplace/actions/depgraph-dependency-health-check)
[![Version](https://img.shields.io/github/v/release/depgraph/action)](https://github.com/depgraph/action/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Scan your dependencies on every pull request and enforce health thresholds.**

DepGraph analyses every dependency in your `package.json`, computes a health score (0–100), detects new risks introduced by a PR, and posts a summary comment — all in under 30 seconds.

---

## Quick Start

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
          fetch-depth: 0   # required to read base branch package.json

      - uses: depgraph/action@v1
        with:
          api-key: ${{ secrets.DEPGRAPH_API_KEY }}
          fail-on: critical
          post-comment: true
```

**Get your API key** at [depgraph.vedanshh.dev/settings/api](https://depgraph.vedanshh.dev/settings/api) (requires Pro or Team plan), then add it as a repository secret named `DEPGRAPH_API_KEY`.

---

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `api-key` | ✅ Yes | — | DepGraph API key. Store as `DEPGRAPH_API_KEY` secret |
| `fail-on` | No | `critical` | Risk level that fails the build: `none \| critical \| high \| medium` |
| `post-comment` | No | `true` | Post/update a PR comment with the health report |

## Outputs

| Output | Description |
|---|---|
| `overall-score` | Overall dependency health score (0–100) |
| `critical-count` | Number of critical-risk dependencies added in this PR |
| `high-count` | Number of high-risk dependencies added in this PR |
| `report-url` | URL to the full DepGraph report |

---

## `fail-on` Threshold Guide

| Value | Build fails when... |
|---|---|
| `none` | Never — always passes (useful for reporting only) |
| `critical` | Any critical-risk dependency is added |
| `high` | Any critical or high-risk dependency is added |
| `medium` | Any critical, high, or medium-risk dependency is added |

Additionally, the build outputs a **warning** (non-failing) when the overall dependency health score drops more than 10 points compared to the base branch.

---

## PR Comment Example

When `post-comment: true`, DepGraph automatically posts (and updates on new pushes):

```
## 🔍 DepGraph Dependency Health

Overall Score: 74/100 ████████░░ ↓ 5 from 79
CI Gate: ❌ FAILED — 1 critical risk dependency detected

### New Dependencies

| Package    | Version | Score | Risk               |
|------------|---------|-------|--------------------|
| axios      | 1.6.0   | 88    | 🟢 healthy          |
| moment     | 2.29.4  | 41    | 🟡 medium           |
| left-pad   | 1.3.0   | 8     | 🔴 critical         |

### 🔴 Critical Findings

- **`left-pad`** (score: 8) — Critical risk level, abandonment risk detected

### Recommended Actions

- 🔴 Replace `left-pad` with a healthier alternative

---
📊 Full Report · DepGraph
```

---

## Advanced Example

```yaml
- uses: depgraph/action@v1
  id: depgraph
  with:
    api-key: ${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: high
    post-comment: true

- name: Use DepGraph outputs
  run: |
    echo "Score: ${{ steps.depgraph.outputs.overall-score }}"
    echo "Critical: ${{ steps.depgraph.outputs.critical-count }}"
    echo "Report: ${{ steps.depgraph.outputs.report-url }}"
```

---

## Setup Guide

1. **Create an account** at [depgraph.vedanshh.dev](https://depgraph.vedanshh.dev)
2. **Upgrade to Pro or Team** (GitHub Action requires Pro/Team plan)
3. **Generate an API key** at [depgraph.vedanshh.dev/settings/api](https://depgraph.vedanshh.dev/settings/api)
4. **Add the secret** to your repository: Settings → Secrets → `DEPGRAPH_API_KEY`
5. **Add the workflow** (see Quick Start above)

---

## Plan Requirements

| Plan | GitHub Action |
|---|---|
| Free | ❌ Not included |
| Pro ($19/mo) | ✅ Included |
| Team ($79/mo) | ✅ Included |

[View pricing →](https://depgraph.vedanshh.dev/pricing)

---

## Error Reference

| Error | Cause | Fix |
|---|---|---|
| `Invalid DEPGRAPH_API_KEY` | Missing or wrong secret | Check `DEPGRAPH_API_KEY` repository secret |
| `requires a Pro or Team plan` | Free account | Upgrade at depgraph.vedanshh.dev/pricing |
| `No package.json found` | Wrong working directory | Add `working-directory` to checkout step |
| `rate limited` | API rate limit | Build continues — gate skipped |

---

## License

MIT © DepGraph
