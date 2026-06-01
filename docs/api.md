# API Reference

## Authentication

All authenticated endpoints accept either:
- **Session cookie** (from dashboard login via GitHub OAuth)
- **API key** via `X-API-Key` header (for CLI and GitHub Action)

```
X-API-Key: dg_live_xxxxxxxxxxxxxxxxxxxx
```

---

## Public Endpoints

### `GET /api/package/:name/score`

Returns the health score for a single npm package.

**Response:**
```json
{
  "packageName": "express",
  "score": 71,
  "riskLevel": "stable",
  "abandonmentRisk": false,
  "dimensions": { "maintenance": 68, "busFactor": 75, "issueHealth": 72, "downloadTrend": 80, "depFreshness": 60, "vulnerability": 70 },
  "topFactors": [
    { "label": "Maintenance", "reason": "Last commit 4 months ago" },
    { "label": "Dep Freshness", "reason": "3 dependencies 2+ major versions behind" }
  ],
  "computedAt": "2026-06-01T00:00:00Z"
}
```

---

### `GET /api/report/:share_token`

Returns a full scan report by its public share token.

**Cache:** 1 hour

---

## Authenticated Endpoints

### `POST /api/scan`

Scan a list of npm packages and return a full scored report.

**Body:**
```json
{ "packages": ["express@4.18.2", "lodash@4.17.21"], "lockfileHash": "abc123" }
```

**Response:**
```json
{
  "overallScore": 74,
  "totalDeps": 2,
  "criticalCount": 0,
  "highCount": 0,
  "packages": [...],
  "shareUrl": "https://depgraph.vedanshh.dev/r/abc123"
}
```

---

### `GET /api/projects`

List the authenticated user's saved projects.

---

### `POST /api/projects`

Create a new saved project.

**Body:** `{ "name": "My App", "githubRepo": "owner/repo" }`

---

### `GET /api/projects/:id/history`

Score history for a project. Returns up to 30 days (Free) or 365 days (Pro/Team).

---

### `GET /api/projects/:id/deps`

Paginated dependency list for a project.

**Query params:** `page`, `limit` (max 100), `sort` (`score|name|risk_level`), `order` (`asc|desc`), `cursor`

**Response:** `{ data, nextCursor, total, page }`

---

## GitHub Action Endpoints

All `/api/action/*` endpoints require `X-API-Key` and a Pro or Team plan.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/action/scan` | POST | Score a dependency list |
| `/api/action/compare` | POST | Diff base vs head trees |
| `/api/action/summary` | POST | Generate PR comment markdown |
| `/api/action/decision` | POST | Apply CI gate logic |

---

## Error Responses

All errors follow this format:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```

| Code | Status | Meaning |
|------|--------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `PLAN_REQUIRED` | 403 | Feature requires Pro/Team plan |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
