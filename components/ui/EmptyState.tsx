import { LucideIcon } from 'lucide-react';

// =============================================================================
// DepGraph — EmptyState
// Zero-data placeholder for when no projects or no deps exist.
// =============================================================================

interface Props {
  icon?: string; // For legacy emojis if any sneak through
  IconComponent?: LucideIcon; // For new lucide icons
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({ icon, IconComponent, title, description, actionLabel, onAction, actionHref }: Props) {
  return (
    <div 
      role="status" 
      aria-label={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        border: '1px dashed rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.02)',
        textAlign: 'center',
      }}
    >
      <div aria-hidden="true" style={{ marginBottom: '1.5rem', color: '#888888' }}>
        {IconComponent ? <IconComponent size={32} /> : (icon && <span style={{ fontSize: '2rem' }}>{icon}</span>)}
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ color: '#888888', maxWidth: '400px', lineHeight: 1.6, marginBottom: actionLabel ? '2rem' : 0 }}>
        {description}
      </p>
      {actionLabel && (
        onAction ? (
          <button 
            onClick={onAction} 
            type="button" 
            id="empty-state-action"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#FFFFFF',
              color: '#000000',
              border: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {actionLabel}
          </button>
        ) : actionHref ? (
          <a 
            href={actionHref} 
            id="empty-state-action"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#FFFFFF',
              color: '#000000',
              textDecoration: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'opacity 0.2s',
            }}
          >
            {actionLabel}
          </a>
        ) : null
      )}
    </div>
  );
}
