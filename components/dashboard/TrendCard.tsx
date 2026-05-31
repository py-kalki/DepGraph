// =============================================================================
// DepGraph — TrendCard
// Displays overall score + week-over-week trend arrow.
// =============================================================================

import type { ScoreHistoryPoint } from '@/lib/db/queries/history';

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

  const arrowMap = { up: '↑', down: '↓', flat: '→' };
  const classMap = { up: 'trend-up', down: 'trend-down', flat: 'trend-flat' };

  return (
    <div className="card" role="region" aria-label="Score trend">
      <div className="card-title">Score Trend</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '1rem' }}>
        <span
          style={{ fontFamily: 'var(--font-mono)', fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}
        >
          {score}
        </span>
        <span
          className={`trend-arrow ${classMap[direction]}`}
          aria-label={
            direction === 'flat'
              ? 'No change'
              : `${direction === 'up' ? 'Up' : 'Down'} ${Math.abs(delta)} points`
          }
        >
          {arrowMap[direction]}
          {delta !== 0 && (
            <span style={{ fontSize: '0.875rem', marginLeft: '0.125rem' }}>
              {Math.abs(delta)}
            </span>
          )}
        </span>
      </div>
      <p className="text-sm text-muted" style={{ marginTop: '0.375rem' }}>
        {history.length > 1 ? 'vs. 30 days ago' : 'First scan — no history yet'}
      </p>
    </div>
  );
}
