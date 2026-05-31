'use client';
// =============================================================================
// DepGraph — ErrorState
// Error fallback with retry button.
// =============================================================================

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: Props) {
  return (
    <div className="state-container" role="alert" aria-live="assertive">
      <div className="state-icon" aria-hidden="true">⚠️</div>
      <h2 className="state-title">{title}</h2>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <button
          className="state-action"
          onClick={onRetry}
          type="button"
          id="error-state-retry"
        >
          Try again
        </button>
      )}
    </div>
  );
}
