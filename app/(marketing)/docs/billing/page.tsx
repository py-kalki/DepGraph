export const metadata = {
  title: 'Billing & Plans — DepGraph Docs',
  description: 'Details about DepGraph subscription plans, usage limits, and API keys.',
};

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: '#FFFFFF', marginBottom: '1.5rem', lineHeight: 1.05 }}>
    {children}
  </h1>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.875rem', marginTop: '3.5rem', marginBottom: '1.5rem' }}>
    {children}
  </h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, marginBottom: '1rem' }}>
    {children}
  </p>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.4rem', color: '#FFFFFF' }}>
    {children}
  </code>
);

const Table = ({ children }: { children: React.ReactNode }) => (
  <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      {children}
    </table>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
    {children}
  </th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td style={{ padding: '0.75rem 1rem', color: '#888888', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>
    {children}
  </td>
);

const Check = () => <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>;
const Cross = () => <span style={{ color: '#888888' }}>—</span>;

export default function BillingDocs() {
  return (
    <div style={{ color: '#FFFFFF' }}>
      <H1>Billing & Plans</H1>
      <P>All plans include full access to public npm package scoring. Upgrade to unlock private repos, CI integration, and advanced tooling.</P>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '3.5rem' }}>
        {[
          { name: 'Free', price: '₹0', period: '/forever', desc: 'For individual exploration.' },
          { name: 'Pro', price: '₹799', period: '/month', desc: 'For serious developers and solo teams.' },
          { name: 'Team', price: '₹3,199', period: '/month', desc: 'For organizations at scale.' },
        ].map((plan) => (
          <div key={plan.name} className="hover-card" style={{ background: '#000000', padding: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              {plan.name}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {plan.price}
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#888888' }}>{plan.period}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#888888', marginTop: '0.75rem', lineHeight: 1.5 }}>{plan.desc}</p>
          </div>
        ))}
      </div>

      <H2>Feature Comparison</H2>
      <Table>
        <thead>
          <tr>
            <Th>Feature</Th>
            <Th>Free</Th>
            <Th>Pro</Th>
            <Th>Team</Th>
          </tr>
        </thead>
        <tbody>
          <tr><Td>Saved projects</Td><Td>3</Td><Td>Unlimited</Td><Td>Unlimited</Td></tr>
          <tr><Td>Private repos</Td><Td><Cross /></Td><Td><Check /></Td><Td><Check /></Td></tr>
          <tr><Td>Score history</Td><Td>30 days</Td><Td>12 months</Td><Td>12 months</Td></tr>
          <tr><Td>Email alerts</Td><Td>Weekly digest</Td><Td>Real-time</Td><Td>Real-time</Td></tr>
          <tr><Td>GitHub Action</Td><Td><Cross /></Td><Td><Check /></Td><Td><Check /></Td></tr>
          <tr><Td>SBOM export</Td><Td><Cross /></Td><Td>JSON</Td><Td>CycloneDX</Td></tr>
          <tr><Td>On-demand rescan</Td><Td><Cross /></Td><Td><Check /></Td><Td><Check /></Td></tr>
          <tr><Td>Org dashboard</Td><Td><Cross /></Td><Td><Cross /></Td><Td><Check /></Td></tr>
          <tr><Td>Slack integration</Td><Td><Cross /></Td><Td><Cross /></Td><Td><Check /></Td></tr>
          <tr><Td>Priority support</Td><Td><Cross /></Td><Td><Cross /></Td><Td><Check /></Td></tr>
        </tbody>
      </Table>

      <H2>Usage Limits</H2>
      <Table>
        <thead>
          <tr>
            <Th>Limit</Th>
            <Th>Free</Th>
            <Th>Pro</Th>
            <Th>Team</Th>
          </tr>
        </thead>
        <tbody>
          <tr><Td>Scan requests / day</Td><Td>10</Td><Td>Unlimited</Td><Td>Unlimited</Td></tr>
          <tr><Td>GitHub Action runs</Td><Td><Cross /></Td><Td>Unlimited</Td><Td>Unlimited</Td></tr>
          <tr><Td>API keys</Td><Td>0</Td><Td>5</Td><Td>20</Td></tr>
        </tbody>
      </Table>

      <H2>Subscription Management</H2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {[
          <>Upgrade at <a href="/pricing" style={{ color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '3px' }}>depgraph.vedanshh.dev/pricing</a></>,
          <>Billing powered by Razorpay — INR pricing, UPI supported</>,
          <>Cancel anytime — access continues until the current period ends</>,
          <>Downgrade takes effect at the next billing cycle</>,
        ].map((item, i) => (
          <li key={i} style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
            <span style={{ position: 'absolute', left: 0, color: '#FFFFFF', fontWeight: 700 }}>—</span>
            {item}
          </li>
        ))}
      </ul>

      <H2>API Key Access</H2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {[
          <>API keys are available on Pro and Team plans</>,
          <>Generate at <a href="/settings/api" style={{ color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Settings → API Keys</a></>,
          <>Keys are shown once on creation — store them securely (e.g. a password manager)</>,
          <>Use as <Code>DEPGRAPH_API_KEY</Code> repository secret for the GitHub Action</>,
        ].map((item, i) => (
          <li key={i} style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
            <span style={{ position: 'absolute', left: 0, color: '#FFFFFF', fontWeight: 700 }}>—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
