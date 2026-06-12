import CodeBlock from '@/components/docs/CodeBlock';

export const metadata = {
  title: 'GitHub Action Guide — DepGraph Docs',
  description: 'How to integrate DepGraph into your CI/CD pipelines.',
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

export default async function ActionDocs() {
  return (
    <div style={{ color: '#FFFFFF' }}>
      <H1>GitHub Action Guide</H1>
      <P>Automate dependency health checks on every pull request. Fail CI on critical risk before code merges.</P>

      <H2>Quick Setup</H2>
      <P>Add this workflow file to your repository at <Code>.github/workflows/depgraph.yml</Code>:</P>
      <CodeBlock lang="yaml" code={`name: Dependency Health Check

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
          post-comment: true`} />

      <P>Add your API key as a repository secret named <Code>DEPGRAPH_API_KEY</Code>. Generate your key at <a href="/settings/api" style={{ color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Settings → API Keys</a>.</P>

      <H2>Inputs</H2>
      <Table>
        <thead><tr><Th>Input</Th><Th>Required</Th><Th>Default</Th><Th>Description</Th></tr></thead>
        <tbody>
          <tr><Td>api-key</Td><Td>Yes</Td><Td>—</Td><Td>API key from dashboard (Pro plan required)</Td></tr>
          <tr><Td>fail-on</Td><Td>No</Td><Td>critical</Td><Td>none | critical | high | medium</Td></tr>
          <tr><Td>post-comment</Td><Td>No</Td><Td>true</Td><Td>Post health report as PR comment</Td></tr>
        </tbody>
      </Table>

      <H2>Outputs</H2>
      <Table>
        <thead><tr><Th>Output</Th><Th>Description</Th></tr></thead>
        <tbody>
          <tr><Td>overall-score</Td><Td>Project health score (0–100)</Td></tr>
          <tr><Td>critical-count</Td><Td>Number of critical-risk new dependencies</Td></tr>
          <tr><Td>high-count</Td><Td>Number of high-risk new dependencies</Td></tr>
          <tr><Td>report-url</Td><Td>Public URL to the full scan report</Td></tr>
        </tbody>
      </Table>

      <H2>Advanced Examples</H2>
      <H3>Warning-only mode (no build failures)</H3>
      <CodeBlock lang="yaml" code={`- uses: depgraph/action@v1
  with:
    api-key: \${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: none
    post-comment: true`} />

      <H3>Strict mode — fail on any medium+ risk</H3>
      <CodeBlock lang="yaml" code={`- uses: depgraph/action@v1
  with:
    api-key: \${{ secrets.DEPGRAPH_API_KEY }}
    fail-on: medium
    post-comment: true`} />
    </div>
  );
}
