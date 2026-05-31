'use client';
// =============================================================================
// DepGraph — FilterControls
// Risk-level chip buttons. Multi-select; "All" resets all filters.
// =============================================================================

const LEVELS = ['critical', 'high', 'medium', 'low', 'healthy'] as const;

interface Props {
  active: string[];
  onChange: (filters: string[]) => void;
}

export function FilterControls({ active, onChange }: Props) {
  function toggle(level: string) {
    if (active.includes(level)) {
      onChange(active.filter((f) => f !== level));
    } else {
      onChange([...active, level]);
    }
  }

  const allActive = active.length === 0;

  return (
    <div className="filter-chips" role="group" aria-label="Filter by risk level">
      <button
        id="filter-all"
        className={`chip${allActive ? ' active all' : ''}`}
        onClick={() => onChange([])}
        type="button"
        aria-pressed={allActive}
      >
        All
      </button>
      {LEVELS.map((level) => (
        <button
          key={level}
          id={`filter-${level}`}
          className={`chip${active.includes(level) ? ` active ${level}` : ''}`}
          onClick={() => toggle(level)}
          type="button"
          aria-pressed={active.includes(level)}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  );
}
