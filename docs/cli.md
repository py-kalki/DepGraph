# CLI Guide

## Installation

No installation required. Use `npx`:

```bash
npx depgraph check
```

Or install globally:

```bash
npm install -g depgraph
depgraph check
```

---

## Commands

### `depgraph check`

Scan the current project's dependencies.

```bash
npx depgraph check [options]
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--path <dir>` | `.` | Directory containing `package.json` |
| `--format <fmt>` | `table` | Output format: `table \| json` |
| `--threshold <n>` | none | Exit 1 if project score < n |
| `--depth <n>` | 2 | Transitive dependency depth |
| `--no-color` | — | Disable color output |

---

## Output Format

```
DepGraph v1.0 — Scanning 247 dependencies...

  Project Health Score: 71 / 100  ████████░░

  CRITICAL (2)
  ─────────────────────────────────────────
  ✗  event-stream    Score: 12   Last commit: 3yr ago
     ↳ Abandoned. Migrate to mitt or eventemitter3.

  HIGH (7)  MEDIUM (18)  LOW (41)  HEALTHY (179)

  Full report: https://depgraph.vedanshh.dev/r/a3f9x2k1
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed |
| `1` | Score below `--threshold` |
| `2` | Error (network failure, invalid project) |

---

## Authentication

```bash
npx depgraph auth
```

Opens browser for GitHub OAuth login. Writes API key to `~/.depgraph/config.json`.

---

## JSON Output (for CI)

```bash
npx depgraph check --format json | jq '.overallScore'
```
