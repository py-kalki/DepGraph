interface CodeLine {
  prompt?: boolean;
  text: string;
  comment?: boolean;
  key?: boolean;
  link?: boolean;
  warn?: boolean;
  bold?: boolean;
}

const workflows: { id: string; label: string; title: string; code: CodeLine[] }[] = [
  {
    id: 'cli',
    label: 'CLI',
    title: 'Instant scan, zero config.',
    code: [
      { prompt: true, text: 'npx depgraph check', key: true },
      { prompt: false, text: '\u2713 Scanning 312 packages...' },
      { prompt: false, text: '\u2713 Fetching GitHub activity...' },
      { prompt: false, text: '' },
      { prompt: false, text: 'Health Score: 42/100 \u26a0 HIGH RISK', warn: true },
      { prompt: false, text: 'Critical: 2  High: 5  Medium: 8' },
      { prompt: false, text: '' },
      { prompt: false, text: 'Report: https://depgraph.dev/r/abc123', link: true },
    ],
  },
  {
    id: 'action',
    label: 'GitHub Action',
    title: 'Block risky merges in CI.',
    code: [
      { prompt: false, text: '# .github/workflows/depgraph.yml', comment: true },
      { prompt: false, text: 'on: [pull_request]', key: true },
      { prompt: false, text: 'jobs:' },
      { prompt: false, text: '  scan:' },
      { prompt: false, text: '    steps:' },
      { prompt: false, text: '      - uses: py-kalki/depgraph-action@v1', key: true },
      { prompt: false, text: '        with:' },
      { prompt: false, text: '          fail_on: critical' },
      { prompt: false, text: '          post_comment: true' },
      { prompt: false, text: '          threshold: 40' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Historical trends, team visibility.',
    code: [
      { prompt: false, text: '\ud83d\udcca Score history: my-saas-app', bold: true },
      { prompt: false, text: '' },
      { prompt: false, text: 'Jun 10  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591  82 \u2192 Healthy' },
      { prompt: false, text: 'Jun  3  \u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591  54 \u2192 Medium' },
      { prompt: false, text: 'May 27  \u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591  42 \u2192 High \u26a0', warn: true },
      { prompt: false, text: '' },
      { prompt: false, text: '\u2193 40pts \u2014 event-stream added May 27', warn: true },
    ],
  },
];

export default function CLISection() {
  return (
    <section
      id="cli"
      style={{
        padding: '8rem 1.5rem',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.875rem',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#888888',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Developer Experience
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
              maxWidth: '800px',
              margin: '0 auto 1.25rem',
            }}
          >
            Works where developers already work.
          </h2>
          <p style={{ color: '#888888', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            CLI, GitHub Action, or web dashboard — all three stay perfectly in sync.
          </p>
        </div>

        {/* Stark Brutalist Grid for Terminal Windows */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="hover-card"
              style={{
                background: '#000000',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Architecture block header */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                  }}
                >
                  {wf.label} <span style={{ color: '#333333' }}>//</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.5rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {wf.title}
                </div>
              </div>

              {/* Monochrome Code Window */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '1.5rem',
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.8,
                }}
              >
                {wf.code.map((line, i) => {
                  // Brutalist styling logic: white for keys/bold/warns, gray for text, dark gray for comments
                  let color = '#888888';
                  let weight: number | string = 400;
                  
                  if (line.key || line.bold || line.warn) {
                    color = '#FFFFFF';
                    weight = 700;
                  } else if (line.comment) {
                    color = '#555555';
                  } else if (line.link) {
                    color = '#CCCCCC';
                    weight = 600;
                  }

                  return (
                    <div key={i} style={{ color, fontWeight: weight }}>
                      {line.prompt && <span style={{ color: '#555555', marginRight: '0.75rem' }}>$</span>}
                      {line.text || '\u00A0'}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
