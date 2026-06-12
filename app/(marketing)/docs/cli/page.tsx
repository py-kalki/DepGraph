import CodeBlock from '@/components/docs/CodeBlock';

export const metadata = {
  title: 'CLI Guide — DepGraph Docs',
  description: 'How to use the DepGraph CLI to scan your projects.',
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
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em', marginTop: '2rem', marginBottom: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
    {children}
  </h3>
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

export default async function CliDocs() {
  return (
    <div style={{ color: '#FFFFFF' }}>
      <H1>CLI Guide</H1>
      <P>Scan your project's dependency tree from the terminal in seconds. Zero configuration required.</P>

      <H2>Installation</H2>
      <P>Run instantly with <Code>npx</Code> — no install step needed:</P>
      <CodeBlock lang="bash" code={`npx depgraph-scanner check`} />
      <P>Or install globally for frequent use:</P>
      <CodeBlock lang="bash" code={`npm install -g depgraph\ndepgraph check`} />

      <H2>Commands</H2>
      <H3>$ depgraph check</H3>
      <P>Scan the current project's dependencies and return a scored report.</P>
      <CodeBlock lang="bash" code={`npx depgraph-scanner check [options]`} />

      <P>Options:</P>
      <Table>
        <thead><tr><Th>Flag</Th><Th>Default</Th><Th>Description</Th></tr></thead>
        <tbody>
          <tr><Td>--path &lt;dir&gt;</Td><Td>.</Td><Td>Directory containing package.json</Td></tr>
          <tr><Td>--format &lt;fmt&gt;</Td><Td>table</Td><Td>Output format: table | json</Td></tr>
          <tr><Td>--threshold &lt;n&gt;</Td><Td>none</Td><Td>Exit 1 if project score &lt; n</Td></tr>
          <tr><Td>--depth &lt;n&gt;</Td><Td>2</Td><Td>Transitive dependency depth</Td></tr>
          <tr><Td>--no-color</Td><Td>—</Td><Td>Disable color output</Td></tr>
        </tbody>
      </Table>

      <H2>Output Format</H2>
      <CodeBlock lang="bash" code={`DepGraph v1.0 — Scanning 247 dependencies...

  Project Health Score: 71 / 100  ████████░░

  CRITICAL (2)
  ─────────────────────────────────────────
  ✗  event-stream    Score: 12   Last commit: 3yr ago
     ↳ Abandoned. Migrate to mitt or eventemitter3.

  HIGH (7)  MEDIUM (18)  LOW (41)  HEALTHY (179)

  Full report: https://depgraph.vedanshh.dev/r/a3f9x2k1`} />

      <H2>Exit Codes</H2>
      <Table>
        <thead><tr><Th>Code</Th><Th>Meaning</Th></tr></thead>
        <tbody>
          <tr><Td>0</Td><Td>All checks passed</Td></tr>
          <tr><Td>1</Td><Td>Score below --threshold</Td></tr>
          <tr><Td>2</Td><Td>Error (network failure, invalid project)</Td></tr>
        </tbody>
      </Table>

      <H2>Authentication</H2>
      <P>Link CLI scans to your Pro dashboard with GitHub OAuth:</P>
      <CodeBlock lang="bash" code={`npx depgraph-scanner auth`} />
      <P>This opens a browser window for GitHub login and writes your API key to <Code>~/.depgraph/config.json</Code>.</P>

      <H2>JSON Output (for CI)</H2>
      <CodeBlock lang="bash" code={`npx depgraph-scanner check --format json | jq '.overallScore'`} />
    </div>
  );
}
