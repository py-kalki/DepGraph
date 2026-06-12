import CodeBlock from '@/components/docs/CodeBlock';

export const metadata = {
  title: 'API Reference — DepGraph Docs',
  description: 'Integrate DepGraph data directly into your own tools using our REST API.',
};

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: '#FFFFFF', marginBottom: '1.5rem', lineHeight: 1.05 }}>{children}</h1>
);
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.875rem', marginTop: '3.5rem', marginBottom: '1.5rem' }}>{children}</h2>
);
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em', marginTop: '2rem', marginBottom: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, marginBottom: '1rem' }}>{children}</p>
);
const Code = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.4rem', color: '#FFFFFF' }}>{children}</code>
);
const Table = ({ children }: { children: React.ReactNode }) => (
  <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>{children}</table>
  </div>
);
const Th = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>{children}</th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td style={{ padding: '0.75rem 1rem', color: '#888888', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>{children}</td>
);
const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = { GET: '#10b981', POST: '#0ea5e9', DELETE: '#ef4444' };
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 700, color: colors[method] ?? '#FFFFFF', border: `1px solid ${colors[method] ?? '#FFFFFF'}`, padding: '0.1rem 0.5rem', marginRight: '0.75rem' }}>
      {method}
    </span>
  );
};

export default async function ApiDocs() {
  return (
    <div style={{ color: '#FFFFFF' }}>
      <H1>API Reference</H1>
      <P>Integrate DepGraph intelligence directly into your own internal tooling using our REST API.</P>

      <H2>Authentication</H2>
      <P>All authenticated endpoints accept either a session cookie (from GitHub OAuth login) or an API key via header:</P>
      <CodeBlock lang="bash" code={`X-API-Key: dg_live_xxxxxxxxxxxxxxxxxxxx`} />

      <H2>Public Endpoints</H2>

      <H3><MethodBadge method="GET" />GET /api/package/:name/score</H3>
      <P>Returns the health score for a single npm package.</P>
      <CodeBlock lang="json" code={`{
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
}`} />

      <H3><MethodBadge method="GET" />GET /api/report/:share_token</H3>
      <P>Returns a full scan report by its public share token.</P>

      <H2>Authenticated Endpoints</H2>

      <H3><MethodBadge method="POST" />POST /api/scan</H3>
      <P>Scan a list of npm packages and return a full scored report.</P>
      <CodeBlock lang="json" code={`{
  "packages": ["express@4.18.2", "lodash@4.17.21"],
  "lockfileHash": "abc123"
}`} />

      <H3><MethodBadge method="POST" />POST /api/projects</H3>
      <P>Create a new saved project in your dashboard.</P>
      <CodeBlock lang="json" code={`{
  "name": "My App",
  "githubRepo": "owner/repo"
}`} />

      <H2>Error Responses</H2>
      <P>All errors follow this envelope format:</P>
      <CodeBlock lang="json" code={`{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}`} />

      <Table>
        <thead><tr><Th>Code</Th><Th>HTTP Status</Th><Th>Meaning</Th></tr></thead>
        <tbody>
          <tr><Td>UNAUTHORIZED</Td><Td>401</Td><Td>Missing or invalid auth</Td></tr>
          <tr><Td>PLAN_REQUIRED</Td><Td>403</Td><Td>Feature requires Pro/Team plan</Td></tr>
          <tr><Td>NOT_FOUND</Td><Td>404</Td><Td>Resource not found</Td></tr>
          <tr><Td>VALIDATION_ERROR</Td><Td>400</Td><Td>Invalid request body</Td></tr>
          <tr><Td>RATE_LIMITED</Td><Td>429</Td><Td>Too many requests</Td></tr>
        </tbody>
      </Table>
    </div>
  );
}
