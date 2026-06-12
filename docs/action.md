# GitHub Action Guide

## Installation

Add this workflow file to your repository:

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

Add your API key as a repository secret named `DEPGRAPH_API_KEY`. Get your key at [depgraph.vedanshh.dev/settings/api](https://depgraph.vedanshh.dev/settings/api).

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | ✅ | — | API key from depgraph.vedanshh.dev (Pro/Team plan required) |
| `fail-on` | ❌ | `critical` | Threshold for CI failure: `none \| critical \| high \| medium` |
| `post-comment` | ❌ | `true` | Post or update a PR comment with the health report |

---

## Outputs

| Output | Description |
|--------|-------------|
| `overall-score` | Project health score (0–100) |
| `critical-count` | Number of critical-risk new dependencies |
| `high-count` | Number of high-risk new dependencies |
| `report-url` | Public URL to the full scan report |

---

## `fail-on` Thresholds

| Value | Fails when |
|-------|-----------|
| `none` | Never fails (report only) |
| `critical` | A new critical-risk dependency is added |
| `high` | A new high or critical-risk dependency is added |
| `medium` | Any new medium, high, or critical-risk dependency is added |

The action also emits a **warning** (non-failing) if the overall project health score drops more than 10 points.

---

## PR Comment Format

```
## 🔍 DepGraph Dependency Health

**Overall Score:** 74/100 ↓ from 79 (this PR added 3 new dependencies)

| New Dependency | Score | Risk |
|----------------|-------|------|
| axios@1.6.0    | 88    | ✅ Low |
| moment@2.29.4  | 41    | ⚠️ Aging |
| left-pad@1.3.0 | 8     | ✗ Critical |

> ⚠️ **1 critical dependency added.** Consider replacing `left-pad` with native `String.padStart()`.

[📊 Full Report](https://depgraph.vedanshh.dev/r/pr-9x2k1)
```

The comment is **updated in place** on each new push to the same PR — never duplicated.

---

## Advanced Examples

### Warning-only mode (no failures)

```yaml
- uses: py-kalki/depgraph-action@v1
  with:
    api-key: ${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: none
    post-comment: true
```

### Strict mode — fail on any medium+ risk

```yaml
- uses: py-kalki/depgraph-action@v1
  with:
    api-key: ${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: medium
    post-comment: true
```

### Use outputs in subsequent steps

```yaml
- uses: py-kalki/depgraph-action@v1
  id: depgraph
  with:
    api-key: ${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: critical

- name: Print score
  run: echo "Health score = ${{ steps.depgraph.outputs.overall-score }}"
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|-----------|
| `401 Unauthorized` | Invalid or missing API key | Check `DEPGRAPH_API_KEY` secret |
| `403 Forbidden` | Free plan — Action requires Pro/Team | Upgrade at depgraph.vedanshh.dev/pricing |
| `429 Rate Limited` | Too many requests | Action retries automatically up to 3 times |
| Action timeout | Large dependency tree | Split monorepo into multiple workflow jobs |
