// =============================================================================
// DepGraph — RecentChangesSection
// PRD §F-03: "Recent score changes (what got worse this week)"
// Compares two scans — shows deps that have gotten worse.
// In Week 3 we surface deps at high/critical risk as proxies for "got worse".
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

export function RecentChangesSection({ deps }: Props) {
  // Surface high + critical deps as likely recent concerns
  const concerning = deps
    .filter((d) => d.risk_level === 'critical' || d.risk_level === 'high')
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <div className="card hover-card" role="region" aria-label="Recent score changes" style={{ padding: 0 }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="card-title" style={{ margin: 0 }}>High Risk This Scan</div>
      </div>
      
      {concerning.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem 1rem', color: '#888888' }}>
          <CheckCircle2 size={32} color="#1D9E75" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>No high-risk dependencies</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {concerning.map((dep, idx) => (
            <div
              key={dep.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: idx < concerning.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {dep.name}
                {dep.version && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#666666', fontWeight: 400 }}>
                    @{dep.version}
                  </span>
                )}
              </span>
              <span
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  marginLeft: '1rem', 
                  flexShrink: 0,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: dep.risk_level === 'critical' ? '#E24B4A' : '#EF9F27'
                }}
                aria-label={`Risk level: ${dep.risk_level}`}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    background: dep.risk_level === 'critical' ? '#E24B4A' : '#EF9F27'
                  }}
                  aria-hidden="true"
                />
                {dep.risk_level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
