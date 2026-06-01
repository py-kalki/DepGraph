export const metadata = {
  title: 'Architecture Overview — DepGraph Docs',
  description: 'A deep dive into DepGraph\'s technology stack and data flow.',
};

export default function ArchitectureDocs() {
  return (
    <>
      <h1>Architecture Overview</h1>
      
      <h2>Stack</h2>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technology</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Frontend</td><td>Next.js 14 (App Router)</td></tr>
          <tr><td>Database</td><td>PostgreSQL (Supabase)</td></tr>
          <tr><td>Cache</td><td>Redis (Upstash)</td></tr>
          <tr><td>Auth</td><td>NextAuth.js + GitHub OAuth</td></tr>
          <tr><td>Hosting</td><td>Vercel</td></tr>
          <tr><td>Payments</td><td>Razorpay</td></tr>
          <tr><td>Email</td><td>Resend</td></tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Data Flow</h2>
      <pre><code>{`User: npx depgraph check
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
Return scored report → CLI (terminal output) or Dashboard (web)`}</code></pre>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Caching Strategy</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>TTL</th>
            <th>Key pattern</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Package score</td><td>24h</td><td><code>pkg:score:npm:{"{name}"}</code></td></tr>
          <tr><td>GitHub signals</td><td>6h</td><td><code>github:repo:{"{owner}"}:{"{repo}"}</code></td></tr>
          <tr><td>npm metadata</td><td>12h</td><td><code>npm:meta:{"{name}"}</code></td></tr>
          <tr><td>OSV data</td><td>24h</td><td><code>osv:npm:{"{name}"}</code></td></tr>
          <tr><td>Full scan report</td><td>1h</td><td><code>scan:report:{"{lockfileHash}"}</code></td></tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Rate Limits</h2>
      <ul>
        <li><strong>GitHub API:</strong> 5,000 req/hr (authenticated) — queue pauses at &lt;100 remaining</li>
        <li><strong>npm registry:</strong> no auth required, generous limits</li>
        <li><strong>OSV.dev:</strong> free, no auth</li>
      </ul>

      <h2>Deployment</h2>
      <ul>
        <li><strong>Web:</strong> Vercel (auto-deploys from <code>main</code>)</li>
        <li><strong>Cron:</strong> Vercel Cron — <code>GET /api/cron/daily-tasks</code> at 08:00 UTC daily</li>
        <li><strong>Environment:</strong> See <code>.env.example</code> for all required variables</li>
      </ul>
    </>
  );
}
