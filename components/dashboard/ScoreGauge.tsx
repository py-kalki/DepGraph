'use client';
// =============================================================================
// DepGraph — ScoreGauge
// SVG arc gauge displaying the project health score 0–100.
// Color changes by risk band per PRD §14 color system.
// =============================================================================

import { useEffect, useState } from 'react';

interface Props {
  score: number;
}

const RISK_COLORS: Record<string, string> = {
  critical: '#E24B4A',
  high: '#EF9F27',
  medium: '#EAB308',
  low: '#378ADD',
  healthy: '#1D9E75',
};

function scoreToRisk(score: number): string {
  if (score < 20) return 'critical';
  if (score < 40) return 'high';
  if (score < 60) return 'medium';
  if (score < 75) return 'low';
  return 'healthy';
}

export function ScoreGauge({ score }: Props) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(score));
    return () => cancelAnimationFrame(t);
  }, [score]);

  const risk = scoreToRisk(score);
  const color = RISK_COLORS[risk];

  // Brutalist sharp ring
  const R = 58;
  const CX = 64;
  const CY = 64;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;

  return (
    <div className="card hover-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem' }}>
      <div style={{ position: 'relative', width: '128px', height: '128px' }} role="img" aria-label={`Health score: ${score} out of 100`}>
        <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          {/* Score arc */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="score-gauge-number" style={{ color: '#FFFFFF', fontSize: '2.5rem' }}>
            {score}
          </div>
        </div>
      </div>

      <div className="score-gauge-label" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Health Score</div>
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.35rem',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6875rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: color
      }}>
        <span style={{ width: '6px', height: '6px', background: color }} aria-hidden="true" />
        {risk}
      </div>
    </div>
  );
}
