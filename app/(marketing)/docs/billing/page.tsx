export const metadata = {
  title: 'Billing & Plans — DepGraph Docs',
  description: 'Details about DepGraph subscription plans, usage limits, and API keys.',
};

export default function BillingDocs() {
  return (
    <>
      <h1>Billing & Plans</h1>
      
      <h2>Plans Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Free</th>
            <th>Pro ($19/mo)</th>
            <th>Team ($79/mo)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Saved projects</td><td>3</td><td>Unlimited</td><td>Unlimited</td></tr>
          <tr><td>Private repos</td><td>❌</td><td>✅</td><td>✅</td></tr>
          <tr><td>Score history</td><td>30 days</td><td>12 months</td><td>12 months</td></tr>
          <tr><td>Email alerts</td><td>Weekly digest</td><td>Real-time</td><td>Real-time</td></tr>
          <tr><td>GitHub Action</td><td>❌</td><td>✅</td><td>✅</td></tr>
          <tr><td>SBOM export</td><td>❌</td><td>JSON</td><td>CycloneDX</td></tr>
          <tr><td>On-demand rescan</td><td>❌</td><td>✅</td><td>✅</td></tr>
          <tr><td>Org dashboard</td><td>❌</td><td>❌</td><td>✅</td></tr>
          <tr><td>Slack integration</td><td>❌</td><td>❌</td><td>✅</td></tr>
          <tr><td>Priority support</td><td>❌</td><td>❌</td><td>✅</td></tr>
        </tbody>
      </table>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Subscription Management</h2>
      <ul>
        <li>Upgrade at <a href="/pricing" style={{ color: 'var(--brand-primary)' }}>depgraph.vedanshh.dev/pricing</a></li>
        <li>Billing powered by Razorpay</li>
        <li>Cancel anytime — access continues until period end</li>
        <li>Downgrade takes effect at next billing cycle</li>
      </ul>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>API Key Access</h2>
      <ul>
        <li>API keys are available on Pro and Team plans</li>
        <li>Generate at <a href="/settings/api" style={{ color: 'var(--brand-primary)' }}>depgraph.vedanshh.dev/settings/api</a></li>
        <li>Keys are shown once on creation — store them securely</li>
        <li>Use as <code>DEPGRAPH_API_KEY</code> repository secret for GitHub Action</li>
      </ul>

      <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

      <h2>Usage Limits</h2>
      <table>
        <thead>
          <tr>
            <th>Limit</th>
            <th>Free</th>
            <th>Pro</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Scan requests/day</td><td>10</td><td>Unlimited</td><td>Unlimited</td></tr>
          <tr><td>GitHub Action runs</td><td>❌</td><td>Unlimited</td><td>Unlimited</td></tr>
          <tr><td>API key count</td><td>0</td><td>5</td><td>20</td></tr>
        </tbody>
      </table>
    </>
  );
}
