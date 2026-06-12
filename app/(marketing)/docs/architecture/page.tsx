import CodeBlock from '@/components/docs/CodeBlock';

export const metadata = {
  title: 'Architecture Overview — DepGraph Docs',
  description: "A deep dive into DepGraph's technology stack and data flow.",
};

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.05em', color: '#FFFFFF', marginBottom: '1.5rem', lineHeight: 1.05 }}>{children}</h1>
);
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.875rem', marginTop: '3.5rem', marginBottom: '1.5rem' }}>{children}</h2>
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

const STACK = [
  { layer: 'Frontend', tech: 'Next.js 14 (App Router)' },
  { layer: 'Database', tech: 'PostgreSQL (Supabase)' },
  { layer: 'Cache', tech: 'Redis (Upstash)' },
  { layer: 'Auth', tech: 'NextAuth.js + GitHub OAuth' },
  { layer: 'Hosting', tech: 'Vercel' },
  { layer: 'Payments', tech: 'Razorpay' },
  { layer: 'Email', tech: 'Resend' },
];

const CACHE = [
  { data: 'Package score', ttl: '24h', key: 'pkg:score:npm:{name}' },
  { data: 'GitHub signals', ttl: '6h', key: 'github:repo:{owner}:{repo}' },
  { data: 'npm metadata', ttl: '12h', key: 'npm:meta:{name}' },
  { data: 'OSV data', ttl: '24h', key: 'osv:npm:{name}' },
  { data: 'Full scan report', ttl: '1h', key: 'scan:report:{lockfileHash}' },
];

export default async function ArchitectureDocs() {
  return (
    <div style={{ color: '#FFFFFF' }}>
      <H1>Architecture Overview</H1>
      <P>A technical deep-dive into DepGraph's stack, data flow, and infrastructure decisions.</P>

      <H2>Tech Stack</H2>
      <Table>
        <thead><tr><Th>Layer</Th><Th>Technology</Th></tr></thead>
        <tbody>
          {STACK.map((s) => (
            <tr key={s.layer}><Td>{s.layer}</Td><Td>{s.tech}</Td></tr>
          ))}
        </tbody>
      </Table>

      <H2>Data Flow</H2>
      <P>From a single CLI command to a fully scored report:</P>
      <CodeBlock lang="bash" code={`User: npx depgraph-scanner check
         │
         ▼
CLI reads package.json / package-lock.json
         │
         ▼
POST /api/scan  ← Auth: API key or session
         │
         ▼
Check Redis cache (24hr TTL per package)
   HIT  → return cached scores instantly
   MISS → fetch signals in parallel:
           GitHub API   (commits, contributors, issues)
           npm registry (downloads, metadata)
           OSV.dev      (CVE data)
         │
         ▼
Score engine computes health score (0–100)
         │
         ▼
Store in PostgreSQL + Redis
         │
         ▼
Return scored report
  → CLI       (terminal output)
  → Dashboard (web UI)`} />

      <H2>Caching Strategy</H2>
      <P>All upstream signals are aggressively cached to stay within GitHub API rate limits and minimise latency.</P>
      <Table>
        <thead><tr><Th>Data</Th><Th>TTL</Th><Th>Redis Key Pattern</Th></tr></thead>
        <tbody>
          {CACHE.map((c) => (
            <tr key={c.data}><Td>{c.data}</Td><Td>{c.ttl}</Td><Td>{c.key}</Td></tr>
          ))}
        </tbody>
      </Table>

      <H2>Rate Limits</H2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {[
          { source: 'GitHub API', note: '5,000 req/hr (authenticated) — queue pauses at < 100 remaining' },
          { source: 'npm registry', note: 'No auth required, generous limits' },
          { source: 'OSV.dev', note: 'Free, no auth required' },
        ].map((r) => (
          <li key={r.source} style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
            <span style={{ position: 'absolute', left: 0, color: '#FFFFFF', fontWeight: 700 }}>—</span>
            <strong style={{ color: '#FFFFFF' }}>{r.source}:</strong> {r.note}
          </li>
        ))}
      </ul>

      <H2>Deployment</H2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {([
          { label: 'Web', note: <>Vercel — auto-deploys from <Code>main</Code></> },
          { label: 'Cron', note: <>Vercel Cron — <Code>GET /api/cron/daily-tasks</Code> at 08:00 UTC daily</> },
          { label: 'Environment', note: <>See <Code>.env.example</Code> in the repo for all required variables</> },
        ] as { label: string; note: React.ReactNode }[]).map((d) => (
          <li key={d.label} style={{ paddingLeft: '1.5rem', position: 'relative', fontSize: '0.9375rem', color: '#888888', lineHeight: 1.6 }}>
            <span style={{ position: 'absolute', left: 0, color: '#FFFFFF', fontWeight: 700 }}>—</span>
            <strong style={{ color: '#FFFFFF' }}>{d.label}:</strong> {d.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
