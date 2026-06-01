export const metadata = {
  title: 'CLI Guide — DepGraph Docs',
  description: 'How to use the DepGraph CLI to scan your projects.',
};

export default function CliDocs() {
  return (
    <>
      <h1>CLI Guide</h1>
      
      <h2>Installation</h2>
      <p>No installation required. You can run it instantly using <code>npx</code>:</p>
      <pre><code>npx depgraph check</code></pre>
      
      <p>Or install it globally if you prefer:</p>
      <pre><code>npm install -g depgraph
depgraph check</code></pre>
      
      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <h2>Commands</h2>
      <h3><code>depgraph check</code></h3>
      <p>Scan the current project's dependencies.</p>
      <pre><code>npx depgraph check [options]</code></pre>
      
      <h4>Options</h4>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>--path &lt;dir&gt;</code></td>
            <td><code>.</code></td>
            <td>Directory containing <code>package.json</code></td>
          </tr>
          <tr>
            <td><code>--format &lt;fmt&gt;</code></td>
            <td><code>table</code></td>
            <td>Output format: <code>table | json</code></td>
          </tr>
          <tr>
            <td><code>--threshold &lt;n&gt;</code></td>
            <td>none</td>
            <td>Exit 1 if project score &lt; n</td>
          </tr>
          <tr>
            <td><code>--depth &lt;n&gt;</code></td>
            <td>2</td>
            <td>Transitive dependency depth</td>
          </tr>
          <tr>
            <td><code>--no-color</code></td>
            <td>—</td>
            <td>Disable color output</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Output Format</h2>
      <pre><code>DepGraph v1.0 — Scanning 247 dependencies...

  Project Health Score: 71 / 100  ████████░░

  CRITICAL (2)
  ─────────────────────────────────────────
  ✗  event-stream    Score: 12   Last commit: 3yr ago
     ↳ Abandoned. Migrate to mitt or eventemitter3.

  HIGH (7)  MEDIUM (18)  LOW (41)  HEALTHY (179)

  Full report: https://depgraph.vedanshh.dev/r/a3f9x2k1</code></pre>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Exit Codes</h2>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>0</code></td>
            <td>All checks passed</td>
          </tr>
          <tr>
            <td><code>1</code></td>
            <td>Score below <code>--threshold</code></td>
          </tr>
          <tr>
            <td><code>2</code></td>
            <td>Error (network failure, invalid project)</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Authentication</h2>
      <p>If you have a Pro account and want to link your scans to your dashboard:</p>
      <pre><code>npx depgraph auth</code></pre>
      <p>This opens a browser for GitHub OAuth login and writes your API key to <code>~/.depgraph/config.json</code>.</p>

      <h2>JSON Output (for CI)</h2>
      <pre><code>npx depgraph check --format json | jq '.overallScore'</code></pre>
    </>
  );
}
