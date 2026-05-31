// =============================================================================
// DepGraph — RiskBadge (shared UI)
// Color dot + text label. Never color-only — WCAG 2.1 AA.
// =============================================================================

const RISK_COLORS: Record<string, string> = {
  critical: 'var(--color-critical)',
  high:     'var(--color-high)',
  medium:   'var(--color-medium)',
  low:      'var(--color-low)',
  healthy:  'var(--color-healthy)',
};

interface Props {
  risk: string;
}

export function RiskBadge({ risk }: Props) {
  const color = RISK_COLORS[risk] ?? 'var(--text-muted)';

  return (
    <span
      className={`risk-badge ${risk}`}
      aria-label={`Risk level: ${risk}`}
    >
      <span
        className="risk-badge-dot"
        style={{ background: color }}
        aria-hidden="true"
      />
      {risk}
    </span>
  );
}
