export const metadata = {
  title: 'API Reference — DepGraph Docs',
  description: 'Integrate DepGraph data directly into your own tools using our REST API.',
};

export default function ApiDocs() {
  return (
    <>
      <h1>API Reference</h1>
      
      <h2>Authentication</h2>
      <p>All authenticated endpoints accept either:</p>
      <ul>
        <li><strong>Session cookie</strong> (from dashboard login via GitHub OAuth)</li>
        <li><strong>API key</strong> via <code>X-API-Key</code> header (for CLI and GitHub Action)</li>
      </ul>
      <pre><code>X-API-Key: dg_live_xxxxxxxxxxxxxxxxxxxx</code></pre>
      
      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <h2>Public Endpoints</h2>
      
      <h3><code>GET /api/package/:name/score</code></h3>
      <p>Returns the health score for a single npm package.</p>
      <p><strong>Response:</strong></p>
      <pre><code>{`{
  "packageName": "express",
  "score": 71,
  "riskLevel": "stable",
  "abandonmentRisk": false,
  "dimensions": { 
    "maintenance": 68, 
    "busFactor": 75, 
    "issueHealth": 72, 
    "downloadTrend": 80, 
    "depFreshness": 60, 
    "vulnerability": 70 
  },
  "topFactors": [
    { "label": "Maintenance", "reason": "Last commit 4 months ago" },
    { "label": "Dep Freshness", "reason": "3 dependencies 2+ major versions behind" }
  ],
  "computedAt": "2026-06-01T00:00:00Z"
}`}</code></pre>

      <h3><code>GET /api/report/:share_token</code></h3>
      <p>Returns a full scan report by its public share token.</p>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Authenticated Endpoints</h2>

      <h3><code>POST /api/scan</code></h3>
      <p>Scan a list of npm packages and return a full scored report.</p>
      <p><strong>Body:</strong></p>
      <pre><code>{`{ 
  "packages": ["express@4.18.2", "lodash@4.17.21"], 
  "lockfileHash": "abc123" 
}`}</code></pre>

      <h3><code>POST /api/projects</code></h3>
      <p>Create a new saved project.</p>
      <p><strong>Body:</strong></p>
      <pre><code>{`{ 
  "name": "My App", 
  "githubRepo": "owner/repo" 
}`}</code></pre>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Error Responses</h2>
      <p>All errors follow this format:</p>
      <pre><code>{`{ 
  "error": "Human-readable message", 
  "code": "ERROR_CODE" 
}`}</code></pre>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Status</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>UNAUTHORIZED</code></td>
            <td>401</td>
            <td>Missing or invalid auth</td>
          </tr>
          <tr>
            <td><code>PLAN_REQUIRED</code></td>
            <td>403</td>
            <td>Feature requires Pro/Team plan</td>
          </tr>
          <tr>
            <td><code>NOT_FOUND</code></td>
            <td>404</td>
            <td>Resource not found</td>
          </tr>
          <tr>
            <td><code>VALIDATION_ERROR</code></td>
            <td>400</td>
            <td>Invalid request body</td>
          </tr>
          <tr>
            <td><code>RATE_LIMITED</code></td>
            <td>429</td>
            <td>Too many requests</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
