// =============================================================================
// DepGraph — CriticalDepsSection
// PRD §F-03: "Top 5 critical dependencies (action required)"
// =============================================================================
import { CheckCircle2 } from 'lucide-react';

interface DepEntry {
  name: string;
  version: string | null;
  score: number;
  risk_level: string;
}

interface Props {
  deps: DepEntry[];
}

export function CriticalDepsSection({ deps }: Props) {
  const critical = deps
    .filter((d) => d.risk_level === 'critical')
    .sort((a, b) => a.score - b.score) // worst first
    .slice(0, 5);

  if (critical.length === 0) {
    return (
      <div className="card hover-card" role="region" aria-label="Critical dependencies">
        <div className="card-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>Critical Dependencies</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem 1rem', color: '#888888' }}>
          <CheckCircle2 size={32} color="#1D9E75" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>No critical dependencies</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover-card" role="region" aria-label="Critical dependencies — action required" style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="card-title" style={{ margin: 0 }}>Critical Dependencies</div>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6875rem',
            color: '#000000',
            fontWeight: 700,
            background: '#FFFFFF',
            padding: '0.2rem 0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
          aria-label={`${critical.length} critical dependencies`}
        >
          {critical.length} Action Required
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {critical.map((dep, idx) => (
          <div key={dep.name} style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: idx < critical.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.25rem', fontWeight: 700, color: '#E24B4A', display: 'flex', alignItems: 'center' }}
              aria-label={`Score: ${dep.score}`}
            >
              {dep.score}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {dep.name}
                {dep.version && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#666666', fontWeight: 400 }}>
                    @{dep.version}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#888888', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review immediately</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
