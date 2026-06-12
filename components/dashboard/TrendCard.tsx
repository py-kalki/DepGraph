// =============================================================================
// DepGraph — TrendCard
// Displays overall score + week-over-week trend arrow.
// =============================================================================

import type { ScoreHistoryPoint } from '@/lib/db/queries/history';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  score: number;
  history: ScoreHistoryPoint[];
}

function computeTrend(history: ScoreHistoryPoint[]): { delta: number; direction: 'up' | 'down' | 'flat' } {
  if (history.length < 2) return { delta: 0, direction: 'flat' };

  // Compare most recent score to 7+ days ago
  const now = history[history.length - 1].score;
  const past = history[0].score;
  const delta = now - past;

  if (delta > 0) return { delta, direction: 'up' };
  if (delta < 0) return { delta, direction: 'down' };
  return { delta: 0, direction: 'flat' };
}

export function TrendCard({ score, history }: Props) {
  const { delta, direction } = computeTrend(history);

  const IconMap = { 
    up: TrendingUp, 
    down: TrendingDown, 
    flat: Minus 
  };
  const colorMap = {
    up: '#1D9E75', // healthy green
    down: '#E24B4A', // critical red
    flat: '#888888' // muted gray
  };
  
  const TrendIcon = IconMap[direction];
  const trendColor = colorMap[direction];

  return (
    <div className="card hover-card" role="region" aria-label="Score trend">
      <div className="card-title">Score Trend</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '1rem' }}>
        <span
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: '#FFFFFF' }}
        >
          {score}
        </span>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trendColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.875rem' }}
          aria-label={
            direction === 'flat'
              ? 'No change'
              : `${direction === 'up' ? 'Up' : 'Down'} ${Math.abs(delta)} points`
          }
        >
          <TrendIcon size={16} strokeWidth={3} />
          {delta !== 0 && <span>{Math.abs(delta)}</span>}
        </span>
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#888888', fontFamily: 'JetBrains Mono, monospace' }}>
        {history.length > 1 ? 'vs. 30 days ago' : 'First scan — no history yet'}
      </p>
    </div>
  );
}
