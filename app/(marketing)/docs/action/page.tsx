export const metadata = {
  title: 'GitHub Action Guide — DepGraph Docs',
  description: 'How to integrate DepGraph into your CI/CD pipelines.',
};

export default function ActionDocs() {
  return (
    <>
      <h1>GitHub Action Guide</h1>
      
      <h2>Installation</h2>
      <p>Add this workflow file to your repository at <code>.github/workflows/depgraph.yml</code>:</p>
      <pre><code>{`name: Dependency Health Check

on: [pull_request]

jobs:
  depgraph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: depgraph/action@v1
        with:
          api-key: \${{ secrets.DEPGRAPH_API_KEY }}
          fail-on: critical
          post-comment: true`}</code></pre>
      
      <p>Add your API key as a repository secret named <code>DEPGRAPH_API_KEY</code>. Get your key at <a href="/settings/api" style={{ color: 'var(--brand-primary)' }}>depgraph.vedanshh.dev/settings/api</a>.</p>
      
      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <h2>Inputs</h2>
      <table>
        <thead>
          <tr>
            <th>Input</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>api-key</code></td>
            <td>✅</td>
            <td>—</td>
            <td>API key from depgraph.vedanshh.dev (Pro/Team plan required)</td>
          </tr>
          <tr>
            <td><code>fail-on</code></td>
            <td>❌</td>
            <td><code>critical</code></td>
            <td>Threshold for CI failure: <code>none | critical | high | medium</code></td>
          </tr>
          <tr>
            <td><code>post-comment</code></td>
            <td>❌</td>
            <td><code>true</code></td>
            <td>Post or update a PR comment with the health report</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Outputs</h2>
      <table>
        <thead>
          <tr>
            <th>Output</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>overall-score</code></td>
            <td>Project health score (0–100)</td>
          </tr>
          <tr>
            <td><code>critical-count</code></td>
            <td>Number of critical-risk new dependencies</td>
          </tr>
          <tr>
            <td><code>high-count</code></td>
            <td>Number of high-risk new dependencies</td>
          </tr>
          <tr>
            <td><code>report-url</code></td>
            <td>Public URL to the full scan report</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Advanced Examples</h2>
      
      <h3>Warning-only mode (no failures)</h3>
      <pre><code>{`- uses: depgraph/action@v1
  with:
    api-key: \${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: none
    post-comment: true`}</code></pre>

      <h3>Strict mode — fail on any medium+ risk</h3>
      <pre><code>{`- uses: depgraph/action@v1
  with:
    api-key: \${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: medium
    post-comment: true`}</code></pre>

    </>
  );
}
