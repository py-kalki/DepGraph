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

  // SVG arc — 270° sweep, starting from bottom-left
  const R = 54;
  const CX = 64;
  const CY = 72;
  const TOTAL_ANGLE = 270;
  const START_ANGLE = 135; // degrees

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(pct: number) {
    const sweep = TOTAL_ANGLE * (pct / 100);
    const endAngle = START_ANGLE + sweep;
    const start = polarToCartesian(CX, CY, R, START_ANGLE);
    const end = polarToCartesian(CX, CY, R, endAngle);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  return (
    <div className="score-gauge-wrap" role="img" aria-label={`Health score: ${score} out of 100`}>
      <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
        {/* Background track */}
        <path
          d={arcPath(100)}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={arcPath(animated)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.3s' }}
        />
      </svg>

      <div className="score-gauge-number" style={{ color }}>
        {score}
      </div>
      <div className="score-gauge-label">Health Score</div>
      <div className="risk-badge" style={{ marginTop: '0.25rem' }}>
        <span
          className="risk-badge-dot"
          style={{ background: color }}
          aria-hidden="true"
        />
        {risk}
      </div>
    </div>
  );
}
