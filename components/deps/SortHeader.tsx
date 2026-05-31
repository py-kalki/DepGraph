// =============================================================================
// DepGraph — SortHeader
// Clickable column header with sort direction indicator.
// =============================================================================

interface Props {
  label: string;
  sortKey: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export function SortHeader({ label, sortKey, active, dir, onSort }: Props) {
  return (
    <button
      className={`sort-btn${active ? ' active' : ''}`}
      onClick={() => onSort(sortKey)}
      type="button"
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      id={`sort-${sortKey}`}
    >
      {label}
      <span className="sort-icon" aria-hidden="true">
        {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
      </span>
    </button>
  );
}
