// =============================================================================
// DepGraph — EmptyState
// Zero-data placeholder for when no projects or no deps exist.
// =============================================================================

interface Props {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({ icon = '📦', title, description, actionLabel, onAction, actionHref }: Props) {
  return (
    <div className="state-container" role="status" aria-label={title}>
      <div className="state-icon" aria-hidden="true">{icon}</div>
      <h2 className="state-title">{title}</h2>
      <p className="state-desc">{description}</p>
      {actionLabel && (
        onAction ? (
          <button className="state-action" onClick={onAction} type="button" id="empty-state-action">
            {actionLabel}
          </button>
        ) : actionHref ? (
          <a href={actionHref} className="state-action" id="empty-state-action">
            {actionLabel}
          </a>
        ) : null
      )}
    </div>
  );
}
