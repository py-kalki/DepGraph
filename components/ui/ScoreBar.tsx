// =============================================================================
// DepGraph — ScoreBar (shared UI)
// Inline horizontal fill bar. Color-coded by risk band.
// =============================================================================

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

interface Props {
  score: number;
  showNumber?: boolean;
}

export function ScoreBar({ score, showNumber = true }: Props) {
  const risk = scoreToRisk(score);
  const color = RISK_COLORS[risk];

  return (
    <div className="score-bar-wrap">
      <div
        className="score-bar"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Health score: ${score} out of 100`}
      >
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      {showNumber && (
        <span className="score-bar-num mono" style={{ color }} aria-hidden="true">
          {score}
        </span>
      )}
    </div>
  );
}
